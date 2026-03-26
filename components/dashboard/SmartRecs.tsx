
import React, { useEffect, useState } from 'react';
import { Movie, Genre, MediaType } from '../../types';
import { TmdbService } from '../../services/tmdbService';
import { useReviewContext } from '../../context/ReviewContext';
import MovieCard from '../MovieCard';

interface SmartRecsProps {
  collectionMovies: Movie[]; 
  stats: any; 
  genres: Genre[];
  existingMovieIds: Set<number>;
  onSelectMovie: (movie: Movie) => void;
  onToggleCollection: (movie: Movie) => void;
  checkIsSelected: (id: number) => boolean;
  type: MediaType;
}

const SmartRecs: React.FC<SmartRecsProps> = ({ 
    collectionMovies,
    stats, 
    genres, 
    existingMovieIds, 
    onSelectMovie,
    onToggleCollection,
    checkIsSelected,
    type
}) => {
  const { reviews } = useReviewContext();
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [recReason, setRecReason] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchRecs = async () => {
        // Reset recommendations when type changes to prevent showing Movies in TV tab momentarily
        setRecommendations([]);
        setLoading(true); // Start loading immediately

        // Basic requirement check
        if (!collectionMovies || collectionMovies.length < 1) {
             setLoading(false);
             return;
        }

        const tmdb = new TmdbService();
        
        try {
            let freshRecs: Movie[] = [];
            
            // --- 1. SMART SEEDING STRATEGY ---
            // Priority: Rated > 7 -> Rated > 5 -> Any in Collection
            
            let potentialSeeds = collectionMovies.filter(m => {
                const userRating = reviews[m.id]?.rating;
                return userRating && userRating >= 8;
            });

            if (potentialSeeds.length === 0) {
                potentialSeeds = collectionMovies.filter(m => {
                    const userRating = reviews[m.id]?.rating;
                    return userRating && userRating >= 6;
                });
            }

            if (potentialSeeds.length === 0) {
                potentialSeeds = collectionMovies;
            }

            // Pick a random seed
            const seedMovie = potentialSeeds[Math.floor(Math.random() * potentialSeeds.length)];

            // --- STRATEGY SELECTION ---
            const strategyRoll = Math.random();
            
            // STRATEGY A: DIRECT SIMILARITY (High Quality Seed)
            // CRITICAL FIX: Pass 'type' to getRecommendations to support TV Shows correctly
            if (strategyRoll < 0.6 && seedMovie) {
                try {
                    const data = await tmdb.getRecommendations(seedMovie.id, type);
                    
                    if (data.results.length > 0) {
                        const title = seedMovie.title || seedMovie.name || 'seçtiğin içerik';
                        setRecReason(`"${title}" tarzını sevdiğin için seçtik.`);
                        freshRecs = data.results;
                    }
                } catch (err) {
                    // Fail silently and try strategy B
                    console.warn("Recs fetch error, falling back");
                }
            }

            // STRATEGY B: GENRE DISCOVERY (If A failed or wasn't picked)
            if (freshRecs.length === 0 && stats) {
                // Find Top Genre
                const sortedGenres = Object.entries(stats.genreCounts).sort((a: any, b: any) => b[1] - a[1]);
                const topGenreId = sortedGenres.length > 0 ? parseInt(sortedGenres[0][0]) : null;
                const genreName = genres.find(g => g.id === topGenreId)?.name || 'bu türde';

                if (topGenreId) {
                    // Check Recency Preference (Handles both Movie release_date and TV first_air_date)
                    const currentYear = new Date().getFullYear();
                    const hasModernTaste = collectionMovies.some(m => {
                        const dateStr = m.release_date || m.first_air_date || '1990-01-01';
                        const y = parseInt(dateStr.substring(0,4));
                        return y >= (currentYear - 3);
                    });

                    const sortBy = hasModernTaste ? 'popularity.desc' : 'vote_average.desc';
                    const randomPage = Math.floor(Math.random() * 3) + 1; 

                    // CRITICAL FIX: Pass 'type' to discoverMovies
                    const data = await tmdb.discoverMovies(randomPage, sortBy, topGenreId, undefined, type);
                    
                    setRecReason(`${genreName} türündeki en kaliteli ${type === 'movie' ? 'filmler' : 'diziler'}.`);
                    freshRecs = data.results;
                }
            }

            // --- 2. QUALITY GATE ---
            const MIN_VOTE_COUNT = 100; // Lowered slightly for TV shows which might have fewer votes
            
            const filtered = freshRecs
                .filter(m => !existingMovieIds.has(m.id))
                .filter(m => m.poster_path && m.backdrop_path)
                .filter(m => m.vote_count >= MIN_VOTE_COUNT)
                .filter(m => !m.adult)
                .slice(0, 5);

            if (filtered.length > 0) {
                setRecommendations(filtered);
            } else {
                // Absolute Fallback: Trending
                setRecReason(type === 'movie' ? "Haftanın popüler filmleri." : "Haftanın popüler dizileri.");
                // Note: getTrending usually defaults to movies, we need specific trending for type if possible or generic discover
                const fallbackData = await tmdb.discoverMovies(1, 'popularity.desc', undefined, undefined, type);
                setRecommendations(fallbackData.results
                    .filter(m => !existingMovieIds.has(m.id))
                    .slice(0, 5)
                );
            }

        } catch (e) {
            console.error("SmartRecs failed", e);
        } finally {
            setLoading(false);
        }
    };

    fetchRecs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, refreshTrigger]); // Re-run when Type changes (Movie <-> TV) or Refresh is clicked

  const handleRefresh = () => {
      setRefreshTrigger(prev => prev + 1);
  };

  if (loading) return (
      <div className="h-64 rounded-[2rem] bg-neutral-100 dark:bg-neutral-900/50 animate-pulse border border-neutral-200 dark:border-neutral-800 mb-12 flex items-center justify-center">
          <div className="text-neutral-400 text-sm font-medium animate-bounce">
              {type === 'movie' ? 'Filmler taranıyor...' : 'Diziler analiz ediliyor...'}
          </div>
      </div>
  );
  
  if (recommendations.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-900/10 to-purple-900/10 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-[2rem] p-6 md:p-8 mb-12 border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden animate-slide-in-up">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-lg shadow-indigo-500/30">
                            Tria AI
                        </span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            {type === 'movie' ? 'Film Önerisi' : 'Dizi Önerisi'}
                        </span>
                    </div>
                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white leading-tight">
                        Sıradaki Favorin Olabilir
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-lg">
                        {recReason}
                    </p>
                </div>

                {/* Refresh Button */}
                <button 
                    onClick={handleRefresh}
                    disabled={loading}
                    className="group flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-black/20 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 backdrop-blur-md rounded-xl border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className={`w-4 h-4 transition-transform ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{loading ? 'Analiz Ediliyor...' : 'Yenile'}</span>
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recommendations.map((movie) => (
                    <div key={movie.id} className="relative group">
                        <MovieCard 
                            movie={movie}
                            isSelected={checkIsSelected(movie.id)}
                            onToggleSelect={onToggleCollection}
                            onClick={onSelectMovie}
                            allGenres={genres}
                            mediaType={type}
                        />
                        {/* High Match Badge */}
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 flex items-center gap-1">
                            <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            %90+ Eşleşme
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default SmartRecs;
