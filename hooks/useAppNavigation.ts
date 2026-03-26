
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCollectionContext } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';

export type ViewMode = 'explore' | 'dashboard' | 'shared' | 'profile' | 'frame-focus' | 'cine-roulette' | 'cine-match' | 'discover-app' | 'not-found';

// Helper to safely update history without crashing in restricted environments (like Blob URLs)
const safeHistoryUpdate = (path: string, method: 'push' | 'replace' = 'push') => {
    // If running in a blob/preview environment, skip history updates
    if (typeof window !== 'undefined' && window.location.protocol === 'blob:') {
        return;
    }
    
    try {
        if (method === 'replace') {
            window.history.replaceState({}, '', path);
        } else {
            window.history.pushState({}, '', path);
        }
    } catch (e) {
        console.debug('URL update skipped due to environment restriction.');
    }
};

export const useAppNavigation = () => {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
      if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          
          // Ana yollar
          if (path === '/app') return 'explore';
          if (path === '/' || path === '/index.html') return 'discover-app';

          // Query parametreleri varsa (Paylaşım linkleri) bunları useEffect halledecek,
          // şimdilik 'explore' döndürerek yükleme ekranına düşmesini engelliyoruz.
          const params = new URLSearchParams(window.location.search);
          if (params.get('u') || params.get('collection') || params.get('list')) {
              return 'explore'; 
          }

          // Bilinmeyen bir yol ise (Örn: /rastgele)
          return 'not-found';
      }
      return 'discover-app';
  });

  const [viewingProfileUsername, setViewingProfileUsername] = useState<string | null>(null);
  const [isSharedLoading, setIsSharedLoading] = useState(false);
  
  const { loadCollectionByToken, loadCloudList, loadSharedList, exitSharedMode } = useCollectionContext();
  const { showToast } = useToast();
  const urlCheckRef = useRef(false);

  const setViewMode = useCallback((mode: ViewMode) => {
      setViewModeState(mode);
      try {
          const currentPath = window.location.pathname;
          if (mode === 'discover-app') {
              if (currentPath !== '/') {
                  safeHistoryUpdate('/', 'push');
              }
          } else if (mode === 'explore' || mode === 'dashboard') {
              if (currentPath !== '/app') {
                  safeHistoryUpdate('/app', 'push');
              }
          }
          // Not found durumunda URL'i değiştirmeyelim ki kullanıcı ne yazdığını görsün
          else if (mode !== 'not-found' && !currentPath.startsWith('/app')) {
               safeHistoryUpdate('/app', 'push');
          }
      } catch (e) {}
  }, []);

  useEffect(() => {
      const handlePopState = () => {
          const path = window.location.pathname;
          const params = new URLSearchParams(window.location.search);

          if (params.get('u')) {
              setViewModeState('profile');
              setViewingProfileUsername(params.get('u'));
          } else if (params.get('collection') || params.get('list')) {
              setViewModeState('shared');
          } else if (path === '/app') {
              setViewModeState('explore');
              setViewingProfileUsername(null);
              exitSharedMode();
          } else if (path === '/' || path === '/index.html') {
              setViewModeState('discover-app');
              setViewingProfileUsername(null);
              exitSharedMode();
          } else {
              // Bilinmeyen yol -> 404
              setViewModeState('not-found');
          }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, [exitSharedMode]);

  useEffect(() => {
    if (urlCheckRef.current) return;
    urlCheckRef.current = true;

    const checkUrl = async () => {
        if (window.location.protocol === 'blob:') return;

        const params = new URLSearchParams(window.location.search);
        
        const username = params.get('u');
        const token = params.get('collection');
        const legacyListId = params.get('list');
        const legacyIds = params.get('ids');

        if (username) {
            setViewingProfileUsername(username);
            setViewModeState('profile');
        }
        else if (token) {
            if (token === 'null' || token === 'undefined' || !token.trim()) {
                console.warn("Invalid token detected in URL, redirecting to 404");
                setViewModeState('not-found');
                return;
            }

            setIsSharedLoading(true);
            try {
                const success = await loadCollectionByToken(token);
                if (success) {
                    setViewModeState('shared');
                } else {
                    // Token geçersizse URL parametrelerini temizle ve 404 göster
                    clearUrlParams();
                    setViewModeState('not-found');
                }
            } catch (e) {
                showToast('Hata oluştu.', 'error');
                setViewModeState('not-found');
            } finally {
                setIsSharedLoading(false);
            }
        }
        else if (legacyListId) {
            setIsSharedLoading(true);
            try {
                const success = await loadCloudList(legacyListId);
                if (success) {
                    setViewModeState('shared');
                } else {
                    setViewModeState('not-found');
                }
            } catch (e) {
                setViewModeState('not-found');
            } finally {
                setIsSharedLoading(false);
            }
        } else if (legacyIds) {
            setIsSharedLoading(true);
            await loadSharedList(legacyIds.split(','));
            setIsSharedLoading(false);
            setViewModeState('shared');
        } else {
            // URL PATH KONTROLÜ (ROUTING)
            const path = window.location.pathname;
            
            if (path === '/app') {
                setViewModeState('explore');
            } else if (path === '/' || path === '/index.html') {
                setViewModeState('discover-app');
            } else {
                // Tanımlı olmayan her yol için 404
                setViewModeState('not-found');
            }
        }
    };
    
    checkUrl();
  }, [loadCollectionByToken, loadCloudList, loadSharedList, showToast]);

  const clearUrlParams = () => {
      try {
          // 404 durumunda URL'i temizlemek yerine olduğu gibi bırakmak bazen daha iyidir (kullanıcı hatasını görsün diye),
          // ama temiz bir 404 deneyimi için /app'e çekip not-found gösterebiliriz.
          // Şimdilik sadece parametreleri temizliyoruz.
          const base = window.location.pathname;
          safeHistoryUpdate(base, 'replace');
      } catch (e) {}
  };

  const handleExitSharedMode = () => {
      exitSharedMode();
      setViewMode('explore');
      clearUrlParams();
  };

  const handleExitProfileMode = () => {
      setViewingProfileUsername(null);
      setViewMode('explore');
      try {
          const url = new URL(window.location.href);
          url.searchParams.delete('u');
          safeHistoryUpdate(url.pathname + url.search, 'push');
      } catch (e) {}
  };

  const navigateToProfile = (username: string) => {
      setViewingProfileUsername(username);
      setViewModeState('profile');
      try {
          const url = new URL(window.location.href);
          url.searchParams.set('u', username);
          safeHistoryUpdate(url.toString(), 'push');
      } catch (e) {}
  };

  return {
      viewMode,
      setViewMode,
      viewingProfileUsername,
      isSharedLoading,
      handleExitSharedMode,
      handleExitProfileMode,
      navigateToProfile
  };
};
