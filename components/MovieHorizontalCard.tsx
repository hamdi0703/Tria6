import React, { useState, useEffect } from 'react';
import { Movie, Genre, UserReview } from '../types';
import { useReviews } from '../hooks/useReviews';

const BASE_IMG_URL = 'https://image.tmdb.org/t/p/';

interface MovieHorizontalCardProps {
  movie: Movie;
  allGenres?: Genre[];
  onClick?: (movie: Movie) => void;
  priority?: boolean;
}

const MovieHorizontalCard: React.FC<MovieHorizontalCardProps> = ({
  movie,
  allGenres,
  onClick,
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { review: myReview } = useReviews(movie.id);

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

  const director = movie.credits?.crew?.find(c => c.job === 'Director')?.name;
  const actors = movie.credits?.cast?.slice(0, 2).map(c => c.name);

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
        <div className="flex items-start justify-between gap-4 mb-2">
            <div>
                <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                    {releaseYear && <span>{releaseYear}</span>}
                    {runtime && (
                        <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
                            {runtime}
                        </span>
                    )}
                </div>
            </div>

            {/* General TMDB Rating */}
            <div className="flex flex-col items-end flex-shrink-0 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl px-3 py-1.5 border border-neutral-100 dark:border-neutral-800">
                 <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">{rating}</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">Genel</span>
            </div>
        </div>

        {/* Meta: Genres, Director, Cast */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-xs">
            {displayGenres && displayGenres.length > 0 && (
                <div className="flex gap-1.5">
                    {displayGenres.map((g, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium border border-neutral-200 dark:border-neutral-700">
                            {g}
                        </span>
                    ))}
                </div>
            )}

            {(director || (actors && actors.length > 0)) && (
                <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400">
                    {director && <span className="line-clamp-1"><strong className="font-semibold text-neutral-700 dark:text-neutral-300">Yön:</strong> {director}</span>}
                    {actors && actors.length > 0 && <span className="line-clamp-1 hidden md:block"><strong className="font-semibold text-neutral-700 dark:text-neutral-300">Oyuncular:</strong> {actors.join(', ')}</span>}
                </div>
            )}
        </div>

        {/* Separator if review exists */}
        {(myReview?.rating || myReview?.comment) && (
             <div className="h-px w-full bg-neutral-100 dark:bg-neutral-800 my-2" />
        )}

        {/* 3. USER REVIEW & RATING SECTION */}
        {(myReview?.rating || myReview?.comment) && (
            <div className="mt-auto pt-2 flex flex-col gap-3">
                {/* User Rating Badge */}
                {myReview.rating > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Senin Puanın:</span>
                        <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-lg font-black text-sm border border-indigo-100 dark:border-indigo-500/20">
                            <span>{myReview.rating}</span>
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                    </div>
                )}

                {/* Review Comment */}
                {myReview.comment && (
                    <div className="relative">
                        <div
                            className={`text-sm text-neutral-600 dark:text-neutral-300 italic transition-all duration-500 ease-in-out overflow-hidden leading-relaxed ${isExpanded ? 'max-h-[1000px]' : 'line-clamp-3 max-h-[4.5rem]'}`}
                        >
                            "{myReview.comment}"
                        </div>

                        {/* Always show toggle if comment is long enough (simple heuristic: > 150 chars, but ideally based on ref height) */}
                        {myReview.comment.length > 120 && (
                            <button
                                onClick={toggleExpand}
                                className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                            >
                                {isExpanded ? 'Daha Az Göster' : 'Devamını Oku'}
                                <svg className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default React.memo(MovieHorizontalCard);
