
import React, { useMemo } from 'react';
import { SubscriptionTier } from '../../types';
import { getAvatarPersona, AVATAR_PERSONAS } from '../../utils/avatarUtils';

interface TriaPassportProps {
  username: string;
  avatarUrl: string;
  memberSince: string; // Formatted Year
  bio?: string;
  stats: {
    totalWatched: number;
    listsCreated: number;
    avgScore: string;
  };
  favorites: string[]; // Array of poster URLs
  tier?: SubscriptionTier; // Added Tier
}

const TriaPassport: React.FC<TriaPassportProps> = ({ 
    username, 
    avatarUrl, 
    memberSince, 
    bio, 
    stats,
    favorites,
    tier = 'BASIC'
}) => {
  
  // Tier Colors & Badges
  const getTierStyle = () => {
      switch(tier) {
          case 'ADMIN': return { badge: 'bg-red-500', text: 'ADMIN ACCESS', border: 'border-red-500/50', glow: 'shadow-red-500/20' };
          case 'PRO': return { badge: 'bg-indigo-500', text: 'PRO MEMBER', border: 'border-indigo-500/50', glow: 'shadow-indigo-500/20' };
          default: return { badge: 'bg-neutral-700', text: 'BASIC MEMBER', border: 'border-white/10', glow: '' };
      }
  };

  const style = getTierStyle();

  const persona = useMemo(() => {
    let personaId = '1';
    if (avatarUrl) {
        const match = avatarUrl.match(/seed=([^&]+)/);
        if (match) {
            const seed = match[1];
            const found = AVATAR_PERSONAS.find(p => p.seed === seed);
            if (found) {
                personaId = found.id;
            }
        }
    }
    return getAvatarPersona(personaId);
  }, [avatarUrl]);

  return (
    <div className={`relative w-full max-w-[380px] mx-auto aspect-[1/1.55] bg-[#050505] rounded-[24px] overflow-hidden shadow-2xl ring-1 ring-white/10 font-sans group select-none transition-transform duration-500 hover:scale-[1.01] ${tier === 'PRO' || tier === 'ADMIN' ? style.glow : ''}`}>
      
      {/* 1. ATMOSPHERE & BACKGROUND */}
      {/* Persona specific gradient background */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, ${persona.bgStart}, ${persona.bgEnd})` }}></div>
      {/* Subtle top spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-white/5 blur-[60px] rounded-full pointer-events-none"></div>
      {/* Noise Texture for premium feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }}></div>
      {/* Glass Edge Highlight */}
      <div className={`absolute inset-0 rounded-[24px] ring-1 ring-inset ${style.border} pointer-events-none`}></div>

      <div className="relative z-10 flex flex-col h-full p-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col items-center text-center mb-8">
            {/* Avatar with Glowing Border */}
            <div className="relative mb-4">
                <div className={`w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-neutral-800 via-neutral-600 to-neutral-800 shadow-xl ${tier === 'PRO' ? 'shadow-indigo-500/20' : ''}`}>
                    <img 
                        src={avatarUrl} 
                        alt={username} 
                        className="w-full h-full rounded-full object-cover bg-[#0a0a0a] border-2 border-[#050505]" 
                    />
                </div>
                {/* Status Indicator Dot */}
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-4 border-[#050505] rounded-full"></div>
            </div>

            {/* Username & Badge */}
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">{username}</h1>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm mb-3 ${style.badge} bg-opacity-20`}>
                <span className={`w-1.5 h-1.5 rounded-full ${style.badge}`}></span>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">{style.text}</span>
            </div>

            {/* Bio */}
            <p className="text-sm text-neutral-500 font-medium line-clamp-2 max-w-[240px] leading-relaxed">
                {bio || "Cinema enthusiast."}
            </p>
        </div>

        {/* --- STATISTICS ROW (3-Column Grid) --- */}
        <div className="grid grid-cols-3 gap-2 mb-10 border-t border-b border-white/5 py-6">
            
            {/* Column 1: Total Watched */}
            <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Watched</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">{stats.totalWatched}</span>
                </div>
            </div>

            {/* Column 2: Lists Created */}
            <div className="flex flex-col items-center gap-1 border-l border-r border-white/5">
                <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Lists</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">{stats.listsCreated}</span>
                </div>
            </div>

            {/* Column 3: Avg Score */}
            <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Avg Score</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold text-white">{stats.avgScore}</span>
                    <svg className="w-3 h-3 text-yellow-600 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </div>
            </div>
        </div>

        {/* --- SHOWCASE SECTION (Visual Hook) --- */}
        <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Top Favorites</h3>
                <svg className="w-4 h-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
                {favorites.slice(0, 4).map((poster, idx) => (
                    <div 
                        key={idx} 
                        className="aspect-[2/3] rounded-lg overflow-hidden bg-neutral-900 ring-1 ring-white/10 shadow-lg relative group/poster"
                    >
                        <img 
                            src={poster} 
                            alt="Favorite" 
                            className="w-full h-full object-cover opacity-80 group-hover/poster:opacity-100 transition-opacity duration-500" 
                        />
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </div>
                ))}
                
                {/* Empty Slot Fillers */}
                {[...Array(Math.max(0, 4 - favorites.length))].map((_, i) => (
                     <div key={`empty-${i}`} className="aspect-[2/3] rounded-lg bg-[#0f0f0f] ring-1 ring-white/5 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-800"></div>
                     </div>
                ))}
            </div>
        </div>

        {/* --- FOOTER DECORATION --- */}
        <div className="mt-6 flex justify-between items-end opacity-30">
             <div className="font-mono text-[8px] text-neutral-500 tracking-widest">IZLEME LISTEM ID: {username.substring(0,3).toUpperCase()}-{new Date().getFullYear()}</div>
             <div className="text-[8px] text-neutral-500 font-bold uppercase">Since {memberSince}</div>
        </div>

      </div>
    </div>
  );
};

export default TriaPassport;
