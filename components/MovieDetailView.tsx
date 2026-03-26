
import React, { useEffect } from 'react';
import { Movie, MediaType } from '../types';
import { useCollectionContext } from '../context/CollectionContext';
import DetailHero from './details/DetailHero';
import CastList from './details/CastList';
import TvStats from './details/TvStats';
import ReviewSection from './details/ReviewSection';
import { DetailSkeleton } from './skeletons/Skeletons';
import { useMovieDetail } from '../hooks/useTmdbQueries';

interface MovieDetailViewProps {
  movieId: number;
  type?: MediaType;
  onBack: () => void;
}

const MovieDetailView: React.FC<MovieDetailViewProps> = ({ 
  movieId, 
  type = 'movie', 
  onBack
}) => {
  const { toggleMovieInCollection, checkIsSelected } = useCollectionContext();
  
  // Use React Query Hook
  const { data: movie, isLoading, isError } = useMovieDetail(movieId, type as MediaType);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [movieId]);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError || !movie) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">İçerik Yüklenemedi</h2>
              <button onClick={onBack} className="text-indigo-500 hover:underline font-bold">Geri Dön</button>
          </div>
      );
  }

  const isTv = !!movie.first_air_date || !!movie.name;
  const displayTitle = movie.title || movie.name || 'Bilinmiyor';
  const isInCollection = checkIsSelected(movie.id);

  // --- Content Info ---
  const creators = movie.created_by?.map(c => c.name).join(', ');
  const director = movie.credits?.crew.find(c => c.job === 'Director')?.name;
  const keyPeopleLabel = isTv ? 'Yaratıcılar' : 'Yönetmen';
  const keyPeople = isTv ? (creators || 'Belirtilmemiş') : director;

  return (
    <div className="min-h-screen bg-vista-light dark:bg-black animate-slide-in-right w-full overflow-x-hidden">
      
      {/* IMMERSIVE HERO */}
      <DetailHero 
        movie={movie} 
        onBack={onBack} 
        onToggleCollection={toggleMovieInCollection} 
        isInCollection={isInCollection} 
      />

      {/* CONTENT BODY */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-12 md:py-20 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            
            {/* LEFT COLUMN: Overview & Key Info */}
            <div className="lg:col-span-8 space-y-12">
                
                {/* Overview */}
                <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4">Hikaye</h3>
                    <p className="text-xl md:text-2xl leading-relaxed font-light text-neutral-800 dark:text-neutral-200">
                        {movie.overview || "Bu içerik için özet bilgisi bulunmamaktadır."}
                    </p>
                </div>

                {/* TV Stats & Timeline & Binge Time */}
                {isTv && (
                    <TvStats 
                        seasons={movie.number_of_seasons} 
                        episodes={movie.number_of_episodes}
                        runtime={movie.episode_run_time}
                        firstAirDate={movie.first_air_date}
                        lastAirDate={movie.last_air_date}
                        status={movie.status}
                    />
                )}

                {/* Cast */}
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-12">
                    <CastList cast={movie.credits?.cast} />
                </div>

                {/* Reviews */}
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-12">
                    <ReviewSection movieId={movie.id} movieTitle={displayTitle} cast={movie.credits?.cast} />
                </div>
            </div>

            {/* RIGHT COLUMN: Sidebar Info */}
            <div className="lg:col-span-4 space-y-8">
                <div className="bg-neutral-100 dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 sticky top-24">
                    
                    {keyPeople && (
                        <div className="mb-8">
                            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">{keyPeopleLabel}</h4>
                            <p className="text-lg font-bold text-neutral-900 dark:text-white">{keyPeople}</p>
                        </div>
                    )}

                    {movie.status && (
                        <div className="mb-8">
                            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Durum</h4>
                            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${movie.status === 'Ended' || movie.status === 'Canceled' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                                {movie.status === 'Returning Series' ? 'Devam Ediyor' : movie.status}
                            </span>
                        </div>
                    )}

                    {/* Production Countries */}
                    {movie.production_countries && movie.production_countries.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Ülke</h4>
                            <div className="flex flex-wrap gap-2">
                                {movie.production_countries.map(c => (
                                    <span key={c.iso_3166_1} className="flex items-center gap-2 bg-white dark:bg-neutral-800 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium">
                                        <img src={`https://flagcdn.com/w20/${c.iso_3166_1.toLowerCase()}.png`} alt={c.name} className="w-5 h-auto rounded-sm" />
                                        {c.iso_3166_1}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default MovieDetailView;
    