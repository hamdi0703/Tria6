
import React, { useState, useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

interface GameMenuDropdownProps {
  onRouletteClick?: () => void;
  onFrameFocusClick?: () => void;
  onCineMatchClick?: () => void;
}

const GameMenuDropdown: React.FC<GameMenuDropdownProps> = ({
  onRouletteClick,
  onFrameFocusClick,
  onCineMatchClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  // Eğer hiçbir oyun handler'ı yoksa render etme
  if (!onRouletteClick && !onFrameFocusClick && !onCineMatchClick) return null;

  return (
    <div className="relative z-50 order-first sm:order-last w-full sm:w-auto" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg border border-transparent ${
          isOpen
            ? 'bg-indigo-600 text-white shadow-indigo-500/30'
            : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800'
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
        <span className="hidden sm:inline">Oyunlar</span>
        <span className="sm:hidden">Oyun & Araçlar</span>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-full sm:w-72 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-slide-in-up">
          <div className="p-3">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2 mb-2 block">Mini Oyunlar</span>

            {onRouletteClick && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onRouletteClick();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group mb-1"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                  <span className="text-lg">🎰</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">CineRoulette</div>
                  <div className="text-[10px] text-neutral-500">Kaderindeki filmi şansa bırak.</div>
                </div>
              </button>
            )}

            {onFrameFocusClick && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onFrameFocusClick();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group mb-1"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                  <span className="text-lg">👁️</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">Frame Focus</div>
                  <div className="text-[10px] text-neutral-500">Bulanık sahneyi tahmin et.</div>
                </div>
              </button>
            )}

            {onCineMatchClick && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onCineMatchClick();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group mb-1"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                  <span className="text-lg">🔥</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">CineMatch</div>
                  <div className="text-[10px] text-neutral-500">Arkadaşınla eşleş, filmi bul.</div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMenuDropdown;
