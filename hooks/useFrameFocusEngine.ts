
import { useReducer, useEffect, useCallback, useRef } from 'react';
import { Movie } from '../types';
import { TmdbService, BACKDROP_BASE_URL } from '../services/tmdbService';
import { SoundManager, calculateScore } from '../utils/frameFocusUtils';

// --- TYPES ---
export type GameStatus = 'IDLE' | 'LOADING' | 'PLAYING' | 'REVEAL' | 'GAME_OVER';
export type DistortionMode = 'BLUR'; // Strict type
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type GameMode = 'TIMED' | 'ZEN';

export interface GameFilters {
    genreId: number | null;
    year: number | null; // Decade
    difficulty: Difficulty;
    mode: GameMode;
}

export interface GameState {
    status: GameStatus;
    score: number;
    lives: number;
    round: number;
    timeLeft: number;
    currentMovie: Movie | null;
    nextQueue: Movie[]; 
    preloadedImages: Map<number, HTMLImageElement>;
    distortionMode: DistortionMode;
    distortionLevel: number; // 0-100
    enhanceCount: number; 
    filters: GameFilters; 
    streak: number;
    lastResult: 'CORRECT' | 'WRONG' | 'TIMEOUT' | 'SKIP' | null;
    hints: {
        genre: boolean;
        year: boolean;
    };
}

type Action = 
    | { type: 'START_GAME'; payload: { filters: GameFilters } }
    | { type: 'SET_MOVIES'; payload: Movie[] }
    | { type: 'IMAGE_LOADED'; payload: { id: number; img: HTMLImageElement } }
    | { type: 'NEXT_ROUND' }
    | { type: 'TICK' }
    | { type: 'USE_HINT'; payload: 'genre' | 'year' | 'enhance' }
    | { type: 'SUBMIT_GUESS'; payload: { success: boolean; points?: number; type: 'CORRECT' | 'WRONG' | 'TIMEOUT' } }
    | { type: 'SKIP' }
    | { type: 'GAME_OVER' }
    | { type: 'RESET' };

const INITIAL_LIVES = 3;
const ROUND_DURATION = 30; // UPDATED: 30 seconds max

const initialState: GameState = {
    status: 'IDLE',
    score: 0,
    lives: INITIAL_LIVES,
    round: 0,
    timeLeft: ROUND_DURATION,
    currentMovie: null,
    nextQueue: [],
    preloadedImages: new Map(),
    distortionMode: 'BLUR',
    distortionLevel: 100, 
    enhanceCount: 0,
    filters: { genreId: null, year: null, difficulty: 'MEDIUM', mode: 'TIMED' },
    streak: 0,
    lastResult: null,
    hints: { genre: false, year: false },
};

// --- REDUCER ---
const gameReducer = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'START_GAME':
            return { 
                ...initialState, 
                status: 'LOADING', 
                distortionMode: 'BLUR',
                filters: action.payload.filters,
                preloadedImages: new Map() 
            };
        case 'SET_MOVIES':
            const newQueue = [...state.nextQueue, ...action.payload].filter(
                (v, i, a) => a.findIndex(t => t.id === v.id) === i
            );
            return { ...state, nextQueue: newQueue };
        case 'IMAGE_LOADED':
            const newMap = new Map(state.preloadedImages);
            newMap.set(action.payload.id, action.payload.img);
            return { ...state, preloadedImages: newMap };
        case 'NEXT_ROUND':
            const nextIdx = state.nextQueue.findIndex(m => state.preloadedImages.has(m.id));
            
            if (nextIdx === -1 && state.nextQueue.length > 0) return { ...state, status: 'LOADING' };
            if (nextIdx === -1 && state.nextQueue.length === 0) return { ...state, status: 'LOADING' }; 

            const nextMovie = state.nextQueue[nextIdx];
            const remainingQueue = state.nextQueue.filter((_, i) => i !== nextIdx);
            
            return {
                ...state,
                status: 'PLAYING',
                round: state.round + 1,
                timeLeft: ROUND_DURATION,
                currentMovie: nextMovie,
                nextQueue: remainingQueue,
                distortionLevel: 100, // Reset to 100
                enhanceCount: 0,
                lastResult: null,
                hints: { genre: false, year: false }
            };
        case 'TICK':
            // Zen Mode: Timer doesn't tick down
            if (state.filters.mode === 'ZEN') return state;
            if (state.timeLeft <= 0) return state; 
            return { ...state, timeLeft: state.timeLeft - 1 };
        case 'USE_HINT':
            const type = action.payload;
            
            if (type === 'enhance') {
                return { 
                    ...state, 
                    distortionLevel: Math.max(0, state.distortionLevel - 10), // Reduce blur by 10%
                    enhanceCount: state.enhanceCount + 1
                };
            } else if (type === 'genre') {
                const hintCost = 25;
                return { ...state, score: Math.max(0, state.score - hintCost), hints: { ...state.hints, genre: true } };
            } else if (type === 'year') {
                const hintCost = 25;
                return { ...state, score: Math.max(0, state.score - hintCost), hints: { ...state.hints, year: true } };
            }
            return state;
        case 'SUBMIT_GUESS':
            if (action.payload.success) {
                return {
                    ...state,
                    status: 'REVEAL',
                    score: state.score + (action.payload.points || 0),
                    distortionLevel: 0, 
                    streak: state.streak + 1,
                    lastResult: 'CORRECT'
                };
            } else {
                const newLives = state.lives - 1;
                // DÜZELTME: Can 0 olsa bile direkt GAME_OVER yerine REVEAL yapıyoruz.
                // Bu sayede aşağıdaki useEffect hook'u tetikleniyor ve kullanıcıya sonucu gösterdikten sonra
                // 1.5 saniye gecikmeli olarak GAME_OVER ekranına geçiyor.
                return {
                    ...state,
                    status: 'REVEAL', 
                    lives: newLives,
                    streak: 0,
                    distortionLevel: 0, 
                    lastResult: action.payload.type
                };
            }
        case 'SKIP':
             const livesAfterSkip = state.lives - 1;
             // DÜZELTME: Burada da direkt GAME_OVER yerine REVEAL yapıyoruz.
             return {
                ...state,
                status: 'REVEAL',
                lives: livesAfterSkip,
                streak: 0,
                distortionLevel: 0,
                lastResult: 'SKIP'
            };
        case 'GAME_OVER':
            return { ...state, status: 'GAME_OVER', distortionLevel: 0 };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
};

// --- HOOK ---
export const useFrameFocusEngine = () => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const tmdbRef = useRef(new TmdbService());
    const processedIds = useRef(new Set<number>());
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        SoundManager.preload();
    }, []);

    // 1. Fetch Logic
    const fetchMovies = useCallback(async () => {
        try {
            let maxPagePool = 5; 
            if (state.filters.difficulty === 'MEDIUM') maxPagePool = 15;
            if (state.filters.difficulty === 'HARD') maxPagePool = 25;

            const sortBy = 'vote_count.desc';

            const initialCheck = await tmdbRef.current.discoverMovies(
                1, 
                sortBy, 
                state.filters.genreId || undefined, 
                undefined,
                'movie',
                state.filters.year || undefined,
                50 
            );

            const availablePages = initialCheck.total_pages;
            
            if (availablePages === 0) {
                console.warn("Filtrelerle sonuç bulunamadı.");
            }

            const effectiveMaxPage = Math.min(maxPagePool, availablePages);
            const randomPage = Math.floor(Math.random() * effectiveMaxPage) + 1;

            const res = await tmdbRef.current.discoverMovies(
                randomPage, 
                sortBy, 
                state.filters.genreId || undefined, 
                undefined, 
                'movie',
                state.filters.year || undefined, 
                50
            );
            
            // --- SHUFFLE LOGIC START ---
            // API genellikle popülariteye göre sıralı döner.
            // Oyunun tahmin edilebilir olmaması için sayfadaki 20 filmi karıştırıyoruz.
            const shuffledResults = res.results.sort(() => Math.random() - 0.5);
            // --- SHUFFLE LOGIC END ---

            const validMovies = shuffledResults.filter(m => 
                m.backdrop_path && 
                !processedIds.current.has(m.id)
            );

            validMovies.forEach(m => {
                processedIds.current.add(m.id);
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = `${BACKDROP_BASE_URL}${m.backdrop_path}?t=${new Date().getTime()}`;
                img.onload = () => {
                    dispatch({ type: 'IMAGE_LOADED', payload: { id: m.id, img } });
                };
            });

            if (validMovies.length > 0) {
                dispatch({ type: 'SET_MOVIES', payload: validMovies });
            }
        } catch (e) {
            console.error("Game Fetch Error", e);
        }
    }, [state.round, state.filters]);

    // 2. Prefetch
    useEffect(() => {
        if ((state.status === 'LOADING' || state.status === 'PLAYING') && state.nextQueue.length < 3) {
            fetchMovies();
        }
    }, [state.nextQueue.length, state.status, fetchMovies]);

    // 3. Round Mgmt
    useEffect(() => {
        if (state.status === 'LOADING') {
            const hasReadyImage = state.nextQueue.some(m => state.preloadedImages.has(m.id));
            if (hasReadyImage) {
                dispatch({ type: 'NEXT_ROUND' });
            }
        }
    }, [state.status, state.nextQueue, state.preloadedImages]);

    // 4. Timer (Running but respecting Zen mode in reducer)
    useEffect(() => {
        if (state.status === 'PLAYING') {
            timerRef.current = setInterval(() => {
                dispatch({ type: 'TICK' });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [state.status]);

    // 5. Timeout
    useEffect(() => {
        if (state.status === 'PLAYING' && state.filters.mode === 'TIMED') {
            // Update: Sound warning at 10 seconds
            if (state.timeLeft <= 10 && state.timeLeft > 0) SoundManager.play('TICK');
            if (state.timeLeft === 0) handleGuessResult({ success: false, type: 'TIMEOUT' });
        }
    }, [state.timeLeft, state.status, state.filters.mode]);

    // 6. Reveal Handling & GAME OVER TRIGGER
    useEffect(() => {
        if (state.status === 'REVEAL') {
            // Sadece CAN BİTTİYSE otomatik Game Over yap, yoksa kullanıcı "Sonraki"ye basana kadar bekle.
            if (state.lives <= 0) {
                const timeout = setTimeout(() => {
                    SoundManager.play('GAMEOVER');
                    dispatch({ type: 'GAME_OVER' });
                }, 1500); // 1.5 saniye sonucu göster, sonra bitir
                return () => clearTimeout(timeout);
            }
        }
    }, [state.status, state.lives]);


    // --- ACTIONS ---

    const startGame = (filters: GameFilters = { genreId: null, year: null, difficulty: 'MEDIUM', mode: 'TIMED' }) => {
        dispatch({ type: 'START_GAME', payload: { filters } });
    };

    const handleGuessResult = (result: { success: boolean, points?: number, type: 'CORRECT' | 'WRONG' | 'TIMEOUT' }) => {
        if (result.success) SoundManager.play('CORRECT');
        else SoundManager.play('WRONG');
        
        dispatch({ type: 'SUBMIT_GUESS', payload: result });
    };

    const submitGuess = (movie: Movie) => {
        if (state.status !== 'PLAYING') return;

        if (movie.id === state.currentMovie?.id) {
            // NEW SCORING: Blur (0-1000) + Time (0-300)
            const points = calculateScore(state.distortionLevel, state.timeLeft, state.filters.mode);
            handleGuessResult({ success: true, points, type: 'CORRECT' });
        } else {
            handleGuessResult({ success: false, type: 'WRONG' });
        }
    };

    const skipRound = () => {
        if (state.status !== 'PLAYING') return;
        SoundManager.play('WRONG');
        dispatch({ type: 'SKIP' });
    }

    const nextRound = () => {
        dispatch({ type: 'NEXT_ROUND' });
    }

    const useHint = (type: 'genre' | 'year' | 'enhance') => {
        dispatch({ type: 'USE_HINT', payload: type });
    }

    const enhanceImage = () => {
        useHint('enhance');
    };

    return {
        state,
        startGame,
        submitGuess,
        skipRound,
        nextRound, // Exposed for manual transition
        enhanceImage,
        useHint,
        dispatch
    };
};
