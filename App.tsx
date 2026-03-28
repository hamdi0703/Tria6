
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ReviewProvider } from './context/ReviewContext';
import { CollectionProvider, useCollectionContext } from './context/CollectionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TmdbService } from './services/tmdbService';
import { Movie, Genre, MediaType } from './types';
import Header from './components/Header';
import ProfileModal, { ProfileTab } from './components/ProfileModal';
import FeedbackModal from './components/FeedbackModal';
import ResetPasswordModal from './components/auth/ResetPasswordModal'; 
import AuthModal from './components/auth/AuthModal';
import GameHubModal from './components/GameHubModal';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import { supabase } from './services/supabaseClient';
import { DetailSkeleton } from './components/skeletons/Skeletons';
import { useAppNavigation } from './hooks/useAppNavigation';

// --- ViewLoader Component ---
const ViewLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-neutral-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

// --- Lazy Load Helper (Robust Version with Infinite Loop Protection) ---
const lazyRetry = (componentImport: () => Promise<any>, name: string = 'component') =>
  lazy(async () => {
    // SessionStorage kullanarak sayfanın daha önce zorla yenilenip yenilenmediğini kontrol et
    const hasRefreshed = window.sessionStorage.getItem(`retry-${name}-refreshed`);

    try {
      const component = await componentImport();
      // Başarılı yüklemede bayrağı temizle
      window.sessionStorage.removeItem(`retry-${name}-refreshed`);
      return component;
    } catch (error: any) {
      console.error(`Component load error (${name}):`, error);
      
      const msg = String(error).toLowerCase();
      // Sadece chunk/network hatalarında yenileme dene
      if (
        msg.includes('failed to fetch') ||
        msg.includes('import') ||
        msg.includes('loading') || 
        msg.includes('undefined')
      ) {
        if (!hasRefreshed) {
            console.warn(`${name} yüklenemedi, versiyon uyuşmazlığı olabilir. Sayfa yenileniyor...`);
            window.sessionStorage.setItem(`retry-${name}-refreshed`, 'true');
            window.location.reload();
            // React'ın hata fırlatmasını geçici olarak engellemek için dummy component dön
            return { default: () => <ViewLoader /> }; 
        }
      }
      // Daha önce yenilendiyse veya başka bir hataysa, ErrorBoundary'e fırlat
      throw error;
    }
  });

// Lazy Loading Views
const MovieDetailView = lazyRetry(() => import('./components/MovieDetailView'), 'detail');
const ExploreView = lazyRetry(() => import('./components/views/ExploreView'), 'explore');
const DashboardView = lazyRetry(() => import('./components/views/DashboardView'), 'dashboard');
const SharedListView = lazyRetry(() => import('./components/views/SharedListView'), 'shared');
const ProfileView = lazyRetry(() => import('./components/views/ProfileView'), 'profile'); 
const FrameFocusView = lazyRetry(() => import('./components/views/FrameFocusView'), 'framefocus');
const CineRouletteView = lazyRetry(() => import('./components/views/CineRouletteView'), 'roulette');
const CineMatchView = lazyRetry(() => import('./components/views/CineMatchView'), 'cinematch'); 
const DiscoverAppView = lazyRetry(() => import('./components/views/DiscoverAppView'), 'discover');
const NotFoundView = lazyRetry(() => import('./components/views/NotFoundView'), '404');

const AppContent: React.FC = () => {
  const { user, openAuthModal, isAuthModalOpen, closeAuthModal } = useAuth();
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
  const [isGameHubOpen, setIsGameHubOpen] = useState(false);
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
            console.error("Failed to load genres", err);
        }
    };
    fetchGenres();
  }, []);

  // UX Improvement: Dynamic Document Title
  useEffect(() => {
    if (selectedMovie) {
        document.title = `${selectedMovie.title || selectedMovie.name} | İzleme Listem`;
    } else {
        switch(viewMode) {
            case 'dashboard': document.title = 'Koleksiyonum | İzleme Listem'; break;
            case 'profile': document.title = viewingProfileUsername ? `@${viewingProfileUsername} | İzleme Listem` : 'Profil | İzleme Listem'; break;
            case 'frame-focus': document.title = 'Frame Focus | Oyun'; break;
            case 'cine-roulette': document.title = 'CineRoulette | Kasa Aç'; break;
            case 'cine-match': document.title = 'CineMatch | Eşleş'; break;
            case 'discover-app': document.title = 'İzleme Listem | Hakkında'; break;
            case 'shared': document.title = 'Paylaşılan Liste | İzleme Listem'; break;
            case 'not-found': document.title = 'Sayfa Bulunamadı | İzleme Listem'; break;
            default: document.title = 'İzleme Listem | Keşfet';
        }
    }
  }, [viewMode, selectedMovie, viewingProfileUsername]);

  // Password Recovery Listener
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
              ) : <ExploreView 
                    searchQuery={searchQuery} 
                    genres={genres} 
                    onSelectMovie={handleMovieSelect} 
                    onNavigate={setViewMode} 
                    onOpenGameHub={() => setIsGameHubOpen(true)}
                />;
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
              return <ExploreView 
                        searchQuery={searchQuery} 
                        genres={genres} 
                        onSelectMovie={handleMovieSelect} 
                        onNavigate={setViewMode} 
                        onOpenGameHub={() => setIsGameHubOpen(true)}
                    />;
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

  const isFullScreenView = viewMode === 'shared' || viewMode === 'profile' || viewMode === 'frame-focus' || viewMode === 'cine-roulette' || viewMode === 'cine-match' || viewMode === 'discover-app' || viewMode === 'not-found';

  return (
    <div className="min-h-screen flex flex-col font-sans pb-16 md:pb-0">
      
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />}
      {isGameHubOpen && (
          <GameHubModal 
            onClose={() => setIsGameHubOpen(false)}
            onNavigate={(game) => {
                if (game === 'roulette') setViewMode('cine-roulette');
                else if (game === 'frame-focus') setViewMode('frame-focus');
                else if (game === 'cine-match') setViewMode('cine-match');
            }} 
          />
      )}
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
