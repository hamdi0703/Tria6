
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
    <div className={`relative w-full max-w-[400px] mx-auto bg-gradient-to-br from-[#0a0a0a] to-[#050505] rounded-[28px] overflow-hidden shadow-2xl ring-1 ring-white/10 font-sans group select-none transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] ${tier === 'PRO' || tier === 'ADMIN' ? style.glow : ''}`}>
      
      {/* 1. ATMOSPHERE & BACKGROUND */}
      {/* Persona specific gradient background with blur */}
      <div className="absolute inset-0 opacity-30 bg-gradient-to-br transition-opacity duration-500 group-hover:opacity-40" style={{ backgroundImage: `linear-gradient(135deg, ${persona.bgStart}, ${persona.bgEnd})` }}></div>

      {/* Dynamic light effects */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-white/10 blur-[80px] rounded-full pointer-events-none mix-blend-overlay"></div>
      <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-black/80 blur-[60px] rounded-full pointer-events-none"></div>

      {/* Noise Texture for premium feel */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }}></div>

      {/* Glass Edge Highlight */}
      <div className={`absolute inset-0 rounded-[28px] ring-1 ring-inset ${style.border} pointer-events-none`}></div>
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="relative z-10 flex flex-col h-full p-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex items-center gap-5 mb-8">
            {/* Avatar with Floating Effect */}
            <div className="relative shrink-0">
                <div className={`w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-neutral-800 via-neutral-500 to-neutral-800 shadow-2xl ${tier === 'PRO' ? 'from-indigo-500 via-purple-500 to-indigo-500' : ''}`}>
                    <img 
                        src={avatarUrl} 
                        alt={username} 
                        className="w-full h-full rounded-full object-cover bg-[#0a0a0a] border-2 border-[#050505]" 
                    />
                </div>
                {/* Status Indicator Dot */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-4 border-[#050505] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            </div>

            <div className="flex flex-col justify-center">
                {/* Badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-white/5 backdrop-blur-sm mb-1.5 w-fit ${style.badge} bg-opacity-20`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.badge} shadow-[0_0_5px_currentColor]`}></span>
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">{style.text}</span>
                </div>
                {/* Username */}
                <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-1.5">{username}</h1>
                <div className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">ID: {username.substring(0,4).toUpperCase()}-{new Date().getFullYear()}</div>
            </div>
        </div>

        {/* Bio Section */}
        <div className="mb-8 relative">
            <svg className="absolute -top-2 -left-2 w-4 h-4 text-white/10" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
            <p className="text-sm text-neutral-300 font-medium leading-relaxed pl-4 border-l-2 border-white/10 italic">
                {bio || "Cinema enthusiast tracking their journey through film and television."}
            </p>
        </div>

        {/* --- STATISTICS ROW (3-Column Grid) --- */}
        <div className="grid grid-cols-3 gap-3 mb-8 bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
            
            {/* Column 1: Total Watched */}
            <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Watched</span>
                <span className="text-2xl font-black text-white">{stats.totalWatched}</span>
            </div>

            {/* Column 2: Lists Created */}
            <div className="flex flex-col items-center justify-center gap-1 border-l border-r border-white/10">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Lists</span>
                <span className="text-2xl font-black text-white">{stats.listsCreated}</span>
            </div>

            {/* Column 3: Avg Score */}
            <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Avg Score</span>
                <div className="flex items-center gap-1">
                    <span className="text-2xl font-black text-white">{stats.avgScore}</span>
                    <svg className="w-3.5 h-3.5 text-yellow-500 fill-current drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </div>
            </div>
        </div>

        {/* --- SHOWCASE SECTION (Visual Hook) --- */}
        <div className="mt-auto">
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                    <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Top Favorites</h3>
                </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2.5">
                {favorites.slice(0, 4).map((poster, idx) => (
                    <div 
                        key={idx} 
                        className="aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900 ring-1 ring-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.5)] relative group/poster"
                    >
                        <img 
                            src={poster} 
                            alt="Favorite" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/poster:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-xl pointer-events-none"></div>
                    </div>
                ))}
                
                {/* Empty Slot Fillers */}
                {[...Array(Math.max(0, 4 - favorites.length))].map((_, i) => (
                     <div key={`empty-${i}`} className="aspect-[2/3] rounded-xl bg-white/5 border border-white/5 border-dashed flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-white/20"></div>
                     </div>
                ))}
            </div>
        </div>

        {/* --- FOOTER DECORATION --- */}
        <div className="mt-6 flex justify-between items-end border-t border-white/10 pt-4">
             <div className="flex items-center gap-1.5">
                 <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                     <svg className="w-3 h-3 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                 </div>
                 <span className="font-bold text-[10px] tracking-widest text-white">İzleme Listem</span>
             </div>
             <div className="text-[9px] text-white/40 font-bold uppercase tracking-wider bg-white/5 px-2 py-1 rounded-md">
                 Est. {memberSince}
             </div>
        </div>

      </div>
    </div>
  );
};

export default TriaPassport;
