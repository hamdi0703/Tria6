
import React from 'react';
import { Movie } from '../../types';
import { BACKDROP_BASE_URL, IMAGE_BASE_URL } from '../../services/tmdbService';

interface DetailHeroProps {
  movie: Movie;
  onBack: () => void;
  onToggleCollection: (movie: Movie) => void;
  isInCollection: boolean;
}

const DetailHero: React.FC<DetailHeroProps> = ({ movie, onBack, onToggleCollection, isInCollection }) => {
  const backdropUrl = movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : null;
  const posterUrl = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null;
  
  const title = movie.title || movie.name;
  
  // Format Date
  const year = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : (movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : '');

  // Format Runtime
  const formatRuntime = (mins?: number) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}sa ${m}dk` : `${m}dk`;
  };
  
  const runtimeDisplay = movie.runtime 
    ? formatRuntime(movie.runtime) 
    : (movie.episode_run_time?.[0] ? `${movie.episode_run_time[0]} dk` : '');

  // Network Logo Logic (Take the first network)
  const network = movie.networks?.[0];
  const networkLogoUrl = network?.logo_path ? `${IMAGE_BASE_URL}${network.logo_path}` : null;

  // Status Logic
  const getStatusBadge = () => {
      if (!movie.status) return null;
      if (movie.status === 'Returning Series') {
          return (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/20 border border-green-500/30 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Devam Ediyor</span>
              </div>
          );
      }
      if (movie.status === 'Ended') {
          return (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/20 border border-red-500/30 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Final Yaptı</span>
              </div>
          );
      }
      if (movie.status === 'Canceled') {
          return (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-500/20 border border-neutral-500/30 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-neutral-500"></span>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">İptal Edildi</span>
              </div>
          );
      }
      return null;
  };

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden group">
        
        {/* 1. BACKGROUND LAYER (Blurred & Darkened) */}
        <div className="absolute inset-0 bg-neutral-900">
            {backdropUrl ? (
                 <>
                    <img 
                        src={backdropUrl} 
                        alt="" 
                        className="w-full h-full object-cover opacity-60 scale-105 group-hover:scale-100 transition-transform duration-[20s] ease-out"
                    />
                    {/* Cinematic Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-vista-light via-vista-light/20 to-transparent dark:from-[#000000] dark:via-[#000000]/40 dark:to-black/60"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent"></div>
                 </>
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-black"></div>
            )}
        </div>

        {/* 2. TOP NAV (Floating) */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-50 safe-top">
            <button 
                onClick={onBack}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 shadow-lg group/btn"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6 group-hover/btn:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
        </div>

        {/* 3. MAIN CONTENT CONTAINER */}
        <div className="absolute inset-0 flex items-end justify-center z-40 pb-8 md:pb-16 px-4 md:px-12 lg:px-20">
            <div className="w-full max-w-[1400px] flex flex-col md:flex-row items-end gap-6 md:gap-8 animate-slide-in-up">
                
                {/* POSTER CARD (Vertical Cover) - Hidden on very small screens, visible on md+ */}
                {posterUrl && (
                    <div className="hidden md:block flex-shrink-0 w-48 lg:w-80 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/10 relative group/poster rotate-1 hover:rotate-0 transition-transform duration-500">
                        <img 
                            src={posterUrl} 
                            alt={title} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity"></div>
                    </div>
                )}

                {/* TEXT INFO */}
                <div className="flex-1 min-w-0 flex flex-col items-start gap-3 md:gap-6 text-shadow-sm w-full">
                    
                    {/* NETWORK LOGO (IF TV SHOW) */}
                    {networkLogoUrl && (
                        <div className="mb-1 md:mb-2 bg-white/10 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-white/10">
                            <img 
                                src={networkLogoUrl} 
                                alt={network?.name} 
                                className="h-4 md:h-6 w-auto object-contain brightness-0 invert opacity-90" 
                            />
                        </div>
                    )}

                    {/* Metadata Badges (Mobile Row) */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        {getStatusBadge()}
                        {year && <span className="bg-white/20 backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded border border-white/10">{year}</span>}
                        {runtimeDisplay && <span className="bg-white/20 backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded border border-white/10">{runtimeDisplay}</span>}
                        <div className="flex items-center gap-1 bg-amber-500 text-black text-[10px] md:text-xs font-black px-2 py-1 rounded shadow-lg shadow-amber-500/20">
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            <span>{movie.vote_average.toFixed(1)}</span>
                        </div>
                    </div>

                    {/* Title - Responsive Font Size */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1] tracking-tight drop-shadow-2xl line-clamp-3 md:line-clamp-2">
                        {title}
                    </h1>

                    {/* Tagline */}
                    {movie.tagline && (
                        <p className="hidden md:block text-white/90 text-sm md:text-xl italic font-light border-l-4 border-indigo-500 pl-4 py-1 max-w-3xl">
                            "{movie.tagline}"
                        </p>
                    )}

                    {/* Genres (Mobile Optimized Scroll) */}
                    <div className="flex flex-wrap gap-2 w-full overflow-x-auto no-scrollbar pb-1">
                        {movie.genres?.map(g => (
                            <span key={g.id} className="text-[10px] md:text-sm text-neutral-300 font-medium hover:text-white transition-colors cursor-default bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5 whitespace-nowrap">
                                {g.name}
                            </span>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex w-full md:w-auto mt-2">
                        <button 
                            onClick={() => onToggleCollection(movie)}
                            className={`flex-1 md:flex-none h-12 md:h-14 px-6 md:px-8 rounded-2xl font-bold text-sm md:text-base transition-all flex items-center justify-center gap-2 md:gap-3 shadow-2xl transform active:scale-95 ${
                                isInCollection 
                                ? 'bg-neutral-900/90 text-green-400 border border-green-500/30' 
                                : 'bg-white text-black hover:bg-neutral-200'
                            }`}
                        >
                            {isInCollection ? (
                                <>
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span>Koleksiyonda</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    <span>Listeye Ekle</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DetailHero;
