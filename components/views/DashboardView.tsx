
import React, { useState } from 'react';
import { Movie, Genre } from '../../types';
import { useCollectionContext } from '../../context/CollectionContext';
import DashboardHeader from '../dashboard/DashboardHeader';
import MediaTypeNavbar from '../MediaTypeNavbar';
import TopFavorites from '../dashboard/TopFavorites';
import FavoriteSelectorModal from '../dashboard/FavoriteSelectorModal';
import CollectionAnalytics from '../analytics/CollectionAnalytics';
import SmartRecs from '../dashboard/SmartRecs';
import CollectionControls from '../dashboard/CollectionControls';
import MovieCard from '../MovieCard';
import MovieHorizontalCard from '../MovieHorizontalCard';
import ErrorBoundary from '../ErrorBoundary';
import { useCollectionStats } from '../../hooks/useCollectionStats';
import { useMovieFiltering } from '../../hooks/useMovieFiltering';
import { useReviewContext } from '../../context/ReviewContext';

interface DashboardViewProps {
  onSelectMovie: (movie: Movie) => void;
  genres: Genre[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ onSelectMovie, genres }) => {
  const { 
    collections, 
    activeCollectionId, 
    setActiveCollectionId, 
    createCollection, 
    updateTopFavorite,
    checkIsSelected,
    toggleMovieInCollection
  } = useCollectionContext();
  
  const activeCollection = collections.find(c => c.id === activeCollectionId) || collections[0];

  // --- USE CUSTOM HOOK FOR LOGIC ---
  const {
      activeTab, setActiveTab,
      currentSort, setCurrentSort,
      filterGenre, setFilterGenre,
      filterYear, setFilterYear,
      filterMinRating, setFilterMinRating,
      filterMinTmdbRating, setFilterMinTmdbRating,
      filterStatus, setFilterStatus,
      currentGroup, setCurrentGroup,
      tabFilteredMovies,
      processedMovies,
      groupedMovies
  } = useMovieFiltering(activeCollection?.movies, genres);

  // Stats Hook
  const { stats: collectionStats } = useCollectionStats(tabFilteredMovies, genres);

  // Reviews for filtering list mode
  const { reviews } = useReviewContext();

  // View Mode State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Favorites Modal State
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  // Favorites Logic
  const currentFavorites = activeTab === 'movie' 
    ? (activeCollection?.topFavoriteMovies || [null,null,null,null,null]) 
    : (activeCollection?.topFavoriteShows || [null,null,null,null,null]);

  const handleFavoriteSelect = (movieId: number) => {
      if (editingSlot !== null) {
          updateTopFavorite(editingSlot, movieId, activeTab);
          setEditingSlot(null);
      }
  };

  const handleFavoriteClear = () => {
      if (editingSlot !== null) {
          updateTopFavorite(editingSlot, null, activeTab);
          setEditingSlot(null);
      }
  };

  // Memoize IDs for recommendation filtering
  const existingMovieIds = new Set(activeCollection?.movies.map(m => m.id));

  // Fail-safe check
  if (!activeCollection) {
      if (collections.length === 0) {
          return (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                  <div className="w-12 h-12 border-4 border-neutral-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-neutral-500">Verileriniz senkronize ediliyor...</p>
              </div>
          );
      }
      return <div>Liste seçilemedi.</div>;
  }

  return (
    <div className="animate-fade-in pb-20">
        
        {editingSlot !== null && (
            <FavoriteSelectorModal 
                collectionMovies={tabFilteredMovies}
                slotIndex={editingSlot}
                onSelect={handleFavoriteSelect}
                onClear={handleFavoriteClear}
                onClose={() => setEditingSlot(null)}
            />
        )}

        <DashboardHeader 
            collections={collections}
            activeCollectionId={activeCollectionId}
            onSwitchCollection={setActiveCollectionId}
            onCreateCollection={createCollection}
        />

        <MediaTypeNavbar 
            activeType={activeTab}
            onChange={setActiveTab}
        />

        <TopFavorites 
            favorites={currentFavorites}
            collectionMovies={tabFilteredMovies}
            onSlotClick={setEditingSlot}
            type={activeTab}
        />

        <div className="mb-12">
            <ErrorBoundary>
                <CollectionAnalytics 
                    movies={tabFilteredMovies} 
                    genres={genres}
                />
            </ErrorBoundary>
        </div>

        {/* SMART RECOMMENDATIONS */}
        <ErrorBoundary>
            <SmartRecs 
                collectionMovies={tabFilteredMovies} 
                stats={collectionStats}
                genres={genres}
                existingMovieIds={existingMovieIds}
                onSelectMovie={onSelectMovie}
                onToggleCollection={toggleMovieInCollection}
                checkIsSelected={checkIsSelected}
                type={activeTab} 
            />
        </ErrorBoundary>

        <CollectionControls 
            genres={genres}
            currentSort={currentSort}
            onSortChange={setCurrentSort}
            filterGenre={filterGenre}
            onFilterGenreChange={setFilterGenre}
            filterYear={filterYear}
            onFilterYearChange={setFilterYear}
            filterMinRating={filterMinRating}
            onFilterMinRatingChange={setFilterMinRating}
            filterMinTmdbRating={filterMinTmdbRating}
            onFilterMinTmdbRatingChange={setFilterMinTmdbRating}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            currentGroup={currentGroup}
            onGroupChange={setCurrentGroup}
            resultCount={processedMovies.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
        />

        {/* MOVIE GRID / LIST */}
        {Object.entries(groupedMovies).map(([groupName, movies]) => {
            const movieList = movies as Movie[];
            return (
            <div key={groupName} className="mb-8">
                {currentGroup !== 'none' && (
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 px-1 sticky top-20 bg-white/90 dark:bg-black/90 backdrop-blur-md py-2 z-10 border-b border-neutral-100 dark:border-neutral-800">
                        {groupName} <span className="text-neutral-400 text-sm font-normal ml-2">({movieList.length})</span>
                    </h3>
                )}
                
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12">
                        {movieList.map(movie => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                isSelected={true}
                                onToggleSelect={toggleMovieInCollection}
                                onClick={onSelectMovie}
                                allGenres={genres}
                                mediaType={activeTab}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {movieList.filter(movie => {
                            const rev = reviews[movie.id];
                            return rev && (rev.rating > 0 || rev.comment);
                        }).map(movie => (
                            <MovieHorizontalCard
                                key={movie.id}
                                movie={movie}
                                allGenres={genres}
                                onClick={onSelectMovie}
                            />
                        ))}
                        {movieList.filter(movie => {
                            const rev = reviews[movie.id];
                            return rev && (rev.rating > 0 || rev.comment);
                        }).length === 0 && (
                            <div className="text-center py-10 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                <p className="text-neutral-500 text-sm font-medium">Bu grupta incelemesi veya puanı olan içerik bulunamadı.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )})}

        {processedMovies.length === 0 && (
            <div className="text-center py-20 text-neutral-500">
                <p>Bu filtreye uygun içerik bulunamadı.</p>
                <button 
                    onClick={() => {
                        setFilterGenre(null);
                        setFilterYear(null);
                        setFilterMinRating(null);
                        setFilterStatus('all');
                    }}
                    className="mt-2 text-indigo-500 hover:underline text-sm font-bold"
                >
                    Filtreleri Temizle
                </button>
            </div>
        )}
    </div>
  );
};

export default DashboardView;
