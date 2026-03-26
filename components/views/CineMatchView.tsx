
import React, { useState, useEffect, useRef } from 'react';
import { useCineMatch } from '../../hooks/useCineMatch';
import { IMAGE_BASE_URL, CARD_IMAGE_BASE_URL } from '../../services/tmdbService';
import { Genre, Movie, SessionFilters } from '../../types';
import { useCollectionContext } from '../../context/CollectionContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/avatarUtils';

// --- TYPES ---
interface CineMatchViewProps {
    genres: Genre[];
    onExit: () => void;
    onGoToDetail: (movie: Movie) => void;
}

type ViewState = 'MENU' | 'HOST_SETUP' | 'GUEST_JOIN' | 'LOBBY' | 'SWIPE' | 'SUMMARY';

// --- SUB-COMPONENTS ---

const MenuScreen: React.FC<{ onHost: () => void; onGuest: () => void; onExit: () => void }> = ({ onHost, onGuest, onExit }) => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-fade-in relative z-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        
        <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-2 italic transform -skew-x-6">
                Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">Match</span>
            </h1>
            <p className="text-neutral-400 text-sm md:text-base font-medium max-w-sm mx-auto">
                Film seçme krizine son. Eşleş, yakala, izle.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl mb-8">
            <button onClick={onHost} className="group relative bg-neutral-900 border border-white/10 hover:border-rose-500/50 p-8 rounded-3xl text-left transition-all hover:shadow-2xl hover:shadow-rose-900/20 overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                    <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full blur-2xl"></div>
                </div>
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                        🔥
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Oturum Başlat</h3>
                    <p className="text-sm text-neutral-400 group-hover:text-neutral-300">
                        Odayı kur, filtreleri ayarla ve arkadaşını davet et.
                    </p>
                </div>
            </button>

            <button onClick={onGuest} className="group relative bg-neutral-900 border border-white/10 hover:border-indigo-500/50 p-8 rounded-3xl text-left transition-all hover:shadow-2xl hover:shadow-indigo-900/20 overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full blur-2xl"></div>
                </div>
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        🚀
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Oturuma Katıl</h3>
                    <p className="text-sm text-neutral-400 group-hover:text-neutral-300">
                        Arkadaşının verdiği kodu gir ve eşleşmeye başla.
                    </p>
                </div>
            </button>
        </div>

        <button onClick={onExit} className="text-neutral-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
            Çıkış
        </button>
    </div>
);

const HostSetupScreen: React.FC<{ 
    genres: Genre[]; 
    onStart: (filters: SessionFilters) => void; 
    onBack: () => void; 
    isLoading: boolean;
}> = ({ genres, onStart, onBack, isLoading }) => {
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
    const [minRating, setMinRating] = useState(7);
    const [year, setYear] = useState<number | null>(null);

    const toggleGenre = (id: number) => {
        setSelectedGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
    };

    const handleStart = () => {
        onStart({
            mediaType,
            minRating,
            year,
            duration: 'ANY',
            genres: selectedGenres
        });
    };

    const currentYear = new Date().getFullYear();
    const decades = [
        { label: 'Karışık', val: null },
        { label: '2020+', val: 2020 },
        { label: '2010s', val: 2010 },
        { label: '2000s', val: 2000 },
        { label: '90s', val: 1990 },
        { label: 'Klasikler', val: 1970 }
    ];

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in font-sans overflow-hidden">
            
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-rose-900/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{animationDelay: '2s'}}></div>

            <div className="relative z-10 w-full max-w-2xl h-full overflow-y-auto custom-scrollbar">
                <div className="text-center mb-8 pt-4">
                    <h2 className="text-4xl font-black text-white tracking-tight mb-2">Sahne Senin</h2>
                    <p className="text-neutral-400">Kuralları belirle, eşleşmeyi başlat.</p>
                </div>
                
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl mb-4">
                    
                    {/* 1. Format Selection */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button 
                            onClick={() => setMediaType('movie')} 
                            className={`relative group p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 overflow-hidden ${mediaType === 'movie' ? 'bg-rose-600/10 border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.3)]' : 'bg-neutral-900/50 border-white/5 hover:bg-neutral-800'}`}
                        >
                            <div className={`p-3 rounded-full transition-colors ${mediaType === 'movie' ? 'bg-rose-500 text-white' : 'bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700 group-hover:text-white'}`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                            </div>
                            <span className={`text-sm font-bold uppercase tracking-wider ${mediaType === 'movie' ? 'text-white' : 'text-neutral-500'}`}>Film</span>
                            {mediaType === 'movie' && <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_5px_currentColor]"></div>}
                        </button>

                        <button 
                            onClick={() => setMediaType('tv')} 
                            className={`relative group p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 overflow-hidden ${mediaType === 'tv' ? 'bg-rose-600/10 border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.3)]' : 'bg-neutral-900/50 border-white/5 hover:bg-neutral-800'}`}
                        >
                            <div className={`p-3 rounded-full transition-colors ${mediaType === 'tv' ? 'bg-rose-500 text-white' : 'bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700 group-hover:text-white'}`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <span className={`text-sm font-bold uppercase tracking-wider ${mediaType === 'tv' ? 'text-white' : 'text-neutral-500'}`}>Dizi</span>
                            {mediaType === 'tv' && <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_5px_currentColor]"></div>}
                        </button>
                    </div>

                    {/* 2. Rating Slider (Neon Style) */}
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-4">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Minimum Kalite</label>
                            <div className="flex items-center gap-2 text-2xl font-black text-white">
                                <span>{minRating}</span>
                                <span className="text-sm text-rose-500 font-bold mb-1">+</span>
                            </div>
                        </div>
                        <div className="relative h-6 flex items-center">
                            {/* Track */}
                            <div className="absolute w-full h-2 bg-neutral-800 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="h-full bg-gradient-to-r from-neutral-600 via-rose-500 to-rose-400 transition-all duration-150" 
                                    style={{ width: `${(minRating / 9) * 100}%` }}
                                ></div>
                            </div>
                            {/* Slider Input */}
                            <input 
                                type="range" 
                                min="0" 
                                max="9" 
                                step="1" 
                                value={minRating} 
                                onChange={e => setMinRating(parseInt(e.target.value))} 
                                className="absolute w-full h-full opacity-0 cursor-pointer z-10" 
                            />
                            {/* Thumb (Visual) */}
                            <div 
                                className="absolute h-6 w-6 bg-white border-2 border-rose-500 rounded-full shadow-[0_0_15px_rgba(225,29,72,0.6)] pointer-events-none transition-all duration-150 transform -translate-x-1/2 flex items-center justify-center"
                                style={{ left: `${(minRating / 9) * 100}%` }}
                            >
                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Decade Selector (Pills) */}
                    <div className="mb-8">
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Zaman Dilimi</label>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {decades.map((d) => (
                                <button
                                    key={d.label}
                                    onClick={() => setYear(d.val)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                                        year === d.val 
                                        ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                        : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-neutral-300'
                                    }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Genres (Interactive Grid) */}
                    <div className="mb-2">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Türler</label>
                            <span className="text-[10px] text-rose-500 font-bold">{selectedGenres.length > 0 ? `${selectedGenres.length} Seçildi` : 'Tümü'}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                            {genres.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => toggleGenre(g.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-200 ${
                                        selectedGenres.includes(g.id) 
                                        ? 'bg-rose-600 border-rose-500 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]' 
                                        : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'
                                    }`}
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-4 pb-8">
                    <button 
                        onClick={onBack} 
                        className="px-6 py-4 rounded-2xl bg-transparent border border-white/10 text-white font-bold hover:bg-white/5 transition-colors"
                    >
                        Vazgeç
                    </button>
                    <button 
                        onClick={handleStart} 
                        disabled={isLoading} 
                        className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(225,29,72,0.4)] disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2 group"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Hazırlanıyor...</span>
                        ) : (
                            <>
                                <span>ODAYI KUR</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const GuestJoinScreen: React.FC<{ onJoin: (code: string) => void; onBack: () => void; isLoading: boolean }> = ({ onJoin, onBack, isLoading }) => {
    const [code, setCode] = useState('');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in relative z-10 max-w-md mx-auto text-center">
            <h2 className="text-3xl font-black text-white mb-2">Kodu Gir</h2>
            <p className="text-neutral-400 text-sm mb-8">Arkadaşının paylaştığı 6 haneli kodu gir.</p>
            
            <input 
                type="text" 
                value={code} 
                onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                className="w-full bg-neutral-900 border-2 border-neutral-700 focus:border-indigo-500 rounded-2xl px-6 py-4 text-center text-4xl font-black text-white tracking-[0.5em] mb-8 outline-none transition-all placeholder-neutral-800"
                placeholder="000000"
            />

            <div className="flex gap-4 w-full">
                <button onClick={onBack} className="px-6 py-4 rounded-xl bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition-colors">Geri</button>
                <button 
                    onClick={() => onJoin(code)} 
                    disabled={code.length !== 6 || isLoading}
                    className="flex-1 px-6 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Bağlanılıyor...' : 'Katıl'}
                </button>
            </div>
        </div>
    );
};

const LobbyScreen: React.FC<{ sessionCode: string; onCopy: () => void; waitingForGuest: boolean }> = ({ sessionCode, onCopy, waitingForGuest }) => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-fade-in text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </div>
        
        <h2 className="text-3xl font-black text-white mb-2">
            {waitingForGuest ? 'Arkadaşını Bekliyor...' : 'Eşleşme Başlıyor!'}
        </h2>
        <p className="text-neutral-400 text-sm mb-8">
            {waitingForGuest ? 'Aşağıdaki kodu arkadaşınla paylaş.' : 'Her ikiniz de hazır olduğunuzda başlar.'}
        </p>

        <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full mb-8 relative group cursor-pointer" onClick={onCopy}>
            <div className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-1">Oda Kodu</div>
            <div className="text-5xl font-mono font-black text-white tracking-widest">{sessionCode}</div>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl backdrop-blur-sm">
                <span className="text-sm font-bold text-white">Kopyala</span>
            </div>
        </div>

        {waitingForGuest && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 animate-pulse">
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                Bağlantı bekleniyor...
            </div>
        )}
    </div>
);

const SwipeScreen: React.FC<{ 
    movie: Movie; 
    onVote: (dir: 'LEFT' | 'RIGHT') => void; 
    currentIndex: number;
    total: number;
}> = ({ movie, onVote, currentIndex, total }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden relative touch-none">
            {/* Progress Bar */}
            <div className="absolute top-4 left-4 right-4 h-1 bg-neutral-800 rounded-full overflow-hidden z-20">
                <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${(currentIndex / total) * 100}%` }}></div>
            </div>

            {/* Main Card */}
            <div className="relative w-full max-w-sm aspect-[2/3] bg-black rounded-3xl shadow-2xl overflow-hidden border border-white/10 animate-scale-in">
                <img src={`${CARD_IMAGE_BASE_URL}${movie.poster_path}`} className="w-full h-full object-cover" alt={movie.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-black to-transparent">
                    <h2 className="text-3xl font-black text-white leading-tight mb-2 drop-shadow-lg">{movie.title || movie.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-neutral-300 font-medium mb-4">
                        <span>{movie.release_date?.substring(0,4)}</span>
                        <span className="w-1 h-1 bg-neutral-500 rounded-full"></span>
                        <span className="flex items-center gap-1 text-yellow-400"><span className="text-lg">★</span> {movie.vote_average.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed opacity-90">{movie.overview}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-6 mt-8 z-20">
                <button 
                    onClick={() => onVote('LEFT')}
                    className="w-16 h-16 rounded-full bg-neutral-900 border-2 border-red-500/50 text-red-500 flex items-center justify-center text-2xl shadow-lg hover:bg-red-500 hover:text-white hover:scale-110 transition-all active:scale-95"
                >
                    ✕
                </button>
                <button 
                    onClick={() => onVote('RIGHT')}
                    className="w-16 h-16 rounded-full bg-neutral-900 border-2 border-green-500/50 text-green-500 flex items-center justify-center text-2xl shadow-lg hover:bg-green-500 hover:text-white hover:scale-110 transition-all active:scale-95"
                >
                    ♥
                </button>
            </div>
        </div>
    );
};

const MatchPopup: React.FC<{ movie: Movie; onClose: () => void }> = ({ movie, onClose }) => (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in">
        <div className="bg-[#101010] border border-rose-500/30 w-full max-w-sm rounded-3xl p-8 text-center relative shadow-[0_0_50px_rgba(225,29,72,0.3)] animate-slide-in-up">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-6xl">✨</div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 mb-2 italic">EŞLEŞTİNİZ!</h2>
            <p className="text-neutral-400 text-sm mb-6">İkiniz de bunu beğendiniz.</p>
            
            <div className="rounded-xl overflow-hidden shadow-2xl mb-6 border border-white/10 mx-auto w-48 aspect-[2/3]">
                <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} className="w-full h-full object-cover" alt="" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-6">{movie.title || movie.name}</h3>
            
            <button onClick={onClose} className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-neutral-200 transition-colors uppercase tracking-widest text-sm">
                Devam Et
            </button>
        </div>
    </div>
);

const SummaryScreen: React.FC<{ matches: Movie[]; onExit: () => void; onDetail: (m: Movie) => void }> = ({ matches, onExit, onDetail }) => (
    <div className="absolute inset-0 bg-black h-full overflow-y-auto custom-scrollbar">
        <div className="min-h-full p-6 pb-32">
            <div className="text-center mb-10 pt-10">
                <h2 className="text-3xl font-black text-white mb-2">Oturum Özeti</h2>
                <p className="text-neutral-400">Toplam {matches.length} ortak film bulundu.</p>
            </div>

            {matches.length === 0 ? (
                <div className="text-center py-20 text-neutral-500">
                    <div className="text-4xl mb-4">💔</div>
                    <p>Maalesef ortak bir nokta bulamadınız.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {matches.map(m => (
                        <div key={m.id} onClick={() => onDetail(m)} className="bg-neutral-900 rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-rose-500 transition-colors group">
                            <div className="aspect-[2/3] relative">
                                <img src={`${IMAGE_BASE_URL}${m.poster_path}`} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-xs font-bold text-white bg-black/50 px-3 py-1 rounded-full border border-white/20">Detaylar</span>
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="text-sm font-bold text-white truncate">{m.title || m.name}</h4>
                                <span className="text-[10px] text-neutral-500">{m.release_date?.substring(0,4)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
            <div className="pointer-events-auto flex justify-center">
                <button onClick={onExit} className="px-8 py-3 bg-white text-black font-bold rounded-full shadow-xl hover:scale-105 transition-transform">
                    Ana Menüye Dön
                </button>
            </div>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

const CineMatchView: React.FC<CineMatchViewProps> = ({ genres, onExit, onGoToDetail }) => {
    const { 
        user,
        session,
        movies,
        currentIndex,
        matches,
        lastMatch,
        loading,
        startSession,
        joinSession,
        vote,
        closeMatchPopup,
        isFinished 
    } = useCineMatch();

    const { showToast } = useToast();
    const { openAuthModal } = useAuth(); // AUTH HOOK
    const [viewState, setViewState] = useState<ViewState>('MENU');

    // State Transitions
    useEffect(() => {
        if (session) {
            if (session.status === 'WAITING') {
                setViewState('LOBBY');
            } else if (session.status === 'ACTIVE') {
                if (isFinished) {
                    setViewState('SUMMARY');
                } else {
                    setViewState('SWIPE');
                }
            }
        }
    }, [session?.status, isFinished]);

    const handleCopyCode = () => {
        if (session?.code) {
            navigator.clipboard.writeText(session.code);
            showToast('Kod kopyalandı!', 'success');
        }
    };

    const handleDetailRedirect = (movie: Movie) => {
        onGoToDetail(movie);
    };

    // --- REVISED AUTH & NAVIGATION LOGIC ---
    
    // 1. Menu buttons now just navigate, NO auth check here
    const handleHostClick = () => {
        setViewState('HOST_SETUP');
    };

    const handleGuestClick = () => {
        setViewState('GUEST_JOIN');
    };

    // 2. Auth check moved to the final action (Start Session)
    const handleStartSession = (filters: SessionFilters) => {
        if (!user) {
            showToast('Oda oluşturmak için giriş yapmalısınız.', 'info');
            openAuthModal();
            return;
        }
        startSession(filters);
    };

    // 3. Auth check moved to the final action (Join Session)
    const handleJoinSession = (code: string) => {
        if (!user) {
            showToast('Katılmak için giriş yapmalısınız.', 'info');
            openAuthModal();
            return;
        }
        joinSession(code);
    };

    // --- RENDER ---
    return (
        <div className="fixed inset-0 bg-black z-toast text-white font-sans overflow-hidden">
            
            {/* MATCH POPUP OVERLAY */}
            {lastMatch && <MatchPopup movie={lastMatch} onClose={closeMatchPopup} />}

            {/* SCREEN SWITCHER */}
            {viewState === 'MENU' && (
                <MenuScreen 
                    onHost={handleHostClick} 
                    onGuest={handleGuestClick} 
                    onExit={onExit} 
                />
            )}

            {viewState === 'HOST_SETUP' && (
                <HostSetupScreen 
                    genres={genres} 
                    isLoading={loading}
                    onStart={handleStartSession} 
                    onBack={() => setViewState('MENU')} 
                />
            )}

            {viewState === 'GUEST_JOIN' && (
                <GuestJoinScreen 
                    onJoin={handleJoinSession} 
                    isLoading={loading}
                    onBack={() => setViewState('MENU')} 
                />
            )}

            {viewState === 'LOBBY' && session && (
                <LobbyScreen 
                    sessionCode={session.code} 
                    onCopy={handleCopyCode} 
                    waitingForGuest={session.status === 'WAITING'} 
                />
            )}

            {viewState === 'SWIPE' && movies[currentIndex] && (
                <SwipeScreen 
                    movie={movies[currentIndex]} 
                    onVote={vote}
                    currentIndex={currentIndex}
                    total={movies.length}
                />
            )}

            {viewState === 'SUMMARY' && (
                <SummaryScreen 
                    matches={matches} 
                    onExit={onExit} 
                    onDetail={handleDetailRedirect}
                />
            )}
        </div>
    );
};

export default CineMatchView;
