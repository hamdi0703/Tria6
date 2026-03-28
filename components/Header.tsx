
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl, getAvatarPersona } from '../utils/avatarUtils';

interface HeaderProps {
  onSearchToggle: () => void;
  isSearchVisible: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'explore' | 'dashboard' | 'discover-app'; 
  setViewMode: (mode: 'explore' | 'dashboard' | 'discover-app') => void;
  listCount: number;
  onOpenProfile: () => void;
  onOpenFeedback: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearchToggle, 
  isSearchVisible, 
  searchQuery, 
  onSearchChange,
  viewMode,
  setViewMode,
  listCount,
  onOpenProfile,
  onOpenFeedback
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, openAuthModal } = useAuth();
  
  const avatarId = user?.user_metadata?.avatar_url;
  const resolvedAvatarUrl = getAvatarUrl(avatarId);
  const persona = getAvatarPersona(avatarId);

  // Ortak navigasyon işleyicisi: Sayfayı yukarı kaydırır ve arama çubuğunu temizler
  const handleNavigation = (mode: 'explore' | 'dashboard' | 'discover-app') => {
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Sayfa başına git
      onSearchChange(''); // Aramayı temizle
      setViewMode(mode);
  };

  return (
    <header className="sticky top-0 z-header w-full bg-vista-light/80 dark:bg-vista-dark/80 backdrop-blur-md transition-colors duration-300 border-b border-transparent dark:border-neutral-800/50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          
          {/* Brand & Nav */}
          <div className="flex items-center gap-6 flex-shrink-0">
              {/* Logo now goes to Landing Page ('discover-app') */}
              <div
                  onClick={() => handleNavigation('discover-app')}
                  className="flex items-center gap-2 select-none cursor-pointer hover:opacity-80 transition-opacity group"
                  role="button"
                  tabIndex={0}
                  aria-label="İzleme Listem Anasayfa"
              >
                  <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white dark:text-black translate-x-[1px]">
                          <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                      </svg>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-neutral-900 dark:text-white">
                      İzleme Listem
                  </h1>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex bg-neutral-100 dark:bg-neutral-800/50 rounded-full p-1">
                  <button
                      onClick={() => handleNavigation('explore')}
                      className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                          viewMode === 'explore' 
                          ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-sm' 
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                  >
                      Keşfet
                  </button>
                  <button
                      onClick={() => handleNavigation('dashboard')}
                      className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                          viewMode === 'dashboard' 
                          ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-sm' 
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                  >
                      Koleksiyon
                      {listCount > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${viewMode === 'dashboard' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-neutral-300 dark:bg-neutral-600 text-black dark:text-white'}`}>
                              {listCount}
                          </span>
                      )}
                  </button>
              </nav>
          </div>

          {/* Search Bar - Only show on Explore/Dashboard (Not on Landing page usually, but keeping logic simpler) */}
          <div className="flex-1 max-w-xl mx-auto relative group hidden sm:block">
            {viewMode !== 'discover-app' && (
                <>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Film, dizi veya kişi ara..."
                        aria-label="İçerik Ara"
                        className="block w-full pl-10 pr-10 py-2.5 border-none rounded-xl leading-5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner sm:text-sm"
                    />
                    {searchQuery && (
                        <button 
                        onClick={() => onSearchChange('')}
                        aria-label="Aramayı Temizle"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                        >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        </button>
                    )}
                </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

            {/* Mobile Search Toggle (Only if not Landing) */}
            {viewMode !== 'discover-app' && (
                <button 
                className="sm:hidden p-2 text-neutral-900 dark:text-white"
                onClick={onSearchToggle}
                aria-label="Aramayı Aç/Kapat"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                </button>
            )}

            {/* Feedback Button */}
            <button
                onClick={onOpenFeedback}
                className="hidden sm:flex items-center justify-center p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                title="Geri Bildirim / İletişim"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 01-2-2h14a2 2 0 01 2 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>

            <button 
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
              className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-900 dark:text-white"
            >
              {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
              )}
            </button>

            {/* Auth/Profile Trigger */}
            {user ? (
               <button 
                  onClick={onOpenProfile}
                  aria-label="Profil Menüsünü Aç"
                  style={{ background: `linear-gradient(135deg, ${persona.bgStart}, ${persona.bgEnd})` }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md hover:ring-2 hover:ring-offset-2 hover:ring-indigo-500 transition-all border border-white/20 overflow-hidden"
                >
                    <img src={resolvedAvatarUrl} alt="Avatar" className="w-full h-full object-cover transform scale-90" />
                </button>
            ) : (
                <button
                  onClick={openAuthModal}
                  className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  Giriş
                </button>
            )}
          </div>
        </div>
        
        {/* Mobile Search Expanded View */}
        {viewMode !== 'discover-app' && (
            <div className={`sm:hidden overflow-hidden transition-all duration-300 ${isSearchVisible ? 'h-16 border-t border-neutral-200 dark:border-neutral-800' : 'h-0'}`}>
            <div className="px-4 h-full flex items-center">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Ne izlemek istiyorsun?"
                    aria-label="Mobilde İçerik Ara"
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white px-4 py-2 rounded-xl text-sm outline-none"
                    autoFocus={isSearchVisible}
                />
            </div>
            </div>
        )}
      </header>
  );
};

export default Header;
