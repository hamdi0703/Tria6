
import React from 'react';
import { getAvatarUrl } from '../../utils/avatarUtils';

const MOCK_REVIEWS = [
    { user: 'Ece K.', avatar: '2', movie: 'Interstellar', rating: 10, comment: "Başyapıt. Müzikleri hala kulaklarımda." },
    { user: 'Can B.', avatar: '3', movie: 'The Bear', rating: 9, comment: "Stres seviyem tavan yaptı ama harika." },
    { user: 'Selin Y.', avatar: '4', movie: 'Barbie', rating: 8, comment: "Beklediğimden çok daha iyiydi." },
    { user: 'Mert D.', avatar: '5', movie: 'Succession', rating: 10, comment: "Diyaloglar inanılmaz zekice yazılmış." },
    { user: 'Zeynep A.', avatar: '6', movie: 'Past Lives', rating: 9, comment: "Kalbim kırıldı..." },
    { user: 'Burak T.', avatar: '7', movie: 'Oppenheimer', rating: 9, comment: "Görsel bir şölen." },
    { user: 'Elif S.', avatar: '8', movie: 'Dune: Part Two', rating: 10, comment: "Sinema salonunda izlenmeli." },
    { user: 'Kaan M.', avatar: '9', movie: 'Severance', rating: 9, comment: "Kafam çok karışık ve bunu sevdim." },
    { user: 'Deniz O.', avatar: '10', movie: 'Spider-Verse', rating: 10, comment: "Animasyonun zirvesi." },
    { user: 'Ayşe V.', avatar: '1', movie: 'Poor Things', rating: 8, comment: "Emma Stone döktürmüş." },
];

const ReviewCard: React.FC<{ review: typeof MOCK_REVIEWS[0] }> = ({ review }) => (
    <div className="bg-neutral-900/60 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg w-full mb-4 transform hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center gap-3 mb-2">
            <img src={getAvatarUrl(review.avatar)} alt={review.user} className="w-8 h-8 rounded-full bg-neutral-800" />
            <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{review.user}</div>
                <div className="text-[10px] text-neutral-400 truncate">izledi: {review.movie}</div>
            </div>
            <div className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-xs font-black">
                {review.rating}
            </div>
        </div>
        <p className="text-xs text-neutral-300 line-clamp-2 italic">
            "{review.comment}"
        </p>
    </div>
);

const LiveTicker = () => {
    // Split data to create variety in columns
    const col1 = [...MOCK_REVIEWS, ...MOCK_REVIEWS];
    const col2 = [...MOCK_REVIEWS.reverse(), ...MOCK_REVIEWS]; // Reverse for variety
    const col3 = [...MOCK_REVIEWS.sort(() => 0.5 - Math.random()), ...MOCK_REVIEWS];

    return (
        <div className="relative w-full h-[600px] overflow-hidden bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505] border-y border-white/5">
            
            {/* Overlay Gradients to hide scroll edges */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#050505] to-transparent z-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent z-20 pointer-events-none"></div>

            {/* Header Content */}
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center max-w-2xl shadow-2xl">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Topluluğun <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Sesi</span>
                    </h2>
                    <p className="text-neutral-300 text-lg mb-6">
                        Tria sadece bir veritabanı değil, yaşayan bir organizma. 
                        Her gün binlerce inceleme, puan ve liste paylaşılıyor.
                    </p>
                    <div className="flex justify-center gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">200+</div>
                            <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Kullanıcı</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">1500+</div>
                            <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">İşlem</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrolling Columns */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto h-full px-4 relative z-10 opacity-40 hover:opacity-60 transition-opacity duration-700">
                
                {/* Column 1 (Up) */}
                <div className="flex flex-col animate-marquee-vertical">
                    {col1.map((item, i) => <ReviewCard key={`c1-${i}`} review={item} />)}
                </div>

                {/* Column 2 (Down - Reverse Animation need distinct keyframes or negative translation logic, 
                    for simplicity using same animation but different data/offset or CSS transform) */}
                <div className="flex flex-col animate-marquee-vertical-reverse hidden md:flex">
                    {col2.map((item, i) => <ReviewCard key={`c2-${i}`} review={item} />)}
                </div>

                {/* Column 3 (Up - Slower) */}
                <div className="flex flex-col animate-marquee-vertical" style={{ animationDuration: '80s' }}>
                    {col3.map((item, i) => <ReviewCard key={`c3-${i}`} review={item} />)}
                </div>

            </div>
        </div>
    );
};

export default LiveTicker;
