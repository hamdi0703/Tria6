
import React from 'react';

interface GameHubModalProps {
  onClose: () => void;
  onNavigate: (game: 'roulette' | 'frame-focus' | 'cine-match') => void;
}

const GameHubModal: React.FC<GameHubModalProps> = ({ onClose, onNavigate }) => {
  
  const GAMES = [
    {
      id: 'cine-match',
      title: 'CineMatch',
      desc: 'Film zevkini arkadaşınla eşleştir. Sağa kaydır, ortak noktayı bul.',
      color: 'bg-rose-500',
      gradient: 'from-rose-500 to-pink-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'frame-focus',
      title: 'Frame Focus',
      desc: 'Sinema bilgini sına. Bulanık sahnelerden filmi tahmin etmeye çalış.',
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-purple-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      id: 'roulette',
      title: 'CineRoulette',
      desc: 'Ne izleyeceğine karar veremiyor musun? Şansına güven, kasayı aç.',
      color: 'bg-amber-500',
      gradient: 'from-amber-500 to-orange-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-[#09090b] rounded-[2.5rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden animate-slide-in-up">
        
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Oyun Alanı</h2>
                <p className="text-sm text-neutral-500 font-medium mt-1">Sinema deneyimini oyunlaştır.</p>
            </div>
            <button 
                onClick={onClose} 
                className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-500 dark:text-neutral-400"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-2 space-y-4">
            {GAMES.map((game) => (
                <button
                    key={game.id}
                    onClick={() => {
                        onNavigate(game.id as any);
                        onClose();
                    }}
                    className="w-full group relative flex items-center gap-5 p-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-900 hover:border-neutral-200 dark:hover:border-neutral-700 hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-none transition-all duration-300 text-left overflow-hidden"
                >
                    {/* Hover Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${game.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                    {/* Icon Box */}
                    <div className={`w-16 h-16 rounded-2xl ${game.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                        {game.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {game.title}
                            </h3>
                            <svg className="w-4 h-4 text-neutral-300 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                            {game.desc}
                        </p>
                    </div>
                </button>
            ))}
        </div>

      </div>
    </div>
  );
};

export default GameHubModal;
