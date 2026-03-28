
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
    <div className="min-h-screen bg-vista-light dark:bg-black animate-slide-in-right w-full overflow-x-hidden pb-20">
      
      {/* IMMERSIVE HERO */}
      <DetailHero 
        movie={movie} 
        onBack={onBack} 
        onToggleCollection={toggleMovieInCollection} 
        isInCollection={isInCollection} 
      />

      {/* CONTENT BODY */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-12 md:py-20 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* LEFT COLUMN: Overview & Key Info */}
            <div className="lg:col-span-8 space-y-16">
                
                {/* Overview */}
                <div className="prose dark:prose-invert max-w-none bg-white dark:bg-[#0a0a0a] p-8 md:p-10 rounded-3xl border border-neutral-100 dark:border-neutral-800/60 shadow-sm">
                    <h3 className="text-sm font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                        Hikaye
                    </h3>
                    <p className="text-lg md:text-2xl leading-relaxed font-medium text-neutral-700 dark:text-neutral-300">
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
                <div>
                    <CastList cast={movie.credits?.cast} />
                </div>
            </div>

            {/* RIGHT COLUMN: Sidebar Info */}
            <div className="lg:col-span-4 space-y-8">
                <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 border border-neutral-100 dark:border-neutral-800/60 shadow-sm sticky top-24">
                    
                    {keyPeople && (
                        <div className="mb-10">
                            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-3">{keyPeopleLabel}</h4>
                            <div className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                {keyPeople}
                            </div>
                        </div>
                    )}

                    {movie.status && (
                        <div className="mb-10">
                            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-3">Durum</h4>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${movie.status === 'Ended' || movie.status === 'Canceled' ? 'bg-red-50 border-red-100 text-red-600 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400' : 'bg-green-50 border-green-100 text-green-600 dark:bg-green-900/10 dark:border-green-900/30 dark:text-green-400'}`}>
                                <span className={`w-2 h-2 rounded-full ${movie.status === 'Ended' || movie.status === 'Canceled' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                {movie.status === 'Returning Series' ? 'Devam Ediyor' : movie.status}
                            </div>
                        </div>
                    )}

                    {/* Production Countries */}
                    {movie.production_countries && movie.production_countries.length > 0 && (
                        <div>
                            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Ülke</h4>
                            <div className="flex flex-wrap gap-3">
                                {movie.production_countries.map(c => (
                                    <span key={c.iso_3166_1} className="flex items-center gap-2.5 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-bold text-neutral-700 dark:text-neutral-300 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                        <img src={`https://flagcdn.com/w20/${c.iso_3166_1.toLowerCase()}.png`} alt={c.name} className="w-5 h-auto rounded shadow-sm" />
                                        {c.iso_3166_1}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>

        {/* Reviews - Full Width, Centered, Constrained Height */}
        <div className="mt-20 lg:mt-32 w-full flex justify-center">
            <div className="w-full max-w-4xl">
                <ReviewSection movieId={movie.id} movieTitle={displayTitle} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailView;
    