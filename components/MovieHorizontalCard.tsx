import React, { useState, useEffect } from 'react';
import { Movie, Genre, UserReview } from '../types';
import { useReviews } from '../hooks/useReviews';

const BASE_IMG_URL = 'https://image.tmdb.org/t/p/';

interface MovieHorizontalCardProps {
  movie: Movie;
  allGenres?: Genre[];
  onClick?: (movie: Movie) => void;
  priority?: boolean;
  ownerReview?: UserReview;
}

const MovieHorizontalCard: React.FC<MovieHorizontalCardProps> = ({
  movie,
  allGenres,
  onClick,
  priority = false,
  ownerReview,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { review: myReview } = useReviews(movie.id);

  const displayReview = ownerReview || myReview;

  const title = movie.title || movie.name || 'Untitled';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  useEffect(() => {
      setHasError(false);
      setIsLoaded(false);
  }, [movie.id, movie.poster_path]);

  // Image Setup
  const posterPath = movie.poster_path;
  const imageUrl = posterPath ? `${BASE_IMG_URL}w342${posterPath}` : null;
  const srcSet = posterPath ?
    `${BASE_IMG_URL}w342${posterPath} 342w, ${BASE_IMG_URL}w500${posterPath} 500w`
    : undefined;

  // Metadata Extraction
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : (movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : null);

  const displayGenres = movie.genre_ids
    ? allGenres?.filter(g => movie.genre_ids?.includes(g.id)).map(g => g.name).slice(0, 3)
    : movie.genres?.map(g => g.name).slice(0, 3);

  const runtime = movie.runtime || (movie.episode_run_time?.[0] ? `${movie.episode_run_time[0]} dk (Bölüm)` : null);

  const handleMainClick = () => {
    if (onClick) onClick(movie);
  };

  const toggleExpand = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
  };

  return (
    <div
        className={`group relative w-full flex flex-col sm:flex-row bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in select-none cursor-pointer`}
        onClick={handleMainClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >

      {/* 1. LEFT: POSTER (Fixed 2:3 Aspect Ratio Container) */}
      <div className="relative w-full sm:w-32 md:w-40 lg:w-48 flex-shrink-0 aspect-[2/3] sm:aspect-auto sm:h-auto overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {!isLoaded && !hasError && imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        )}

        {!hasError && imageUrl ? (
            <img
                src={imageUrl}
                srcSet={srcSet}
                sizes="(max-width: 640px) 100vw, 200px"
                alt={title}
                loading={priority ? "eager" : "lazy"}
                className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105`}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
            />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-neutral-400">
                <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-medium line-clamp-2">{title}</span>
            </div>
        )}

        {/* Gradient Overlay for mobile poster text visibility if needed, or pure visual effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent sm:hidden pointer-events-none" />
      </div>

      {/* 2. RIGHT: CONTENT */}
      <div className="flex flex-col flex-grow p-5 sm:p-6 w-full min-w-0">

        {/* Header: Title, Year, Rating */}
        <div className="flex items-start justify-between gap-4 mb-3">
            <div>
                <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {title}
                </h3>
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 font-medium">
                    {releaseYear && <span>{releaseYear}</span>}
                    {runtime && (
                        <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
                            {runtime}
                        </span>
                    )}
                    {/* General TMDB Rating (Faded) */}
                    <div className="flex items-center gap-1 ml-2 opacity-70">
                        <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
                        <svg className="w-3 h-3 text-yellow-500 fill-current ml-1" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        <span>{rating}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. USER REVIEW & RATING SECTION (PROMINENT) */}
        {(displayReview?.rating || displayReview?.comment) && (
            <div className="mt-auto pt-2 flex flex-col gap-4">

                {/* Big Review Block */}
                <div className="relative bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl p-4 sm:p-5 border border-neutral-100 dark:border-neutral-800/80 shadow-sm transition-all group-hover:shadow-md overflow-hidden">

                    {/* Vibrant left accent line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500"></div>

                    {/* Top Row inside Review Block: Rating Badge & Pills */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3 pl-1">

                        {/* Huge User Rating Badge */}
                        {displayReview.rating > 0 && (
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 dark:text-neutral-500">
                                    {ownerReview ? 'Puanı' : 'Senin Puanın'}
                                </span>
                                <div className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-xl shadow-lg shadow-indigo-500/30">
                                    <span className="font-black text-lg md:text-xl leading-none">{displayReview.rating}</span>
                                    <svg className="w-4 h-4 md:w-5 md:h-5 fill-current text-yellow-300 drop-shadow-sm" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                </div>
                            </div>
                        )}

                        {/* Right side pills (Character / Time) */}
                        {(displayReview.character || displayReview.watchTime) && (
                            <div className="flex flex-col md:flex-row items-end md:items-center gap-2 mt-1 md:mt-0 ml-auto">
                                {displayReview.character && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-200/50 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300 rounded-lg text-[10px] font-bold border border-neutral-300/50 dark:border-neutral-600/50">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        <span className="line-clamp-1 max-w-[100px]">{displayReview.character}</span>
                                    </div>
                                )}
                                {displayReview.watchTime && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-200/50 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300 rounded-lg text-[10px] font-bold border border-neutral-300/50 dark:border-neutral-600/50">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="whitespace-nowrap">{displayReview.watchTime}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Review Comment (Large & Central) */}
                    {displayReview.comment && (
                        <div className="relative pl-1">
                            <div
                                className={`text-sm md:text-base text-neutral-800 dark:text-neutral-200 font-medium leading-relaxed transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1500px]' : 'line-clamp-3 max-h-[4.5rem] md:max-h-[5rem]'}`}
                            >
                                {displayReview.comment}
                            </div>

                            {/* Expand button */}
                            {displayReview.comment.length > 120 && (
                                <button
                                    onClick={toggleExpand}
                                    className="mt-3 text-xs md:text-sm font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors w-full justify-center py-1.5 bg-indigo-50/50 dark:bg-indigo-500/10 rounded-lg"
                                >
                                    {isExpanded ? 'Daha Az Göster' : 'Devamını Oku'}
                                    <svg className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default React.memo(MovieHorizontalCard);
