
import React, { useState, useEffect } from 'react';
import { TmdbService, IMAGE_BASE_URL } from '../../services/tmdbService';
import { Movie } from '../../types';

// Özel Küratörlü Film Listesi
const CURATED_PICKS: Record<string, string[]> = {
    "Bilim Kurgu & Epik": ["Star Wars: A New Hope", "Inception", "Interstellar"],
    "Aksiyon & Suç": ["The Dark Knight", "Gladiator", "The Terminator"],
    "Dram & Biyografi": ["Forrest Gump", "Titanic", "The Green Mile"],
    "Animasyon & Renkli": ["Finding Nemo", "Shrek", "Ice Age"],
    "Komedi & Eğlence": ["Modern Times", "Home Alone", "The Mask"]
};

// Kategori Yapılandırması (Başlıklar CURATED_PICKS ile eşleşmeli)
const CATEGORIES = [
    { label: "Bilim Kurgu & Epik", color: "from-indigo-900 to-purple-900", accent: "text-indigo-400" },
    { label: "Aksiyon & Suç",      color: "from-red-900 to-slate-900",      accent: "text-red-500" },
    { label: "Dram & Biyografi",   color: "from-blue-900 to-cyan-900",      accent: "text-blue-400" },
    { label: "Animasyon & Renkli", color: "from-fuchsia-900 to-pink-900",   accent: "text-pink-400" },
    { label: "Komedi & Eğlence",   color: "from-yellow-600/40 to-orange-900", accent: "text-yellow-400" }
];

const MoodSelector: React.FC = () => {
    const [value, setValue] = useState(50);
    const [moviesMap, setMoviesMap] = useState<Record<string, Movie[]>>({});
    const [loading, setLoading] = useState(true);

    // Slider değerini (0-99) 5 kategoriye böl (0, 1, 2, 3, 4)
    const activeIndex = Math.min(Math.floor(value / 20), 4);
    const activeCategory = CATEGORIES[activeIndex];
    const activeMovies = moviesMap[activeCategory.label] || [];

    useEffect(() => {
        const fetchCuratedMovies = async () => {
            const tmdb = new TmdbService();
            const results: Record<string, Movie[]> = {};

            try {
                const categoryPromises = Object.entries(CURATED_PICKS).map(async ([category, titles]) => {
                    const moviePromises = titles.map(async (title) => {
                        try {
                            const res = await tmdb.searchMovies(title);
                            // En iyi eşleşmeyi bul (Poster'i olan ilk sonuç)
                            return res.results.find(m => m.poster_path) || null;
                        } catch (e) {
                            return null;
                        }
                    });

                    const movies = (await Promise.all(moviePromises)).filter(m => m !== null) as Movie[];
                    results[category] = movies;
                });

                await Promise.all(categoryPromises);
                setMoviesMap(results);
            } catch (error) {
                console.error("MoodSelector veri çekme hatası:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCuratedMovies();
    }, []);

    // Yükleme Animasyonu (Skeleton)
    const renderSkeleton = () => (
        <div className="grid grid-cols-3 gap-4 md:gap-8 w-full max-w-3xl animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[2/3] bg-white/10 rounded-xl border border-white/5"></div>
            ))}
        </div>
    );

    return (
        <div className={`relative w-full rounded-[2rem] overflow-hidden transition-all duration-700 bg-gradient-to-br ${activeCategory.color} border border-white/10 shadow-2xl`}>
            {/* Arka Plan Dokusu */}
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
            
            <div className="relative z-10 p-8 md:p-12 flex flex-col items-center">
                
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2 text-center drop-shadow-lg tracking-tight">
                    Hangi Türü Seversin?
                </h2>
                <p className="text-white/70 mb-10 text-center max-w-md font-medium text-sm md:text-base">
                    Kaydırıcıyı kullanarak favori atmosferini seç, o dünyanın en kült yapımlarını keşfet.
                </p>

                {/* --- SLIDER KONTROL ALANI --- */}
                <div className="w-full max-w-xl mb-12 relative group">
                    {/* Etiketler */}
                    <div className="flex justify-between text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/40 mb-3 px-1 select-none">
                        <span>Bilim Kurgu</span>
                        <span>Aksiyon</span>
                        <span>Dram</span>
                        <span>Animasyon</span>
                        <span>Komedi</span>
                    </div>
                    
                    {/* Özel Range Input */}
                    <div className="relative h-4 w-full flex items-center">
                        {/* Track Arka Planı */}
                        <div className="absolute w-full h-2 bg-black/40 rounded-full border border-white/10"></div>
                        
                        {/* Doluluk Çubuğu (Progresif) */}
                        <div 
                            className="absolute h-2 bg-white/80 rounded-full transition-all duration-100 ease-out pointer-events-none" 
                            style={{ width: `${value}%` }}
                        ></div>

                        <input 
                            type="range" 
                            min="0" 
                            max="99" 
                            value={value} 
                            onChange={(e) => setValue(Number(e.target.value))}
                            className="relative w-full h-4 opacity-0 cursor-pointer z-20"
                            aria-label="Tür Seçici"
                        />
                        
                        {/* Özel Thumb (Görsel Top) */}
                        <div 
                            className="absolute h-6 w-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] border-2 border-indigo-50 pointer-events-none transition-all duration-100 ease-out z-10 transform -translate-x-1/2"
                            style={{ left: `${value}%` }}
                        ></div>
                    </div>
                    
                    {/* Aktif Kategori Göstergesi */}
                    <div className="mt-6 text-center h-8">
                        <span className={`text-xl font-black ${activeCategory.accent} transition-all duration-300 drop-shadow-md uppercase tracking-wide`}>
                            {activeCategory.label.split(' & ')[0]} {/* Sadece ilk kelimeyi göster (Daha temiz) */}
                        </span>
                    </div>
                </div>

                {/* --- FİLM KARTLARI (GRID) --- */}
                {loading ? (
                    renderSkeleton()
                ) : (
                    <div className="grid grid-cols-3 gap-4 md:gap-8 w-full max-w-3xl min-h-[200px]">
                        {activeMovies.map((movie, idx) => (
                            <div 
                                key={movie.id} 
                                className="group relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-neutral-900 transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fade-in ring-1 ring-white/10 hover:ring-white/30"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <img 
                                    src={`${IMAGE_BASE_URL}${movie.poster_path}`} 
                                    alt={movie.title}
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                                    loading="lazy"
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <span className="text-white font-bold text-xs md:text-sm leading-tight drop-shadow-md line-clamp-2">
                                        {movie.title || movie.name}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Alt Bilgi */}
                <div className="mt-12 bg-black/20 backdrop-blur-md px-5 py-2 rounded-full border border-white/5 flex items-center gap-3 shadow-lg">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">
                        TMDB Canlı Veri Akışı
                    </span>
                </div>

            </div>
        </div>
    );
};

export default MoodSelector;
