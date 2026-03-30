
import React, { useState, useEffect } from 'react';
import { Movie, Genre, UserReview } from '../types';
import { useReviews } from '../hooks/useReviews';

// TMDB Görüntü Boyutları Sabitleri
const BASE_IMG_URL = 'https://image.tmdb.org/t/p/';

interface MovieCardProps {
  movie: Movie;
  isSelected?: boolean;
  onToggleSelect?: (movie: Movie) => void;
  onClick?: (movie: Movie) => void; // This is now "Go to Detail"
  allGenres?: Genre[];
  mediaType?: 'movie' | 'tv'; 
  hideSelection?: boolean;
  ownerReview?: UserReview;
  priority?: boolean;
  isMultiSelectMode?: boolean; // NEW PROP
  ownerReviewInfo?: { hasComment: boolean; rating?: number } | null;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  isSelected = false, 
  onToggleSelect, 
  onClick, 
  hideSelection = false,
  ownerReview,
  priority = false,
  isMultiSelectMode = false,
  ownerReviewInfo
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const { review: myReview } = useReviews(movie.id);

  const effectiveIsSelected = hideSelection ? false : isSelected;
  
  const title = movie.title || movie.name || 'Untitled';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  
  useEffect(() => {
      setHasError(false);
      setIsLoaded(false);
  }, [movie.id, movie.poster_path]);

  // Image Source Set Construction
  const posterPath = movie.poster_path;
  const srcSet = posterPath ? 
    `${BASE_IMG_URL}w342${posterPath} 342w, ${BASE_IMG_URL}w500${posterPath} 500w, ${BASE_IMG_URL}w780${posterPath} 780w` 
    : undefined;
  
  // Default src (fallback and largest for high-res)
  const imageUrl = posterPath ? `${BASE_IMG_URL}w500${posterPath}` : null;

  const displayReview = ownerReview || myReview;
  const displayReviewRating = displayReview?.rating;

  // --- HANDLERS ---
  const handleMainClick = (e: React.MouseEvent) => {
    // 1. Çoklu Seçim Modundaysak -> Direkt Seç/Bırak
    if (isMultiSelectMode) {
        if (onToggleSelect && !hideSelection) {
            if (navigator.vibrate) navigator.vibrate(50);
            onToggleSelect(movie);
        }
        return;
    }

    // 2. Normal Moddaysak -> Detaya Git
    if (onClick) {
        onClick(movie);
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Karta tıklamayı engelle (Detaya gitmesin)
      if (onToggleSelect) {
          if (navigator.vibrate) navigator.vibrate(50);
          onToggleSelect(movie);
      }
  };

  return (
    <div 
        className="group relative w-full aspect-[2/3] perspective-1000 animate-fade-in select-none z-base"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* 1. SELECTION GLOW (Multi-Select Mode) */}
      {isMultiSelectMode && effectiveIsSelected && (
          <div className="absolute -inset-1 rounded-2xl border-4 border-indigo-500 z-20 pointer-events-none shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
      )}

      {/* 2. MAIN CARD CONTAINER */}
      <div 
        onClick={handleMainClick}
        className={`relative z-10 w-full h-full rounded-2xl overflow-hidden bg-neutral-900 shadow-2xl cursor-pointer transform transition-all duration-300 ease-out border border-white/10
            ${isMultiSelectMode 
                ? (effectiveIsSelected ? 'scale-95' : 'active:scale-95 hover:scale-[0.98]') 
                : 'active:scale-95 group-hover:scale-[1.02]'
            }
        `}
      >
        {/* Loading Skeleton */}
        {!isLoaded && !hasError && imageUrl && (
            <div className="absolute inset-0 bg-neutral-800 animate-pulse flex items-center justify-center pointer-events-none z-0">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
            </div>
        )}

        {/* Poster Image with SrcSet Optimization */}
        {!hasError && imageUrl ? (
            <img
                src={imageUrl}
                srcSet={srcSet}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                alt={title}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                decoding={priority ? "sync" : "async"}
                className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'} ${effectiveIsSelected && isMultiSelectMode ? 'grayscale-[50%] opacity-50' : 'group-hover:contrast-110'}`}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
            />
        ) : (
            <div className="w-full h-full bg-neutral-800 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                <svg className="w-12 h-12 text-neutral-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-neutral-500 font-medium line-clamp-3 z-10">{title}</span>
            </div>
        )}
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 pointer-events-none ${effectiveIsSelected && isMultiSelectMode ? 'opacity-90' : 'opacity-60 group-hover:opacity-40'}`} />

        {/* --- YENİ KALP BUTONU (Sadece Normal Modda Görünür) --- */}
        {!isMultiSelectMode && !hideSelection && (
            <button
                onClick={handleHeartClick}
                className={`absolute top-2 right-2 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 z-30 shadow-lg group/heart
                    ${effectiveIsSelected 
                        ? 'bg-rose-500/90 text-white hover:bg-rose-600 scale-100' 
                        : 'bg-black/40 text-white/70 hover:bg-white hover:text-rose-500 hover:scale-110'
                    }
                `}
                title={effectiveIsSelected ? "Listeden Çıkar" : "Listeye Ekle"}
            >
                <svg 
                    className={`w-5 h-5 transition-transform ${effectiveIsSelected ? 'fill-current' : 'fill-none stroke-current stroke-2'}`} 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
            </button>
        )}

        {/* 5. USER RATING BADGE (Top Left) */}
        {displayReviewRating && displayReviewRating > 0 && (
            <div className="absolute top-2 left-2 z-30 pointer-events-none">
                 <div className={`flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10 shadow-lg ${
                     ownerReview ? 'bg-indigo-600/90' : 'bg-black/60'
                 }`}>
                    <span className="text-xs font-black text-white">{displayReviewRating}</span>
                    <svg className="w-2.5 h-2.5 text-yellow-400 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
            </div>
        )}

        {/* 6. SEÇİLDİ İKONU (Sadece Multi-Select Modunda Ortada Görünür) */}
        {isMultiSelectMode && effectiveIsSelected && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center shadow-2xl animate-scale-in">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
        )}

        {/* NEW: OWNER REVIEW TOOLTIP ICON (Top Right) */}
        {ownerReviewInfo && (
            <div className="absolute top-2 right-2 z-40 group/tooltip">
                <div className="w-6 h-6 rounded-full bg-indigo-600/90 text-white flex items-center justify-center backdrop-blur-md shadow-lg border border-white/20 cursor-help transition-transform hover:scale-110">
                    <span className="text-xs font-bold italic font-serif">i</span>
                </div>

                {/* Tooltip text */}
                <div className="absolute right-0 top-8 w-48 p-2.5 bg-neutral-900/95 text-white text-xs font-medium rounded-xl shadow-2xl border border-white/10 opacity-0 group-hover/tooltip:opacity-100 transform scale-95 group-hover/tooltip:scale-100 transition-all duration-200 pointer-events-none z-50 origin-top-right">
                    <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Kullanıcının bu yapıma ait {ownerReviewInfo.rating ? 'puanı ve ' : ''}yorumu bulunmaktadır.</span>
                    </div>
                </div>
            </div>
        )}

        {/* 7. INFO AREA */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10 transform transition-transform duration-300 translate-y-1 group-hover:translate-y-0 pointer-events-none">
            <h3 className="text-white text-xs font-bold leading-tight line-clamp-2 drop-shadow-md mb-1">
                {title}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-white/70 font-medium">
                <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    {rating}
                </span>
                {movie.release_date && (
                    <span>• {new Date(movie.release_date).getFullYear()}</span>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MovieCard);
