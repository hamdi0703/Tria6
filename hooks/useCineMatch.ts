
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { matchService } from '../services/matchService';
import { TmdbService } from '../services/tmdbService';
import { MatchSession, Movie, SessionFilters } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const POLLING_INTERVAL = 4000; // 4 seconds

export const useCineMatch = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const tmdb = new TmdbService();

    // State
    const [session, setSession] = useState<MatchSession | null>(null);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [matches, setMatches] = useState<Movie[]>([]);
    const [lastMatch, setLastMatch] = useState<Movie | null>(null); 
    const [loading, setLoading] = useState(false);

    // REFS FOR RACE CONDITION HANDLING
    const isFetchingRef = useRef(false);
    const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Eşleşmeleri Sunucudan Çek ve Senkronize Et
    const syncMatches = useCallback(async () => {
        if (!session?.id) return;
        
        // --- RACE CONDITION FIX: LOCKING ---
        // Eğer zaten bir istek varsa yenisini başlatma
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        
        try {
            const confirmedMatches = await matchService.getConfirmedMatches(session.id);
            
            setMatches(prevMatches => {
                // Yeni bulunan eşleşmeleri belirle
                const prevIds = new Set(prevMatches.map(m => m.id));
                const newItems = confirmedMatches.filter(m => !prevIds.has(m.id));
                
                // Eğer yeni bir eşleşme varsa ve popup açık değilse popup aç
                if (newItems.length > 0) {
                    setLastMatch(newItems[newItems.length - 1]);
                }

                // Listeyi güncelle (Eskiler + Yeniler)
                const mergedMap = new Map();
                prevMatches.forEach(m => mergedMap.set(m.id, m));
                confirmedMatches.forEach(m => mergedMap.set(m.id, m));
                
                return Array.from(mergedMap.values());
            });
        } catch (e) {
            console.error("Sync error:", e);
        } finally {
            // İşi bitince kilidi aç
            isFetchingRef.current = false;
        }
    }, [session?.id]);

    // Polling'i yeniden başlatmak için yardımcı fonksiyon
    const restartPolling = useCallback(() => {
        if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = setInterval(syncMatches, POLLING_INTERVAL);
    }, [syncMatches]);

    // REALTIME & POLLING SETUP
    useEffect(() => {
        if (!session) return;

        // 1. İlk Yükleme
        syncMatches();

        // 2. Realtime Abonelik
        const channel = supabase
            .channel(`session-${session.id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'match_sessions', filter: `id=eq.${session.id}` },
                (payload) => {
                    const newSession = payload.new as MatchSession;
                    if (newSession.status !== session.status) {
                        setSession(newSession);
                    }
                    if (newSession.status === 'ACTIVE' && session.status === 'WAITING') {
                        showToast('Arkadaşın katıldı! Başlıyoruz...', 'success');
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'match_votes', filter: `session_id=eq.${session.id}` },
                async () => {
                    // --- REALTIME EVENT FIX ---
                    // Anlık bildirim geldiğinde:
                    // 1. Polling sayacını durdur (Gereksiz çakışmayı önle)
                    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
                    
                    // 2. Hemen veriyi çek
                    await syncMatches();
                    
                    // 3. Polling'i sıfırdan başlat
                    restartPolling();
                }
            )
            .subscribe();

        // 3. Başlangıçta Polling'i Başlat
        restartPolling();

        return () => {
            supabase.removeChannel(channel);
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        };
    }, [session?.id, session?.status, syncMatches, restartPolling]);

    // Host: Oturum Başlat
    const startSession = async (filters: SessionFilters) => {
        if (!user) {
            showToast('Giriş yapmalısınız.', 'error');
            return;
        }
        setLoading(true);
        try {
            let runtimeMin, runtimeMax;
            if (filters.duration === 'SHORT') { runtimeMax = 90; }
            else if (filters.duration === 'MEDIUM') { runtimeMin = 90; runtimeMax = 120; }
            else if (filters.duration === 'LONG') { runtimeMin = 120; }

            const discoveryOptions = {
                minRating: filters.minRating > 0 ? filters.minRating : undefined,
                runtimeMin,
                runtimeMax
            };

            const genreParam = filters.genres.length > 0 ? filters.genres : undefined;
            const decadeParam = filters.year ? filters.year : undefined; 

            const p1 = await tmdb.discoverMovies(1, 'popularity.desc', genreParam, undefined, filters.mediaType, decadeParam, 50, discoveryOptions);
            const p2 = await tmdb.discoverMovies(2, 'popularity.desc', genreParam, undefined, filters.mediaType, decadeParam, 50, discoveryOptions);
            
            const pool = [...p1.results, ...p2.results]
                .filter(m => m.poster_path) 
                .filter(m => m.backdrop_path) 
                .sort(() => 0.5 - Math.random()) 
                .slice(0, 30); 

            if (pool.length === 0) {
                throw new Error("Bu kriterlere uygun içerik bulunamadı.");
            }

            const newSession = await matchService.createSession(user.id, filters.genres.length > 0 ? filters.genres : null, pool);
            
            setSession(newSession);
            setMovies(pool);
        } catch (e: any) {
            console.error("Session start error:", e);
            showToast(e.message || 'Oturum oluşturulamadı.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Guest: Oturuma Katıl
    const joinSession = async (code: string) => {
        if (!user) return;
        setLoading(true);
        try {
            const joinedSession = await matchService.joinSession(code, user.id);
            setSession(joinedSession);
            if (joinedSession.movie_queue) {
                setMovies(joinedSession.movie_queue);
            }
        } catch (e: any) {
            throw e;
        } finally {
            setLoading(false);
        }
    };

    // Oyla (Swipe)
    const vote = async (direction: 'LEFT' | 'RIGHT') => {
        if (!session || !user || !movies[currentIndex]) return;

        const movie = movies[currentIndex];
        const voteType = direction === 'RIGHT' ? 'LIKE' : 'DISLIKE';

        setCurrentIndex(prev => prev + 1);

        try {
            await matchService.submitVote(session.id, user.id, movie, voteType);
        } catch (e) {
            console.error("Vote failed", e);
        }
    };

    const closeMatchPopup = () => setLastMatch(null);

    return {
        user,
        session,
        movies,
        currentIndex,
        matches,
        lastMatch,
        loading,
        startSession,
        joinSession,
        vote,
        closeMatchPopup,
        isFinished: movies.length > 0 && currentIndex >= movies.length
    };
};
