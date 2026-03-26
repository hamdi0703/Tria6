
import React, { useState } from 'react';
import { Movie, Genre, Collection, SubscriptionTier } from '../../types';
import { getAvatarUrl, getAvatarPersona } from '../../utils/avatarUtils';
import { BACKDROP_BASE_URL } from '../../services/tmdbService';
import { useAuth } from '../../context/AuthContext';
import { useCollectionContext } from '../../context/CollectionContext';
import { useReviewContext } from '../../context/ReviewContext';
import { useProfileData } from '../../hooks/useProfileData';
import ShareProfileModal from '../ShareProfileModal';
import ProfileModal from '../ProfileModal'; 
import TimelineReview from '../profile/TimelineReview';
import { useToast } from '../../context/ToastContext';
import NotFoundView from './NotFoundView';

interface ProfileViewProps {
  username: string;
  genres: Genre[];
  onSelectMovie: (movie: Movie) => void;
  onBack: () => void;
}

type LocalProfileTab = 'COLLECTIONS' | 'REVIEWS';

const TierBadge: React.FC<{ tier?: SubscriptionTier }> = ({ tier }) => {
    if (!tier || tier === 'BASIC') return null;

    if (tier === 'ADMIN') {
        return (
            <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Admin
            </span>
        );
    }

    if (tier === 'PRO') {
        return (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 text-indigo-500 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-sm">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                PRO
            </span>
        );
    }

    return null;
};

const ProfileView: React.FC<ProfileViewProps> = ({ username, genres, onSelectMovie, onBack }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Context Data (For Instant Loading of Own Profile)
  const { collections: myCollections } = useCollectionContext();
  const { reviews: myReviews } = useReviewContext();
  
  // --- USE CUSTOM HOOK ---
  const { loading, profile, reviews, movieCache, isOwner } = useProfileData(username, user, myCollections, myReviews);

  const [activeTab, setActiveTab] = useState<LocalProfileTab>('COLLECTIONS');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleCollectionClick = (col: Collection) => {
      if (col.shareToken) {
          window.location.href = `/?collection=${col.shareToken}`;
      } else {
          if (isOwner) {
              showToast('Bu listenin henüz paylaşım bağlantısı yok. Ayarlardan oluşturabilirsiniz.', 'info');
          } else {
              showToast('Bu liste şu an görüntülenemiyor.', 'error');
          }
      }
  };

  // FIX: Güvenli Önbellek Temizleme
  const handleResetApp = () => {
      localStorage.clear();
      window.location.href = '/';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!profile) {
      return <NotFoundView onGoHome={onBack} />;
  }

  // --- PRIVATE PROFILE VIEW ---
  if (profile.isPrivate) {
      return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4 animate-fade-in text-center">
            <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Bu Profil Gizli</h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xs mb-8">
                @{username} profilini gizlemiş. Sadece kendisi görebilir.
            </p>
            <button onClick={onBack} className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-opacity">
                Geri Dön
            </button>
        </div>
      );
  }

  const avatarUrl = getAvatarUrl(profile.avatar_url);
  const persona = getAvatarPersona(profile.avatar_url);
  const publicCollections = profile.collections ? profile.collections.filter((c: Collection) => c.isPublic) : [];

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20 animate-fade-in font-sans">
        
        {isShareModalOpen && (
            <ShareProfileModal 
                username={profile.username}
                avatarUrl={avatarUrl}
                publicCollections={publicCollections}
                onClose={() => setIsShareModalOpen(false)}
            />
        )}

        {isEditModalOpen && (
            <ProfileModal 
                onClose={() => setIsEditModalOpen(false)} 
                onResetApp={handleResetApp}
                initialTab="PROFILE"
            />
        )}

        {/* HERO BANNER */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, ${persona.bgStart}, ${persona.bgEnd})` }}></div>
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
                <button onClick={onBack} className="p-3 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors border border-white/10">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>

                <div className="flex gap-3">
                    <button onClick={() => setIsShareModalOpen(true)} className="p-3 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors border border-white/10">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    </button>
                    {isOwner && (
                        <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2 bg-white text-black font-bold rounded-full shadow-lg hover:bg-neutral-100 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            Düzenle
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* PROFILE INFO CARD */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-20 z-10 mb-12">
            <div className="bg-white dark:bg-neutral-900 rounded-[2rem] p-6 md:p-8 shadow-xl border border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
                
                <div className="relative -mt-16 md:-mt-20 group">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-neutral-900 shadow-2xl overflow-hidden bg-neutral-100 relative">
                        <img src={avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-neutral-900 dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white dark:border-neutral-900">
                        {persona.name}
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
                        <h1 className="text-3xl font-black text-neutral-900 dark:text-white mb-2 tracking-tight flex items-center justify-center md:justify-start gap-2">
                            {profile.username}
                            {profile.is_public === false && (
                                <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><title>Gizli Profil</title><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            )}
                        </h1>
                        <div className="mb-2 md:mb-0">
                            <TierBadge tier={profile.tier} />
                        </div>
                    </div>

                    <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm leading-relaxed max-w-lg mx-auto md:mx-0">
                        {profile.bio || "Henüz bir biyografi yazmamış."}
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                        {profile.website && (
                            <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                {profile.website.replace(/^https?:\/\//, '')}
                            </a>
                        )}
                        <div className="text-xs text-neutral-400 font-medium px-2">
                            Katılım: {new Date(profile.created_at).getFullYear()}
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-6 border-t md:border-t-0 md:border-l border-neutral-100 dark:border-neutral-800 pt-6 md:pt-0 md:pl-8">
                    <div className="text-center">
                        <div className="text-2xl font-black text-neutral-900 dark:text-white">{profile.collections?.length || 0}</div>
                        <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Liste</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-neutral-900 dark:text-white">{reviews.length}</div>
                        <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">İnceleme</div>
                    </div>
                </div>
            </div>
        </div>

        {/* CONTENT TABS */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <div className="flex justify-center md:justify-start mb-8 border-b border-neutral-200 dark:border-neutral-800">
                <button 
                    onClick={() => setActiveTab('COLLECTIONS')}
                    className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'COLLECTIONS' ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white' : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'}`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    Koleksiyonlar
                </button>
                <button 
                    onClick={() => setActiveTab('REVIEWS')}
                    className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'REVIEWS' ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white' : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'}`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    İncelemeler
                </button>
            </div>

            {/* TAB: COLLECTIONS */}
            {activeTab === 'COLLECTIONS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in-up">
                    {profile.collections && profile.collections.map((col: Collection) => {
                        const coverMovies = col.movies ? col.movies.slice(0, 3) : [];
                        
                        return (
                            <div key={col.id} className="group bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all cursor-pointer shadow-sm hover:shadow-lg flex flex-col md:flex-row gap-4" onClick={() => handleCollectionClick(col)}>
                                <div 
                                    className="w-full md:w-24 h-32 md:h-24 rounded-xl flex-shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-inner relative border border-neutral-100 dark:border-neutral-700"
                                >
                                    <div className="flex w-full h-full">
                                        {coverMovies.map((m: Movie) => (
                                            <img 
                                                key={m.id} 
                                                src={`${BACKDROP_BASE_URL}${m.poster_path}`} 
                                                className="w-1/3 h-full object-cover" 
                                                alt=""
                                            />
                                        ))}
                                        {coverMovies.length === 0 && (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-indigo-500 transition-colors truncate pr-2">{col.name}</h3>
                                        {!col.isPublic && isOwner && <span className="text-[9px] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-500">Gizli</span>}
                                    </div>
                                    <p className="text-xs text-neutral-500">{col.movies ? col.movies.length : 0} İçerik</p>
                                    {col.description && <p className="text-xs text-neutral-400 mt-2 line-clamp-1">{col.description}</p>}
                                </div>
                            </div>
                        );
                    })}
                    {(!profile.collections || profile.collections.length === 0) && <div className="col-span-full text-center py-20 text-neutral-500">Henüz bir liste oluşturmamış.</div>}
                </div>
            )}

            {/* TAB: REVIEWS (TIMELINE) */}
            {activeTab === 'REVIEWS' && (
                <div className="max-w-3xl animate-slide-in-up">
                    {reviews.length > 0 ? (
                        <div className="pl-2">
                            {reviews.map((r) => (
                                <TimelineReview 
                                    key={r.id || r.movieId} 
                                    review={r} 
                                    onSelect={onSelectMovie} 
                                    cachedMovie={movieCache[r.movie_id || r.movieId]} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-neutral-500">
                            <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 01-2-2h14a2 2 0 01 2 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            <p>Henüz bir inceleme yazmamış.</p>
                        </div>
                    )}
                </div>
            )}

        </div>
    </div>
  );
};

export default ProfileView;
