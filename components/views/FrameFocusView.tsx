
import React, { useEffect, useRef, useState } from 'react';
import { useFrameFocusEngine, Difficulty, GameMode } from '../../hooks/useFrameFocusEngine';
import { useFrameFocusRenderer } from '../../hooks/useFrameFocusRenderer';
import { TmdbService, IMAGE_BASE_URL } from '../../services/tmdbService';
import { Movie, Genre } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FilterDropdown from '../ui/FilterDropdown'; 

interface FrameFocusViewProps {
  onExit: () => void;
  onGoToDetail: (movie: Movie) => void;
}

// Simplified for XML
const GameGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-lg w-full relative animate-slide-in-up text-left">
            <button onClick={onClose} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-wider">Nasıl Oynanır?</h2>

            <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-500 flex items-center justify-center font-black flex-shrink-0">1</div>
                    <div>
                        <strong className="text-white block mb-1">Bulanık Kareler</strong>
                        Karşınıza rastgele seçilmiş filmlerden bir sahne (frame) gelecek, ancak bu sahne başlangıçta oldukça bulanık ve pikselli olacak.
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-500 flex items-center justify-center font-black flex-shrink-0">2</div>
                    <div>
                        <strong className="text-white block mb-1">Tahmin Et</strong>
                        Filmin adını arama kutusuna yazarak tahmin etmeye çalışın. Ne kadar bulanıkken bilirseniz o kadar çok puan kazanırsınız!
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-pink-600/20 text-pink-500 flex items-center justify-center font-black flex-shrink-0">3</div>
                    <div>
                        <strong className="text-white block mb-1">Yardım Al (Netleştir)</strong>
                        Eğer resmi çıkaramazsanız "Netleştir" butonunu kullanarak resmi biraz daha belirgin hale getirebilirsiniz. Ancak her netleştirme 100 puana mal olur.
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-black flex-shrink-0">4</div>
                    <div>
                        <strong className="text-white block mb-1">Can ve Süre</strong>
                        Süreli modda her soru için 30 saniyeniz vardır. Yanlış tahminler veya süre aşımı can kaybettirir. Toplam 3 canınız bittiğinde oyun sona erer. Zen modunda süre ve can derdi olmadan rahatça oynayabilirsiniz.
                    </div>
                </div>
            </div>

            <button onClick={onClose} className="mt-8 w-full py-4 bg-white text-black font-black rounded-xl hover:scale-[1.02] transition-transform">
                Anladım
            </button>
        </div>
    </div>
);

const FrameFocusView: React.FC<FrameFocusViewProps> = ({ onExit, onGoToDetail }) => {
  const { state, startGame, submitGuess, skipRound, nextRound, enhanceImage } = useFrameFocusEngine();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<any>(null);
  const listRef = useRef<HTMLDivElement>(null); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [animClass, setAnimClass] = useState('');

  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('EASY');
  const [selectedMode, setSelectedMode] = useState<GameMode>('TIMED');
  const [isSettingsOpen, setIsSettingsOpen] = useState(true); 
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
      const fetchGenres = async () => {
          const tmdb = new TmdbService();
          const res = await tmdb.getGenres('movie');
          setGenres(res.genres);
      };
      fetchGenres();
  }, []);

  useFrameFocusRenderer(
      canvasRef,
      containerRef,
      state.currentMovie,
      state.preloadedImages,
      state.distortionLevel
  );

  useEffect(() => {
      if (state.lastResult === 'CORRECT') {
          setAnimClass('border-green-500 shadow-[0_0_80px_rgba(34,197,94,0.5)] ring-4 ring-green-500/50');
      } else if (state.lastResult === 'WRONG' || state.lastResult === 'SKIP') {
          setAnimClass('animate-shake border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.5)] ring-4 ring-red-500/50');
      } else {
          setAnimClass('border-white/10');
      }
      const t = setTimeout(() => setAnimClass('border-white/10'), 800);
      return () => clearTimeout(t);
  }, [state.lastResult]);

  useEffect(() => {
      if (state.status !== 'PLAYING') {
          setSearchResults([]);
          setSelectedIndex(-1);
          return;
      }
      if (searchQuery.trim().length < 2) {
          setSearchResults([]);
          setSelectedIndex(-1);
          return;
      }
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      searchTimeoutRef.current = setTimeout(async () => {
          const tmdb = new TmdbService();
          const res = await tmdb.searchMovies(searchQuery);
          const results = res.results.filter(m => m.poster_path).slice(0, 10);
          setSearchResults(results);
          setSelectedIndex(results.length > 0 ? 0 : -1);
      }, 200);

      return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery, state.status]);

  useEffect(() => {
      if (state.status === 'PLAYING') {
          setSearchQuery('');
          setSearchResults([]);
          setSelectedIndex(-1);
          setTimeout(() => inputRef.current?.focus(), 300);
      }
  }, [state.status]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (searchResults.length === 0) return;

      if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
      } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
              submitGuess(searchResults[selectedIndex]);
          }
      }
  };

  useEffect(() => {
      if (listRef.current && selectedIndex >= 0) {
          const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
          if (selectedElement) {
              selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
      }
  }, [selectedIndex]);

  const handleStart = () => {
      startGame({ 
          genreId: selectedGenre, 
          year: selectedYear, 
          difficulty: selectedDifficulty,
          mode: selectedMode
      });
  };

  const genreOptions = [
      { label: 'Karışık Tür', value: null },
      ...genres.map(g => ({ label: g.name, value: g.id }))
  ];

  const currentYear = new Date().getFullYear();
  const currentDecade = Math.floor(currentYear / 10) * 10;
  const decadeOptions = [
      { label: 'Karışık Yıllar', value: null }
  ];
  
  for (let d = currentDecade; d >= 1970; d -= 10) {
      decadeOptions.push({ label: `${d}'ler`, value: d });
  }
  decadeOptions.push({ label: 'Klasikler (1960-)', value: 1960 });

  const difficultyOptions: { label: string, value: Difficulty }[] = [
      { label: 'Kolay (Top 100)', value: 'EASY' },
      { label: 'Orta (Top 300)', value: 'MEDIUM' },
      { label: 'Zor (Top 500)', value: 'HARD' },
  ];

  // IDLE SCREEN (START MENU)
  if (state.status === 'IDLE') {
      return (
        <div className="fixed inset-0 z-toast bg-black flex flex-col items-center justify-center p-6 text-center animate-fade-in font-sans overflow-y-auto">
            {showGuide && <GameGuide onClose={() => setShowGuide(false)} />}
            
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            
            <div className="relative z-10 max-w-2xl w-full my-auto py-10">
                <div className="mb-8">
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-[0.3em] mb-2 block animate-pulse">Cinematic Memory Test</span>
                    <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-none mb-6">
                        FRAME<span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600">FOCUS</span>
                    </h1>
                </div>

                <div className="relative z-sticky bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-3xl p-6 mb-8 max-w-md mx-auto shadow-2xl">
                    <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            Oyun Ayarları
                        </h3>
                        <svg className={`w-4 h-4 text-neutral-500 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>

                    {isSettingsOpen && (
                        <div className="space-y-4 animate-slide-in-up">
                            <div className="flex bg-neutral-800 p-1 rounded-xl">
                                <button onClick={() => setSelectedMode('TIMED')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selectedMode === 'TIMED' ? 'bg-indigo-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}>Süreli (30sn)</button>
                                <button onClick={() => setSelectedMode('ZEN')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selectedMode === 'ZEN' ? 'bg-indigo-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}>Süresiz (Zen)</button>
                            </div>
                            <div><label className="block text-xs font-bold text-neutral-500 mb-1.5 text-left ml-1">Zorluk Seviyesi</label><FilterDropdown label="Zorluk" value={selectedDifficulty} options={difficultyOptions} onChange={setSelectedDifficulty} activeColor="bg-indigo-600 text-white border border-indigo-500 shadow-lg shadow-indigo-500/20" className="w-full" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-xs font-bold text-neutral-500 mb-1.5 text-left ml-1">Tür</label><FilterDropdown label="Karışık" value={selectedGenre} options={genreOptions} onChange={setSelectedGenre} activeColor="bg-neutral-800 text-white border border-neutral-700" className="w-full" /></div>
                                <div><label className="block text-xs font-bold text-neutral-500 mb-1.5 text-left ml-1">Dönem</label><FilterDropdown label="Karışık" value={selectedYear} options={decadeOptions} onChange={setSelectedYear} activeColor="bg-neutral-800 text-white border border-neutral-700" className="w-full" /></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 justify-center mb-6 relative z-10">
                    <button onClick={handleStart} className="group relative px-12 py-5 bg-white text-black rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden"><div className="relative z-10 flex items-center gap-3 justify-center"><span>BAŞLA</span><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div></button>
                </div>

                <div className="flex items-center justify-center gap-6 relative z-10">
                    <button onClick={() => setShowGuide(true)} className="text-neutral-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Kurallar</button>
                    <button onClick={onExit} className="text-neutral-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Çıkış</button>
                </div>
            </div>
        </div>
      );
  }

  // --- PLAYING SCREEN (Mobile Optimized) ---
  return (
    <>
      <div className="fixed inset-0 z-toast bg-black text-white font-sans flex flex-col md:flex-row h-[100dvh] overflow-hidden">
          
          {/* PANEL 1: CANVAS AREA (Flexible Grow) - TOUCH ACTION ADDED */}
          <div className="flex-1 relative w-full flex items-center justify-center overflow-hidden bg-[#050505] order-1 md:order-2 touch-none">
              <div ref={containerRef} className={`relative w-full h-full md:max-w-5xl md:aspect-video bg-black shadow-2xl transition-all duration-300 md:border-2 border-white/5 ${animClass}`}>
                  <canvas ref={canvasRef} className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,black_100%)] pointer-events-none z-10"></div>
                  
                  {/* Result Overlay */}
                  {(state.status === 'REVEAL' || state.status === 'GAME_OVER') && (
                      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-40 flex flex-col items-center animate-slide-in-up">
                          <h2 className="text-2xl md:text-4xl font-black text-white text-center leading-tight mb-1">{state.currentMovie?.title}</h2>
                          <div className="flex gap-4 mt-6">
                              <button onClick={() => state.currentMovie && onGoToDetail(state.currentMovie)} className="px-6 py-3 bg-neutral-800 rounded-xl text-sm font-bold hover:bg-neutral-700 transition-colors">Detaylar</button>
                              {state.status === 'REVEAL' && (<button onClick={nextRound} className="px-8 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-neutral-200 transition-colors flex items-center gap-2">Sonraki Soru <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>)}
                          </div>
                      </div>
                  )}
              </div>
          </div>

          {/* PANEL 2: CONTROLS (Bottom Sheet Style on Mobile) */}
          <div className="flex-shrink-0 w-full md:w-[480px] bg-neutral-900 border-t md:border-t-0 md:border-r border-neutral-800 z-30 flex flex-col order-2 md:order-1 shadow-2xl relative pb-safe">
              
              {/* Top Info Bar */}
              <div className="p-3 md:p-4 flex items-center justify-between border-b border-white/5 bg-neutral-900/50 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                      <div className="bg-white text-black px-2 py-1 rounded text-[10px] font-black tracking-wider uppercase">
                          {state.filters.mode === 'TIMED' ? 'SÜRELİ' : 'ZEN'}
                      </div>
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                          Round {state.round}
                      </span>
                  </div>
                  <button onClick={onExit} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>

              {/* Stats & Game Over State */}
              <div className="p-3 md:p-4 flex-1 flex flex-col gap-4 relative overflow-y-auto min-h-[100px] md:min-h-0">
                  {state.status === 'GAME_OVER' ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in py-2">
                          <h2 className="text-2xl font-black text-white mb-1 tracking-tight">OYUN BİTTİ</h2>
                          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 mb-4 tracking-tighter">
                              {state.score}
                          </div>
                          <div className="w-full flex gap-3">
                              <button onClick={handleStart} className="flex-1 py-3 bg-white text-black rounded-xl font-bold shadow-lg">Tekrar</button>
                              <button onClick={onExit} className="flex-1 py-3 bg-neutral-800 text-neutral-400 rounded-xl font-bold">Çıkış</button>
                          </div>
                      </div>
                  ) : (
                      <div className="grid grid-cols-3 gap-2 mb-auto">
                            <div className="bg-neutral-800 rounded-xl py-3 border border-neutral-700 flex flex-col items-center justify-center">
                                <span className="text-[9px] text-neutral-500 uppercase font-bold mb-0.5">Skor</span>
                                <span className="text-xl font-black text-white leading-none">{state.score}</span>
                            </div>
                            {state.filters.mode === 'TIMED' ? (
                                <div className={`bg-neutral-800 rounded-xl py-3 border border-neutral-700 flex flex-col items-center justify-center ${state.timeLeft <= 10 ? 'border-red-500/50 bg-red-900/10' : ''}`}>
                                    <span className="text-[9px] text-neutral-500 uppercase font-bold mb-0.5">Süre</span>
                                    <span className={`text-xl font-black font-mono leading-none ${state.timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{state.timeLeft}s</span>
                                </div>
                            ) : (
                                <div className="bg-neutral-800 rounded-xl py-3 border border-neutral-700 flex flex-col items-center justify-center">
                                    <span className="text-[9px] text-neutral-500 uppercase font-bold mb-0.5">Süre</span>
                                    <span className="text-xl font-black text-white leading-none">∞</span>
                                </div>
                            )}
                            <div className="bg-neutral-800 rounded-xl py-3 border border-neutral-700 flex flex-col items-center justify-center">
                                <span className="text-[9px] text-neutral-500 uppercase font-bold mb-0.5">Can</span>
                                <div className="flex gap-1">
                                    {[...Array(3)].map((_, i) => (<div key={i} className={`w-2.5 h-2.5 rounded-full ${i < state.lives ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-neutral-700'}`}></div>))}
                                </div>
                            </div>
                      </div>
                  )}
              </div>

              {/* Input Area */}
              {state.status !== 'GAME_OVER' && (
                  <div className="p-3 md:p-4 bg-neutral-900 border-t border-neutral-800 mt-auto z-header">
                      {state.status === 'PLAYING' && (
                          <div className="relative z-50 mb-2">
                              <div className="relative group">
                                  <input 
                                      ref={inputRef}
                                      type="text"
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      onKeyDown={handleKeyDown}
                                      placeholder="Film adı yazın..."
                                      className="w-full h-12 bg-black border-2 border-neutral-700 rounded-xl px-4 text-white font-bold text-base focus:border-indigo-500 focus:bg-neutral-900 outline-none transition-all placeholder-neutral-600 shadow-xl"
                                      autoComplete="off"
                                  />
                              </div>
                              {searchResults.length > 0 && (
                                  <div ref={listRef} className="absolute bottom-full left-0 right-0 mb-2 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[80vh] overflow-y-auto animate-slide-in-up">
                                      {searchResults.map((movie, index) => (
                                            <button key={movie.id} onClick={() => submitGuess(movie)} onMouseEnter={() => setSelectedIndex(index)} className={`w-full text-left p-3 transition-all border-b border-neutral-800 flex items-center gap-3 ${index === selectedIndex ? 'bg-indigo-600 text-white' : 'hover:bg-neutral-800 text-neutral-300'}`}>
                                                <div className="w-8 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-black">{movie.poster_path && <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} className="w-full h-full object-cover" alt="" />}</div>
                                                <div className="flex-1 min-w-0"><div className="font-bold text-sm truncate">{movie.title}</div><div className="text-[10px] opacity-70">{movie.release_date?.substring(0,4)}</div></div>
                                            </button>
                                      ))}
                                  </div>
                              )}
                          </div>
                      )}
                      <div className="flex gap-2">
                          <button onClick={enhanceImage} disabled={state.status !== 'PLAYING' || state.distortionLevel <= 0} className="flex-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 rounded-xl py-3 border border-neutral-700 flex flex-col items-center justify-center group"><span className="text-xs text-white font-black uppercase tracking-wide">Netleştir</span><span className="text-[9px] font-bold text-indigo-400">-100 P</span></button>
                          <button onClick={skipRound} disabled={state.status !== 'PLAYING'} className="flex-shrink-0 w-16 bg-neutral-800 hover:bg-red-900/30 border border-neutral-700 hover:border-red-500/50 rounded-xl flex flex-col items-center justify-center group"><span className="text-xs text-neutral-400 group-hover:text-red-400 font-bold uppercase tracking-wide">PAS</span></button>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </>
  );
};

export default FrameFocusView;
