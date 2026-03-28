
import React from 'react';
import { ViewMode } from '../hooks/useAppNavigation';

interface FooterProps {
  onNavigate: (mode: ViewMode) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-neutral-100 dark:bg-[#080808] border-t border-neutral-200 dark:border-white/5 pt-16 pb-24 md:pb-12 px-6 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <div 
                onClick={() => onNavigate('discover-app')}
                className="inline-flex items-center gap-2 cursor-pointer group"
            >
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">İzleme Listem</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed font-medium max-w-xs">
              Sinema dünyasını yapay zeka ile keşfedin. Kişisel koleksiyonlar oluşturun, analiz edin ve paylaşın.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-neutral-900 dark:text-white font-bold text-sm mb-4">Keşfet</h4>
            <ul className="space-y-2.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              <li>
                  <button onClick={() => onNavigate('explore')} className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                      Ana Akış
                  </button>
              </li>
              <li>
                  <button onClick={() => onNavigate('cine-roulette')} className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                      CineRoulette
                  </button>
              </li>
              <li>
                  <button onClick={() => onNavigate('frame-focus')} className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                      Frame Focus
                  </button>
              </li>
              <li>
                  <button onClick={() => onNavigate('cine-match')} className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                      CineMatch
                  </button>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-neutral-900 dark:text-white font-bold text-sm mb-4">Hesap</h4>
            <ul className="space-y-2.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              <li>
                  <button onClick={() => onNavigate('dashboard')} className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                      Koleksiyonum
                  </button>
              </li>
              <li>
                  <button onClick={() => {}} className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-not-allowed opacity-50">
                      İstatistikler (Yakında)
                  </button>
              </li>
              <li>
                  <button onClick={() => {}} className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-not-allowed opacity-50">
                      Rozetler (Yakında)
                  </button>
              </li>
            </ul>
          </div>

          {/* Legal / Social */}
          <div>
            <h4 className="text-neutral-900 dark:text-white font-bold text-sm mb-4">Yasal & İletişim</h4>
            <ul className="space-y-2.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              <li>
                  <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Gizlilik Politikası</a>
              </li>
              <li>
                  <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Kullanım Şartları</a>
              </li>
              <li>
                  <a href="mailto:hello@tria.app" className="hover:text-indigo-600 dark:hover:text-white transition-colors">hello@tria.app</a>
              </li>
            </ul>
            
            <div className="flex gap-4 mt-6">
                <a href="#" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                </a>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-neutral-500 font-medium">
            © {currentYear} İzleme Listem. TMDB API verilerini kullanır.
          </p>
          <div className="flex gap-2 items-center">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">v2.2.0 Stable</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
