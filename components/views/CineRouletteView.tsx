
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Genre, MediaType, Movie } from '../../types';
import { TmdbService, IMAGE_BASE_URL, CARD_IMAGE_BASE_URL } from '../../services/tmdbService';
import { useCollectionContext } from '../../context/CollectionContext';
import { useToast } from '../../context/ToastContext';
import { SoundManager } from '../../utils/frameFocusUtils';
import { ROULETTE_GENRE_STYLES } from '../../constants/gameData';

interface CineRouletteViewProps {
  genres: Genre[];
  onExit: () => void;
  onGoToDetail: (movie: Movie) => void;
}

// --- TİP TANIMLAMALARI ---
interface WeightedMovie extends Movie {
    weightedRating: number;
    tempId?: string;
}

// --- KONFİGÜRASYON ---
const CARD_WIDTH = 220; 
const GAP = 20; 
const TOTAL_ITEM_WIDTH = CARD_WIDTH + GAP; 
const TOTAL_STRIP_ITEMS = 50; 
const WINNER_INDEX = 38; 

// --- GENRE STYLES ---
const getGenreStyle = (name: string) => {
    return ROULETTE_GENRE_STYLES[name] || { bg: 'bg-neutral-700/40', text: 'text-neutral-300', border: 'border-neutral-600/30' };
};

// --- YARDIMCI MESAJLAR ---
const LOADING_MESSAGES = [
    "Kasa Şifresi Çözülüyor...",
    "Güvenlik Duvarı Aşılıyor...",
    "Veritabanı Taranıyor...",
    "Rastgelelik Algoritması Çalışıyor...",
    "Kaderin Seçiliyor..."
];

// --- BAYESIAN AVERAGE ALGORİTMASI ---
const calculateWeightedRating = (R: number, v: number): number => {
    const m = 500; 
    const C = 6.0; 
    const weighted = ((v / (v + m)) * R) + ((m / (v + m)) * C);
    return parseFloat(weighted.toFixed(2));
};

// --- NADİRLİK SİSTEMİ ---
const RARITY_TIERS = [
    { min: 8.5, label: 'EFSANEVİ', chance: '%1', color: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-400', shadow: 'shadow-yellow-500/50', glow: 'drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' },
    { min: 7.8, label: 'ÖLÜMSÜZ', chance: '%4', color: 'text-red-500', bg: 'bg-red-600', border: 'border-red-600', shadow: 'shadow-red-600/50', glow: 'drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]' },
    { min: 7.2, label: 'MİSTİK', chance: '%12', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500', border: 'border-fuchsia-500', shadow: 'shadow-fuchsia-500/50', glow: '' },
    { min: 6.8, label: 'EPİK', chance: '%20', color: 'text-purple-500', bg: 'bg-purple-600', border: 'border-purple-600', shadow: 'shadow-purple-600/50', glow: '' },
    { min: 6.0, label: 'SIRADAN', chance: '%35', color: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500', shadow: 'shadow-cyan-500/50', glow: '' },
    { min: 5.0, label: 'EHH İŞTE', chance: '%20', color: 'text-emerald-400', bg: 'bg-emerald-600', border: 'border-emerald-600', shadow: 'shadow-emerald-600/30', glow: '' },
    { min: 0.0, label: 'ÇÖP', chance: '%8', color: 'text-slate-400', bg: 'bg-slate-500', border: 'border-slate-500', shadow: 'shadow-slate-500/20', glow: '' },
];

const getRarityColor = (rating: number) => {
    return RARITY_TIERS.find(tier => rating >= tier.min) || RARITY_TIERS[RARITY_TIERS.length - 1];
};

// --- ROULETTE GUIDE MODAL ---
const RouletteGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in font-sans">
        <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-lg rounded-[2rem] shadow-2xl p-8 relative animate-slide-in-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Cine<span className="text-indigo-500">Vault</span></h2>
                <p className="text-neutral-400 text-sm mt-2">Adil Rastgelelik ve Güven Sistemi</p>
            </div>
            
            <div className="space-y-8">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Bayesian Algoritması Nedir?</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                        Sadece puan ortalamasına bakmak yanıltıcı olabilir. 5 oyla 10.0 alan bir film ile 500.000 oyla 8.5 alan film aynı değildir. 
                        CineVault, oy sayısını ve ortalamayı ağırlıklandırarak "Güven Skoru" oluşturur. Böylece gerçek başyapıtları buluruz.
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Nadirlik & Olasılıklar</h3>
                    <div className="space-y-2">
                        {RARITY_TIERS.map((tier) => (
                            <div key={tier.label} className="flex items-center justify-between bg-neutral-900 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${tier.bg} shadow-[0_0_8px_currentColor]`}></div>
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-black ${tier.color} uppercase tracking-wider`}>{tier.label}</span>
                                        <span className="text-[9px] text-neutral-500 font-medium font-mono">{tier.min}+ Puan</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-bold text-white">{tier.chance}</span>
                                    <span className="text-[9px] text-neutral-600 uppercase tracking-wide">Şans</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <button onClick={onClose} className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">Anlaşıldı, Kasa Açılsın</button>
        </div>
    </div>
);

const CineRouletteView: React.FC<CineRouletteViewProps> = ({ genres, onExit, onGoToDetail }) => {
  const { toggleMovieInCollection, checkIsSelected } = useCollectionContext();
  const { showToast } = useToast();

  // --- STATE ---
  const [selectedType, setSelectedType] = useState<MediaType>('movie');

  // Status: IDLE -> FETCHING -> PRELOADING -> SPINNING -> RESULT
  const [status, setStatus] = useState<'IDLE' | 'FETCHING' | 'PRELOADING' | 'SPINNING' | 'RESULT' | 'EMPTY'>('IDLE');
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [progress, setProgress] = useState(0); 
  
  const [items, setItems] = useState<WeightedMovie[]>([]);
  const [winner, setWinner] = useState<WeightedMovie | null>(null);
  
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMotionBlur, setIsMotionBlur] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const labelItem = selectedType === 'movie' ? 'Film' : 'Dizi';

  useEffect(() => {
      SoundManager.preload();
  }, []);

  // Preloading Animasyonu
  useEffect(() => {
      let msgInterval: any;
      let progressInterval: any;

      if (status === 'FETCHING' || status === 'PRELOADING') {
          let i = 0;
          msgInterval = setInterval(() => {
              i = (i + 1) % LOADING_MESSAGES.length;
              setLoadingMsg(LOADING_MESSAGES[i]);
          }, 800);

          setProgress(0);
          progressInterval = setInterval(() => {
              setProgress(prev => {
                  const next = prev + (Math.random() * 5);
                  return next > 95 ? 95 : next;
              });
          }, 100);
      } else {
          setProgress(0);
      }

      return () => {
          clearInterval(msgInterval);
          clearInterval(progressInterval);
      };
  }, [status]);

  const handleSpin = async () => {
    if (status !== 'IDLE' && status !== 'RESULT') return; 

    setStatus('FETCHING');
    setWinner(null);
    setIsMotionBlur(false); 
    
    if (trackRef.current) {
        trackRef.current.style.transition = 'none';
        trackRef.current.style.transform = 'translateX(0px)';
    }

    try {
        const tmdb = new TmdbService();
        
        // 1. Veri Çekme: Tür ve Puan filtrelerini NULL gönderiyoruz (Tamamen rastgele)
        const fetchPromises = Array.from({ length: 5 }).map(() => 
            tmdb.getRouletteMovies(selectedType, null, null, 50)
        );
        const results = await Promise.all(fetchPromises);
        let pool = results.flat().filter(m => m.poster_path);

        const uniquePoolMap = new Map();
        pool.forEach(m => uniquePoolMap.set(m.id, m));
        let uniquePool = Array.from(uniquePoolMap.values()) as Movie[];

        if (uniquePool.length < 10) {
            setStatus('EMPTY');
            return;
        }

        // 3. Maksimum 50 Yapım Seç
        let finalSelection = uniquePool.sort(() => 0.5 - Math.random()).slice(0, TOTAL_STRIP_ITEMS);

        // 4. Bayesian Puanlama
        const weightedSelection: WeightedMovie[] = finalSelection.map((m, i) => ({
            ...m,
            weightedRating: calculateWeightedRating(m.vote_average, m.vote_count),
            tempId: `${m.id}-${i}`
        }));

        const winningMovie = weightedSelection[WINNER_INDEX];
        
        setItems(weightedSelection);
        setWinner(winningMovie);
        
        // 5. PRELOAD AŞAMASI
        setStatus('PRELOADING');

        const startPreload = Math.max(0, WINNER_INDEX - 5);
        const endPreload = Math.min(TOTAL_STRIP_ITEMS, WINNER_INDEX + 6);
        const criticalMovies = weightedSelection.slice(startPreload, endPreload);

        const preloadPromises = criticalMovies.map(m => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = `${CARD_IMAGE_BASE_URL}${m.poster_path}`;
                img.onload = resolve;
                img.onerror = resolve;
            });
        });

        await Promise.all([
            Promise.all(preloadPromises),
            new Promise(r => setTimeout(r, 1500)) 
        ]);

        setProgress(100); 

        // 6. SPIN BAŞLAT
        setStatus('SPINNING');
        
        setTimeout(() => {
            if (!trackRef.current || !trackRef.current.parentElement) return;

            SoundManager.play('TICK', 0.2);

            const containerWidth = trackRef.current.parentElement.offsetWidth;
            const distanceToWinnerLeft = WINNER_INDEX * TOTAL_ITEM_WIDTH;
            const distanceToWinnerCenter = distanceToWinnerLeft + (CARD_WIDTH / 2);
            const exactCenterOffset = (containerWidth / 2) - distanceToWinnerCenter;

            const randomOffset = (Math.random() * 40) - 20;
            const targetX = exactCenterOffset + randomOffset;

            setIsMotionBlur(true);
            trackRef.current.style.transition = 'transform 6.5s cubic-bezier(0.1, 0, 0.1, 1)'; 
            trackRef.current.style.transform = `translateX(${targetX}px)`;

            setTimeout(() => setIsMotionBlur(false), 4500);

            setTimeout(() => {
                setStatus('RESULT');
                SoundManager.play('WIN');
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            }, 6500); 

        }, 100);

    } catch (e) {
        console.error(e);
        showToast('Bağlantı hatası.', 'error');
        setStatus('IDLE');
    }
  };

  const handleAddAndClose = async () => {
      if (winner) {
          if (!checkIsSelected(winner.id)) {
             await toggleMovieInCollection(winner);
          }
          onExit();
          onGoToDetail(winner);
      }
  };

  return (
    <>
      <div className="fixed inset-0 z-[200] bg-[#1a1a1a] text-white font-sans overflow-hidden">
          {showGuide && <RouletteGuide onClose={() => setShowGuide(false)} />}
          
          {/* ARKA PLAN */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/50 to-[#1a1a1a] z-0 pointer-events-none"></div>

          {/* --- ÜST BAR (Yüzen Header & Legend) --- */}
          <div className="absolute top-0 left-0 right-0 z-40 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 pointer-events-none">
                
                {/* SOL: LOGO */}
                <div className="pointer-events-auto flex-shrink-0">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic transform -skew-x-6 drop-shadow-lg leading-none">
                        Cine<span className="text-indigo-500">Vault</span>
                    </h1>
                    <p className="text-[9px] text-neutral-500 font-bold tracking-[0.3em] uppercase mt-1">Adil Şans</p>
                </div>
                
                {/* ORTA: GÜVEN SKORU BAR (HUD) - GENİŞLİK AYARLANDI */}
                <div className="pointer-events-auto flex items-center gap-3 overflow-x-auto max-w-full md:max-w-fit lg:max-w-5xl no-scrollbar bg-neutral-900/80 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-full shadow-2xl mx-auto cursor-pointer hover:border-indigo-500/30 transition-colors" onClick={() => setShowGuide(true)}>
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mr-2 whitespace-nowrap hidden xl:inline-block">
                        Güven Skoru:
                    </span>
                    <div className="flex items-center gap-4 whitespace-nowrap">
                        {RARITY_TIERS.map((tier) => (
                            <div key={tier.label} className="flex items-center gap-1.5 flex-shrink-0">
                                <div className={`w-2 h-2 rounded-full ${tier.bg} shadow-[0_0_6px_currentColor]`}></div>
                                <span className={`text-[9px] font-bold ${tier.color} uppercase tracking-wide`}>{tier.label}</span>
                                <span className="text-[9px] text-neutral-600 font-mono border-r border-white/10 pr-3 md:pr-4 last:border-0 last:pr-0">{tier.min}+</span>
                            </div>
                        ))}
                    </div>
                    <div className="text-neutral-500 pl-2 border-l border-white/10">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>

                {/* SAĞ: ÇIKIŞ */}
                <button 
                    onClick={onExit} 
                    className="pointer-events-auto p-3 bg-white/5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors backdrop-blur-sm border border-white/5 flex-shrink-0"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
          </div>

          {/* --- ANA OYUN ALANI (ORTA) --- */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
                {/* İBRE (Tam Ortada) */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-yellow-400 z-30 neon-line opacity-80 h-[60vh] top-[20vh]"></div>
                <div className="absolute top-[20vh] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-yellow-400 z-30 drop-shadow-xl"></div>
                <div className="absolute bottom-[20vh] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-yellow-400 z-30 drop-shadow-xl"></div>

                {/* ŞERİT */}
                <div className="w-full relative h-[50vh] flex items-center overflow-hidden">
                    <div 
                        ref={trackRef}
                        className={`roulette-track flex items-center h-[350px] absolute left-0 ${isMotionBlur ? 'blur-motion' : 'no-blur'}`}
                        style={{ width: 'max-content' }}
                    >
                        {items.length > 0 ? items.map((movie, idx) => {
                            const rarity = getRarityColor(movie.weightedRating);
                            const isWinner = winner?.id === movie.id && idx === WINNER_INDEX;

                            return (
                                <div 
                                    key={movie.tempId || idx}
                                    className="relative flex-shrink-0 flex flex-col items-center justify-center"
                                    style={{ width: `${CARD_WIDTH}px`, marginRight: `${GAP}px` }}
                                >
                                    {/* Card */}
                                    <div className={`
                                        relative w-full aspect-[2/3] bg-[#202020] rounded-xl overflow-hidden border-b-4 ${rarity.border}
                                        ${isWinner && status === 'RESULT' ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-black z-10 scale-105 transition-transform shadow-[0_0_50px_rgba(250,204,21,0.5)]' : 'opacity-80'}
                                    `}>
                                        <img 
                                            src={`${CARD_IMAGE_BASE_URL}${movie.poster_path}`} 
                                            alt="" 
                                            className="w-full h-full object-cover"
                                            loading="eager"
                                            draggable={false}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                                        
                                        <div className="absolute bottom-3 left-3 right-3">
                                            {/* GÜVEN SKORU BADGE (ŞERİT ÜZERİNDE) */}
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <div className={`text-[9px] font-bold ${rarity.bg} text-black inline-block px-1.5 py-0.5 rounded shadow-lg`}>
                                                    {rarity.label}
                                                </div>
                                                <div className="text-[9px] font-mono font-bold text-white bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
                                                    {movie.weightedRating}
                                                </div>
                                            </div>
                                            
                                            <div className="text-white text-sm font-bold truncate leading-tight drop-shadow-md">
                                                {movie.title || movie.name}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="flex gap-4 opacity-10 px-[50vw]"> 
                                {Array.from({length: 10}).map((_, i) => (
                                    <div key={i} className="w-[220px] aspect-[2/3] bg-neutral-800 rounded-xl border border-neutral-700 flex items-center justify-center">
                                        <span className="text-6xl font-black text-neutral-700">?</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
          </div>

          {/* --- ALT KONTROL MERKEZİ (Yüzen) --- */}
          <div className="absolute bottom-8 left-0 right-0 z-40 flex flex-col items-center justify-end pointer-events-none">
                <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] shadow-2xl pointer-events-auto flex flex-col items-center gap-4 min-w-[320px] animate-slide-in-up">
                    
                    {/* Switcher */}
                    <div className="bg-black/40 p-1 rounded-xl flex w-full">
                        <button 
                            onClick={() => setSelectedType('movie')}
                            disabled={status !== 'IDLE' && status !== 'RESULT'}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${selectedType === 'movie' ? 'bg-indigo-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
                        >
                            FİLMLER
                        </button>
                        <button 
                            onClick={() => setSelectedType('tv')}
                            disabled={status !== 'IDLE' && status !== 'RESULT'}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${selectedType === 'tv' ? 'bg-indigo-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
                        >
                            DİZİLER
                        </button>
                    </div>

                    {/* SPIN BUTTON */}
                    <button
                        onClick={handleSpin}
                        disabled={status === 'SPINNING' || status === 'FETCHING' || status === 'PRELOADING'}
                        className={`
                            w-full py-5 rounded-xl font-black text-xl uppercase tracking-[0.2em] transition-all transform overflow-hidden relative group
                            ${status !== 'IDLE' && status !== 'RESULT'
                                ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-700' 
                                : 'bg-white text-black hover:bg-neutral-200 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                            }
                        `}
                    >
                        {status === 'FETCHING' ? 'Veri Çekiliyor...' : 
                         status === 'PRELOADING' ? 'Hazırlanıyor...' : 
                         status === 'SPINNING' ? 'Açılıyor...' : 'KUTUYU AÇ'}
                    </button>
                </div>

                {/* IDLE MESAJI */}
                {status === 'IDLE' && (
                    <div className="mt-4 text-neutral-500 text-xs font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
                        Rastgele Bir {labelItem} Seçmek İçin Bas
                    </div>
                )}
          </div>

          {/* LOADER OVERLAY */}
          {(status === 'FETCHING' || status === 'PRELOADING') && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in font-mono pointer-events-none">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,3px_100%] opacity-20"></div>
                  <div className="absolute top-0 w-full h-1 bg-indigo-500/50 blur-sm animate-scanline z-10"></div>

                  <div className="relative z-20 w-64 text-center">
                      <div className="text-5xl font-black text-indigo-500 mb-6 tracking-tighter animate-pulse">
                          {Math.floor(progress)}%
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-4 border border-neutral-700">
                          <div className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-200 ease-out" style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] animate-slide-in-up key={loadingMsg}">
                          {loadingMsg}
                      </p>
                  </div>
              </div>
          )}

          {/* RESULT MODAL */}
          {status === 'RESULT' && winner && (
              <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-lg flex items-center justify-center animate-fade-in p-6">
                  <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row transform scale-100 transition-transform animate-slide-in-up">
                      
                      {/* Sol Taraf: Görsel */}
                      <div className="w-full md:w-80 h-64 md:h-auto relative flex-shrink-0">
                          <img src={`${IMAGE_BASE_URL}${winner.poster_path}`} className="w-full h-full object-cover opacity-80" alt="" />
                          <div className={`absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent md:bg-gradient-to-r`}></div>
                      </div>

                      {/* Sağ Taraf: Bilgi */}
                      <div className="flex-1 p-8 flex flex-col justify-center text-left">
                          {/* FİLM BAŞLIĞI: Font küçültüldü ve yukarı taşındı (line-clamp eklendi) */}
                          <h2 className="text-2xl md:text-4xl font-black text-white mb-6 leading-tight drop-shadow-lg line-clamp-2" title={winner.title || winner.name}>
                              {winner.title || winner.name}
                          </h2>
                          
                          <div className="flex items-center gap-4 mb-4 text-neutral-400 text-sm font-medium flex-wrap">
                              <span>{winner.release_date?.substring(0,4)}</span>
                              
                              {/* GÜNCELLENMİŞ IMDB ROZETİ */}
                              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 shadow-sm">
                                  <span className="text-yellow-500 text-sm">★</span>
                                  <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-wide">IMDB:</span>
                                  <span className="text-white font-black text-sm">{winner.vote_average.toFixed(1)}</span>
                              </div>

                              {/* --- GÜVEN SKORU ALANI (1 BASAMAKLI VE YAN YANA) --- */}
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-opacity-10 backdrop-blur-md ${getRarityColor(winner.weightedRating).bg} ${getRarityColor(winner.weightedRating).border}`}>
                                    
                                    {/* İkon */}
                                    <svg className={`w-5 h-5 ${getRarityColor(winner.weightedRating).color}`} fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M11.354 1.452c.62-.337 1.415-.227 1.94.269 2.456 2.315 5.215 3.528 8.16 3.528.67 0 1.25.493 1.295 1.163.153 2.275-.027 4.566-.549 6.782-.993 4.226-4.062 7.728-8.136 9.278a.75.75 0 0 1-.528 0c-4.074-1.55-7.143-5.052-8.136-9.278-.522-2.216-.702-4.507-.549-6.782A1.25 1.25 0 0 1 6.046 5.25c2.946 0 5.704-1.213 8.16-3.528.16-.151.345-.262.548-.27ZM15.28 7.78a.75.75 0 0 0-1.06-1.06L10.5 10.44 8.78 8.72a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l4.25-4.25Z" clipRule="evenodd" />
                                    </svg>

                                    {/* Etiket */}
                                    <span className={`text-[10px] font-bold uppercase tracking-wide ${getRarityColor(winner.weightedRating).color}`}>
                                        {getRarityColor(winner.weightedRating).label}:
                                    </span>
                                    
                                    {/* Skor - toFixed(1) eklenerek 1 basamağa sabitlendi */}
                                    <span className={`font-black text-sm ${getRarityColor(winner.weightedRating).color}`}>
                                        {Number(winner.weightedRating).toFixed(1)}
                                    </span>
                                </div>
                          </div>

                          {/* --- TÜR LİSTESİ (HAP/PILL GÖRÜNÜMÜ) --- */}
                          <div className="w-full mb-6 flex flex-wrap gap-2 justify-start">
                                {winner.genre_ids?.map((id, idx) => {
                                    const genreName = genres.find(g => g.id === id)?.name;
                                    if (!genreName) return null;
                                    const style = getGenreStyle(genreName);
                                    return (
                                        <span 
                                            key={idx} 
                                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${style.bg} ${style.text} ${style.border} shadow-sm`}
                                        >
                                            {genreName}
                                        </span>
                                    )
                                })}
                          </div>

                          <p className="text-neutral-300 text-sm leading-relaxed mb-8 line-clamp-3 md:line-clamp-4">
                              {winner.overview || "Özet bilgisi bulunmuyor."}
                          </p>

                          <div className="flex gap-4">
                              <button onClick={handleAddAndClose} className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] text-sm uppercase tracking-wide flex-1 md:flex-none">
                                  İncele & Ekle
                              </button>
                              <button 
                                  onClick={() => { 
                                      setStatus('IDLE'); 
                                      setItems([]); 
                                      if (trackRef.current) {
                                          trackRef.current.style.transition = 'none';
                                          trackRef.current.style.transform = 'translateX(0px)';
                                      }
                                  }} 
                                  className="px-6 py-4 bg-transparent border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-sm uppercase tracking-wide"
                              >
                                  Kapat
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

      </div>
    </>
  );
};

export default CineRouletteView;
