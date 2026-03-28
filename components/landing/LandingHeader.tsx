
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface LandingHeaderProps {
  onLogin: () => void;
  onNavigateApp: () => void;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ onLogin, onNavigateApp }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-black/50 backdrop-blur-xl border-white/10 py-3' 
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand */}
        <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-black text-lg shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-[1px]">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight hidden sm:block">İzleme Listem</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
            {user ? (
                <button 
                    onClick={onNavigateApp}
                    className="px-5 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"
                >
                    Uygulamaya Dön
                </button>
            ) : (
                <button 
                    onClick={onLogin}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all border ${
                        isScrolled 
                        ? 'bg-white text-black border-white hover:bg-neutral-200' 
                        : 'bg-white/10 text-white border-white/20 hover:bg-white hover:text-black backdrop-blur-md'
                    }`}
                >
                    Giriş Yap
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
