
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ReviewProvider } from '../context/ReviewContext';
import { CollectionProvider, useCollectionContext } from '../context/CollectionContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { TmdbService } from '../services/tmdbService';
import { Movie, Genre, MediaType } from '../types';
import Header from './Header';
import ProfileModal, { ProfileTab } from './ProfileModal';
import FeedbackModal from './FeedbackModal';
import ResetPasswordModal from './auth/ResetPasswordModal'; 
import BottomNav from './BottomNav';
import ErrorBoundary from './ErrorBoundary';
import { supabase } from '../services/supabaseClient';
import { DetailSkeleton } from './skeletons/Skeletons';
import { useAppNavigation } from '../hooks/useAppNavigation';

// --- Lazy Load Helper (Robust Version) ---
const lazyRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    try {
      const component = await componentImport();
      sessionStorage.removeItem('retry-lazy-refreshed');
      return component;
    } catch (error: any) {
      console.error("Component load error:", error);
      const msg = String(error).toLowerCase();
      const alreadyRefreshed = sessionStorage.getItem('retry-lazy-refreshed');

      if (
        (msg.includes('failed to fetch') ||
         msg.includes('import') ||
         msg.includes('loading') || 
         msg.includes('undefined')) 
      ) {
        if (!alreadyRefreshed) {
            console.warn("Versiyon uyumsuzluğu/Ağ hatası algılandı, sayfa yenileniyor...");
            sessionStorage.setItem('retry-lazy-refreshed', 'true');
            window.location.reload();
            return new Promise(() => {}); 
        }
      }
      throw error;
    }
  });

// Lazy Loading Views with Retry Logic
const MovieDetailView = lazyRetry(() => import('./MovieDetailView'));
const ExploreView = lazyRetry(() => import('./views/ExploreView'));
const DashboardView = lazyRetry(() => import('./views/DashboardView'));
const SharedListView = lazyRetry(() => import('./views/SharedListView'));
const ProfileView = lazyRetry(() => import('./views/ProfileView')); 
const FrameFocusView = lazyRetry(() => import('./views/FrameFocusView'));
const CineRouletteView = lazyRetry(() => import('./views/CineRouletteView'));
const CineMatchView = lazyRetry(() => import('./views/CineMatchView')); // YENİ
const DiscoverAppView = lazyRetry(() => import('./views/DiscoverAppView'));
const NotFoundView = lazyRetry(() => import('./views/NotFoundView'));

const ViewLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-neutral-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

const AppContent: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const { resetCollections } = useCollectionContext();
  
  // Custom Router Hook (Manages View State & History)
  const { 
      viewMode, 
      setViewMode, 
      viewingProfileUsername, 
      isSharedLoading, 
      handleExitSharedMode, 
      handleExitProfileMode, 
      navigateToProfile 
  } = useAppNavigation();

  // Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false); 
  const [profileInitialTab, setProfileInitialTab] = useState<ProfileTab>('PROFILE');
  
  // Selection State
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>('movie');

  // Global Search & Data
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
        const tmdb = new TmdbService();
        try {
            const res = await tmdb.getGenres('movie');
            setGenres(res.genres);
        } catch (err) {
            console.error("Failed to load genres, using fallbacks if available in service", err);
            // Service handles fallback internally now
        }
    };
    fetchGenres();
  }, []);

  // UX Improvement: Dynamic Document Title
  useEffect(() => {
    if (selectedMovie) {
        document.title = `${selectedMovie.title || selectedMovie.name} | Tria`;
    } else {
        switch(viewMode) {
            case 'dashboard': document.title = 'Koleksiyonum | Tria'; break;
            case 'profile': document.title = viewingProfileUsername ? `@${viewingProfileUsername} | Tria` : 'Profil | Tria'; break;
            case 'frame-focus': document.title = 'Frame Focus | Oyun'; break;
            case 'cine-roulette': document.title = 'CineRoulette | Kasa Aç'; break;
            case 'cine-match': document.title = 'CineMatch | Eşleş'; break;
            case 'discover-app': document.title = 'Tria | Hakkında'; break;
            case 'shared': document.title = 'Paylaşılan Liste | Tria'; break;
            case 'not-found': document.title = 'Sayfa Bulunamadı | Tria'; break;
            default: document.title = 'Tria | Keşfet';
        }
    }
  }, [viewMode, selectedMovie, viewingProfileUsername]);

  // Password Recovery Listener (IMPROVED)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetPasswordOpen(true);
      }
    });

    if (window.location.hash && window.location.hash.includes('type=recovery')) {
         setTimeout(() => {
            setIsResetPasswordOpen(true);
         }, 500);
    }
    return () => { subscription.unsubscribe(); };
  }, [showToast]);

  const handleMovieSelect = (movie: Movie) => {
      const type = (movie.first_air_date || movie.name) ? 'tv' : 'movie';
      setSelectedMediaType(type);
      setSelectedMovie(movie);
  };

  const resetAppData = () => {
      resetCollections();
      setIsProfileModalOpen(false);
      localStorage.removeItem('vista-theme');
      setSelectedMovie(null);
      showToast('Uygulama sıfırlandı', 'info');
  };

  const handleOpenMyProfile = () => {
      if (user && user.user_metadata?.username) {
          navigateToProfile(user.user_metadata.username);
      } else {
          showToast('Kullanıcı adı bulunamadı.', 'error');
      }
  };

  const handleCloseProfileModal = () => {
      setIsProfileModalOpen(false);
      setTimeout(() => setProfileInitialTab('PROFILE'), 300);
  };

  // --- RENDER CONTENT SWITCH ---
  const renderContent = () => {
      if (isSharedLoading) return <ViewLoader />;
      
      switch (viewMode) {
          case 'dashboard':
              // AUTH GUARD: Prevent dashboard access if not logged in
              if (!user) {
                  return (
                      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
                          <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                              <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                          </div>
                          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Giriş Yapmalısınız</h2>
                          <p className="text-neutral-500 mb-8 max-w-sm">
                              Koleksiyonunuzu oluşturmak, düzenlemek ve görüntülemek için lütfen hesabınıza giriş yapın.
                          </p>
                          <button 
                              onClick={openAuthModal}
                              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                          >
                              Giriş Yap / Kayıt Ol
                          </button>
                      </div>
                  );
              }
              return <DashboardView onSelectMovie={handleMovieSelect} genres={genres} />;
          case 'shared':
              return <SharedListView onSelectMovie={handleMovieSelect} genres={genres} onBack={handleExitSharedMode} />;
          case 'profile':
              return viewingProfileUsername ? (
                  <ProfileView 
                    username={viewingProfileUsername} 
                    genres={genres} 
                    onSelectMovie={handleMovieSelect}
                    onBack={handleExitProfileMode}
                  />
              ) : <ExploreView searchQuery={searchQuery} genres={genres} onSelectMovie={handleMovieSelect} onNavigate={setViewMode} />;
          case 'frame-focus':
              return (
                  <FrameFocusView 
                      onExit={() => setViewMode('explore')} 
                      onGoToDetail={handleMovieSelect}
                  />
              );
          case 'cine-roulette':
              return (
                  <CineRouletteView 
                      genres={genres}
                      onExit={() => setViewMode('explore')}
                      onGoToDetail={handleMovieSelect}
                  />
              );
          case 'cine-match':
              return (
                  <CineMatchView 
                      genres={genres} 
                      onExit={() => setViewMode('explore')}
                      onGoToDetail={handleMovieSelect}
                  />
              );
          case 'discover-app':
              return (
                  <DiscoverAppView 
                      onExit={() => setViewMode('explore')}
                      onNavigate={setViewMode} 
                  />
              );
          case 'not-found':
              return (
                  <NotFoundView onGoHome={() => setViewMode('explore')} />
              );
          case 'explore':
          default:
              return <ExploreView searchQuery={searchQuery} genres={genres} onSelectMovie={handleMovieSelect} onNavigate={setViewMode} />;
      }
  };

  if (selectedMovie) {
    return (
      <div className="min-h-screen font-sans">
         <Suspense fallback={<DetailSkeleton />}>
            <MovieDetailView 
                movieId={selectedMovie.id}
                type={selectedMediaType} 
                onBack={() => setSelectedMovie(null)}
            />
         </Suspense>
      </div>
    );
  }

  // Hide header and nav for immersive views
  const isFullScreenView = viewMode === 'shared' || viewMode === 'profile' || viewMode === 'frame-focus' || viewMode === 'cine-roulette' || viewMode === 'cine-match' || viewMode === 'discover-app';

  return (
    <div className="min-h-screen flex flex-col font-sans pb-16 md:pb-0">
      
      {/* Modals */}
      {isProfileModalOpen && (
          <ProfileModal 
            onClose={handleCloseProfileModal} 
            onResetApp={resetAppData}
            initialTab={profileInitialTab}
          />
      )}
      {isFeedbackOpen && (
          <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />
      )}
      {isResetPasswordOpen && (
          <ResetPasswordModal onClose={() => setIsResetPasswordOpen(false)} />
      )}
      
      {/* Header (Hidden in Profile/Shared/Game views) */}
      {!isFullScreenView && !isSharedLoading && (
        <Header 
            onSearchToggle={() => {
                setIsSearchVisible(!isSearchVisible);
                if(isSearchVisible) setSearchQuery('');
            }}
            isSearchVisible={isSearchVisible}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode === 'dashboard' ? 'dashboard' : 'explore'}
            setViewMode={(mode) => {
                setViewMode(mode);
                if(mode === 'dashboard' && searchQuery) setSearchQuery('');
            }}
            listCount={0}
            onOpenProfile={handleOpenMyProfile} 
            onOpenFeedback={() => setIsFeedbackOpen(true)}
        />
      )}
      
      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto ${isFullScreenView ? '' : 'max-w-6xl px-4 py-8'}`}>
        <ErrorBoundary>
            <Suspense fallback={<ViewLoader />}>
                {renderContent()}
            </Suspense>
        </ErrorBoundary>
      </main>

      {!isFullScreenView && !isSharedLoading && (
          <BottomNav 
            viewMode={viewMode === 'dashboard' ? 'dashboard' : 'explore'}
            setViewMode={(mode) => setViewMode(mode)}
            listCount={0}
          />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ReviewProvider>
            <CollectionProvider>
                <ErrorBoundary fullHeight>
                   <AppContent />
                </ErrorBoundary>
            </CollectionProvider>
          </ReviewProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
