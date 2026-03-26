
import React, { useState, useEffect } from 'react';
import { ViewMode } from '../../hooks/useAppNavigation';

interface GameShowcaseProps {
    onNavigate: (mode: ViewMode) => void;
}

// --- SUB-BOARD COMPONENTS ---

// 1. NEW: Interactive Board: CineMatch (Swipe Effect)
const CineMatchBoard = () => {
    const [swipeState, setSwipeState] = useState<'CENTER' | 'RIGHT' | 'LEFT'>('CENTER');

    useEffect(() => {
        const sequence = async () => {
            while (true) {
                await new Promise(r => setTimeout(r, 1500)); // Wait center
                setSwipeState('RIGHT'); // Like
                await new Promise(r => setTimeout(r, 800)); // Animation duration
                setSwipeState('CENTER'); // Reset (Instant visual reset logic handled in CSS/Render usually, but here simplified)
                
                await new Promise(r => setTimeout(r, 1500));
                setSwipeState('LEFT'); // Nope
                await new Promise(r => setTimeout(r, 800));
                setSwipeState('CENTER');
            }
        };
        sequence();
    }, []);

    // Dynamic styles based on state
    let cardStyle = "translate-x-0 rotate-0 opacity-100";
    let overlayColor = "bg-transparent";
    let badge = null;

    if (swipeState === 'RIGHT') {
        cardStyle = "translate-x-32 rotate-12 opacity-0"; // Fly Right
        overlayColor = "bg-green-500/20";
        badge = (
            <div className="absolute top-4 left-4 border-4 border-green-500 text-green-500 font-black text-2xl px-2 py-1 rounded-lg transform -rotate-12 opacity-100 transition-opacity">
                LIKE
            </div>
        );
    } else if (swipeState === 'LEFT') {
        cardStyle = "-translate-x-32 -rotate-12 opacity-0"; // Fly Left
        overlayColor = "bg-red-500/20";
        badge = (
            <div className="absolute top-4 right-4 border-4 border-red-500 text-red-500 font-black text-2xl px-2 py-1 rounded-lg transform rotate-12 opacity-100 transition-opacity">
                NOPE
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-neutral-900 rounded-2xl relative overflow-hidden border border-white/10 flex items-center justify-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-900/40 via-neutral-900 to-neutral-900"></div>

            {/* Stacked Card (Behind) */}
            <div className="absolute w-40 h-60 bg-neutral-800 rounded-xl border border-white/5 shadow-xl transform scale-90 translate-y-4 -rotate-3 opacity-60"></div>
            <div className="absolute w-40 h-60 bg-neutral-800 rounded-xl border border-white/5 shadow-xl transform scale-95 translate-y-2 rotate-3 opacity-80"></div>

            {/* Active Card */}
            <div className={`relative w-40 h-60 bg-black rounded-xl border-4 border-white/10 shadow-2xl overflow-hidden transform transition-all duration-700 ease-in-out ${cardStyle}`}>
                <img 
                    src="https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg" // Avatar 2 or similar colorful poster
                    className="absolute inset-0 w-full h-full object-cover" 
                    alt="Swipe"
                />
                <div className={`absolute inset-0 ${overlayColor} transition-colors duration-300`}></div>
                
                {/* Info Area */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-3 pt-8">
                    <h4 className="text-white font-bold text-sm leading-tight">Avatar: Way of Water</h4>
                    <span className="text-[10px] text-neutral-300">Bilim Kurgu • 2022</span>
                </div>

                {badge}
            </div>

            {/* Floating Action Buttons Visual */}
            <div className="absolute bottom-6 flex gap-8">
                <div className={`w-10 h-10 rounded-full bg-neutral-800 border border-red-500/30 flex items-center justify-center text-red-500 shadow-lg transition-transform ${swipeState === 'LEFT' ? 'scale-125 bg-red-500 text-white' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <div className={`w-10 h-10 rounded-full bg-neutral-800 border border-green-500/30 flex items-center justify-center text-green-500 shadow-lg transition-transform ${swipeState === 'RIGHT' ? 'scale-125 bg-green-500 text-white' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
            </div>
        </div>
    );
};

// 2. Interactive Board: Frame Focus
const FrameFocusBoard = () => {
    const [blur, setBlur] = useState(20);
    return (
        <div 
            className="w-full h-full bg-neutral-900 rounded-2xl relative overflow-hidden group cursor-crosshair border border-white/10"
            onMouseEnter={() => setBlur(0)}
            onMouseLeave={() => setBlur(20)}
        >   
            {/* Mock Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out transform group-hover:scale-105"
                style={{ 
                    backgroundImage: "url('https://image.tmdb.org/t/p/w1280/qJ2tW6WMUDux911r6m7haRef0WH.jpg')", // The Dark Knight
                    filter: `blur(${blur}px) contrast(1.2)` 
                }}
            ></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className={`transition-all duration-500 ${blur === 0 ? 'opacity-0 scale-150' : 'opacity-100 scale-100'}`}>
                    <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center backdrop-blur-md">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </div>
                    <p className="text-white font-bold text-xs mt-2 bg-black/50 px-2 py-1 rounded text-center">Üzerine Gel</p>
                </div>
                
                <div className={`absolute bottom-6 left-6 transition-all duration-500 ${blur === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <h4 className="text-xl font-black text-white">The Dark Knight (2008)</h4>
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Doğru Tahmin!</p>
                </div>
            </div>
        </div>
    );
};

// 3. Interactive Board: CineRoulette
const CineRouletteBoard = () => {
    const posters = [
        "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg", // Fast X
        "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", // Spiderverse
        "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg", // Mario
        "https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg"  // Fast X alt
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prev => (prev + 1) % posters.length);
        }, 500); // Hızlı değişim
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full bg-neutral-900 rounded-2xl relative overflow-hidden border border-white/10 flex items-center justify-center">
            <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
            
            <div className="relative w-48 h-64 bg-black rounded-xl border-4 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)] overflow-hidden transform rotate-3">
                {posters.map((src, i) => (
                    <img 
                        key={i}
                        src={src} 
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-0 ${i === index ? 'opacity-100' : 'opacity-0'}`} 
                        alt="Roulette"
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 animate-shimmer" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-[10px] text-red-400 font-bold mt-1 uppercase">Aranıyor...</span>
                </div>
            </div>
        </div>
    );
};

// 3. Main Game Showcase Container
const GameShowcase: React.FC<GameShowcaseProps> = ({ onNavigate }) => {
    const [activeGame, setActiveGame] = useState<'MATCH' | 'ROULETTE' | 'FOCUS'>('MATCH');

    const GAMES = [
        {
            id: 'MATCH',
            title: 'CineMatch',
            desc: 'Film zevkinizi arkadaşınla eşleştir. Sağa kaydır, ortak noktayı bul.',
            icon: '🔥',
            color: 'from-rose-500 to-pink-600',
            component: <CineMatchBoard />
        },
        {
            id: 'ROULETTE',
            title: 'CineRoulette',
            desc: 'Ne izleyeceğine karar veremeyenler için rastgele seçim motoru.',
            icon: '🎰',
            color: 'from-red-500 to-orange-500',
            component: <CineRouletteBoard />
        },
        {
            id: 'FOCUS',
            title: 'Frame Focus',
            desc: 'Bulanık sahnelerden filmi tahmin ederek sinema bilgini sına.',
            icon: '👁️',
            color: 'from-indigo-500 to-purple-600',
            component: <FrameFocusBoard />
        }
    ];

    const activeData = GAMES.find(g => g.id === activeGame) || GAMES[0];

    const handlePlay = () => {
        if (activeGame === 'MATCH') {
            onNavigate('cine-match');
        } else if (activeGame === 'ROULETTE') {
            onNavigate('cine-roulette');
        } else if (activeGame === 'FOCUS') {
            onNavigate('frame-focus');
        }
    };

    return (
        <div className="grid lg:grid-cols-12 gap-8 items-stretch min-h-[500px]">
            {/* Left Menu */}
            <div className="lg:col-span-5 flex flex-col gap-4 justify-center">
                {GAMES.map((game) => (
                    <button
                        key={game.id}
                        onClick={() => setActiveGame(game.id as any)}
                        className={`group relative p-6 rounded-2xl border transition-all duration-300 text-left overflow-hidden ${
                            activeGame === game.id 
                            ? 'bg-neutral-800/80 border-white/20 shadow-2xl scale-105 z-10' 
                            : 'bg-neutral-900/40 border-transparent hover:bg-neutral-800/40 hover:border-white/5 opacity-60 hover:opacity-100'
                        }`}
                    >
                        {/* Active Glow */}
                        {activeGame === game.id && (
                            <div className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-10`}></div>
                        )}
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-neutral-950 border border-white/10 shadow-lg ${activeGame === game.id ? 'scale-110 transition-transform' : 'grayscale'}`}>
                                {game.icon}
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg ${activeGame === game.id ? 'text-white' : 'text-neutral-400'}`}>
                                    {game.title}
                                </h3>
                                <p className="text-xs text-neutral-500 mt-1 line-clamp-1 group-hover:line-clamp-none transition-all">
                                    {game.desc}
                                </p>
                            </div>
                        </div>
                        
                        {activeGame === game.id && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Right Display Board */}
            <div className="lg:col-span-7 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2.5rem] -z-10 blur-2xl"></div>
                <div className="h-full bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 p-2 shadow-2xl relative overflow-hidden flex flex-col">
                    
                    {/* Header of Board */}
                    <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-black/20">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeData.color} animate-pulse`}></div>
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Önizleme Modu</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-neutral-800"></div>
                            <div className="w-2 h-2 rounded-full bg-neutral-800"></div>
                        </div>
                    </div>

                    {/* Interactive Area */}
                    <div className="flex-1 p-4 relative">
                        <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner ring-1 ring-white/5">
                            {/* Key forces re-render on switch for animation */}
                            <div key={activeGame} className="w-full h-full animate-fade-in">
                                {activeData.component}
                            </div>
                        </div>
                    </div>

                    {/* Footer of Board */}
                    <div className="px-6 py-4 bg-neutral-900/50 flex justify-between items-center">
                        <p className="text-xs text-neutral-500 max-w-xs">{activeData.desc}</p>
                        <button 
                            onClick={handlePlay}
                            className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:scale-105 transition-transform"
                        >
                            Şimdi Oyna
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameShowcase;
