
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Movie, Genre, SortOption, MediaType } from '../../types';
import { useCollectionContext } from '../../context/CollectionContext';
import MovieCard from '../MovieCard';
import FilterBar from '../FilterBar';
import { MovieCardSkeleton } from '../skeletons/Skeletons';
import ErrorBoundary from '../ErrorBoundary';
import { ViewMode } from '../../hooks/useAppNavigation';
import { useDiscoverInfinite } from '../../hooks/useTmdbQueries';

interface ExploreViewProps {
  searchQuery: string;
  genres: Genre[];
  onSelectMovie: (movie: Movie) => void;
  onNavigate: (mode: ViewMode) => void;
  onOpenGameHub?: () => void;
}

const ExploreView: React.FC<ExploreViewProps> = ({ 
  searchQuery, 
  genres, 
  onSelectMovie, 
  onNavigate,
  onOpenGameHub
}) => {
  const { toggleMovieInCollection, checkIsSelected } = useCollectionContext();
  
  // Local State
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Filter State
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('popularity.desc');
  
  // New: Selection Mode State
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Query Hook
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useDiscoverInfinite(
    debouncedQuery, 
    mediaType, 
    sortBy, 
    selectedGenre, 
    selectedYear
  );

  // Observer for Infinite Scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastMovieElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage({});
      }
    }, { rootMargin: '200px' });
    
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Derived Movies List
  const movies = data?.pages.flatMap(page => page.results) || [];

  return (
    <div className="animate-fade-in relative min-h-screen">
        
        {/* Sticky Filter Bar (Includes Media Type & Multi Select Toggle) */}
        <FilterBar 
            genres={genres}
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
            currentSort={sortBy}
            onSortChange={setSortBy}
            disabled={isLoading && movies.length === 0}
            onOpenGameHub={onOpenGameHub}
            // NEW PROPS
            mediaType={mediaType}
            onMediaTypeChange={(type) => {
                setMediaType(type);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isMultiSelect={isMultiSelect}
            onToggleMultiSelect={() => setIsMultiSelect(!isMultiSelect)}
        />

        {/* RESULTS GRID */}
        {isLoading && movies.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12">
                {[...Array(10)].map((_, i) => <MovieCardSkeleton key={i} />)}
            </div>
        ) : isError ? (
            <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30">
                <p className="text-red-500 font-bold mb-2">Bir şeyler ters gitti.</p>
                <p className="text-xs text-red-400">{error?.message}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl font-bold text-sm">Yenile</button>
            </div>
        ) : movies.length === 0 ? (
            <div className="text-center py-32 opacity-50">
                <div className="text-6xl mb-4">🔍</div>
                <p className="font-bold">Sonuç bulunamadı.</p>
                <p className="text-sm mt-2">Farklı bir arama terimi veya filtre deneyin.</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12 pb-20">
                {movies.map((movie, index) => {
                    if (movies.length === index + 1) {
                        return (
                            <div ref={lastMovieElementRef} key={`${movie.id}-${index}`}>
                                <MovieCard 
                                    movie={movie} 
                                    isSelected={checkIsSelected(movie.id)}
                                    onToggleSelect={toggleMovieInCollection}
                                    onClick={onSelectMovie} // Go To Detail
                                    allGenres={genres}
                                    mediaType={mediaType}
                                    isMultiSelectMode={isMultiSelect} // Mode Propagation
                                />
                            </div>
                        );
                    } else {
                        return (
                            <MovieCard 
                                key={`${movie.id}-${index}`} 
                                movie={movie} 
                                isSelected={checkIsSelected(movie.id)}
                                onToggleSelect={toggleMovieInCollection}
                                onClick={onSelectMovie} // Go To Detail
                                allGenres={genres}
                                mediaType={mediaType}
                                isMultiSelectMode={isMultiSelect} // Mode Propagation
                            />
                        );
                    }
                })}
                {isFetchingNextPage && [...Array(5)].map((_, i) => <MovieCardSkeleton key={`loading-${i}`} />)}
            </div>
        )}
    </div>
  );
};

export default ExploreView;
