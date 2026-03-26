
import { supabase } from './supabaseClient';
import { Movie, MatchSession } from '../types';

export const matchService = {
    // Oturum Oluştur
    async createSession(hostId: string, genreIds: number[] | null, movies: Movie[]) {
        // 6 haneli rastgele kod
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        const { data, error } = await supabase
            .from('match_sessions')
            .insert({
                code,
                host_id: hostId,
                genre_ids: genreIds, 
                status: 'WAITING',
                movie_queue: movies
            })
            .select()
            .single();
            
        if (error) throw error;
        return data as MatchSession;
    },

    // Oturuma Katıl
    async joinSession(code: string, guestId: string) {
        // 1. ADIM: Sadece KOD ile oturumu bul (Durumuna bakma, önce var mı ona bak)
        const { data: session, error: findError } = await supabase
            .from('match_sessions')
            .select('*')
            .eq('code', code)
            .single();

        if (findError || !session) {
            throw new Error("Geçersiz kod. Oturum bulunamadı.");
        }

        // 2. ADIM: Kendi oturumuna katılmayı engelle (EN ÖNEMLİ KONTROL)
        if (session.host_id === guestId) {
            throw new Error("SELF_JOIN_ERROR");
        }

        // 3. ADIM: Oturum durumunu kontrol et
        if (session.status !== 'WAITING') {
            throw new Error("Bu oturum dolmuş veya çoktan başlamış.");
        }

        // 4. ADIM: Guest olarak güncelle ve durumu ACTIVE yap
        const { data: updatedSession, error: updateError } = await supabase
            .from('match_sessions')
            .update({ 
                guest_id: guestId,
                status: 'ACTIVE'
            })
            .eq('id', session.id)
            .select()
            .single();

        if (updateError) throw updateError;
        return updatedSession as MatchSession;
    },

    // Oy Ver
    async submitVote(sessionId: string, userId: string, movie: Movie, voteType: 'LIKE' | 'DISLIKE') {
        const { error } = await supabase
            .from('match_votes')
            .upsert({
                session_id: sessionId,
                user_id: userId,
                movie_id: movie.id,
                vote_type: voteType,
                movie_data: movie 
            }, { 
                onConflict: 'session_id, user_id, movie_id' 
            });
            
        if (error) throw error;
    },

    // Eşleşme Kontrolü (Tekil)
    async checkMatch(sessionId: string, movieId: number) {
        const { data, error } = await supabase
            .from('match_votes')
            .select('user_id')
            .eq('session_id', sessionId)
            .eq('movie_id', movieId)
            .eq('vote_type', 'LIKE');

        if (error) return false;
        // Farklı kullanıcılardan en az 2 LIKE varsa eşleşme vardır
        const uniqueUsers = new Set(data.map(d => d.user_id));
        return uniqueUsers.size >= 2;
    },

    // Tüm Eşleşmeleri Getir (Senkronizasyon ve Polling İçin)
    async getConfirmedMatches(sessionId: string) {
        // Sadece LIKE oylarını getir
        const { data, error } = await supabase
            .from('match_votes')
            .select('movie_id, movie_data, user_id')
            .eq('session_id', sessionId)
            .eq('vote_type', 'LIKE');

        if (error || !data) return [];

        // Oyları grupla: Hangi filme kaç farklı kişi LIKE vermiş?
        const voteCounts: Record<number, { count: number, users: Set<string>, movie: Movie }> = {};
        
        data.forEach((row: any) => {
            if (!voteCounts[row.movie_id]) {
                voteCounts[row.movie_id] = { count: 0, users: new Set(), movie: row.movie_data };
            }
            // Aynı kullanıcının mükerrer oylarını engellemek için Set kullan
            voteCounts[row.movie_id].users.add(row.user_id);
        });

        // Sadece 2 veya daha fazla farklı kullanıcının beğendiği filmleri döndür
        return Object.values(voteCounts)
            .filter(item => item.users.size >= 2)
            .map(item => item.movie);
    }
};
