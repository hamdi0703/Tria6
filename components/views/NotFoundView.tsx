
import React from 'react';

interface NotFoundViewProps {
  onGoHome: () => void;
}

const NotFoundView: React.FC<NotFoundViewProps> = ({ onGoHome }) => {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden bg-[#050505] text-white font-sans selection:bg-red-500/30 selection:text-red-200">
      
      {/* 1. ATMOSFERİK ARKA PLAN */}
      <div className="absolute inset-0 pointer-events-none">
          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }}></div>
          {/* Ambient Glow */}
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 animate-fade-in max-w-2xl mx-auto">
        
        {/* 2. GLITCHY 404 TITLE */}
        <div className="relative mb-6 select-none">
            <h1 className="text-[9rem] md:text-[13rem] font-black leading-none tracking-tighter text-neutral-800 dark:text-neutral-800 relative z-10">
                404
            </h1>
            {/* Glitch Layers */}
            <span className="absolute top-0 left-0 w-full h-full text-[9rem] md:text-[13rem] font-black leading-none tracking-tighter text-red-600/20 opacity-0 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] mix-blend-screen pointer-events-none">
                404
            </span>
            <span className="absolute top-0 left-0 w-full h-full text-[9rem] md:text-[13rem] font-black leading-none tracking-tighter text-cyan-600/20 blur-[2px] translate-x-1 animate-pulse mix-blend-screen pointer-events-none">
                404
            </span>
        </div>

        {/* 3. INFORMATIONAL CARD */}
        <div className="relative -mt-16 z-20 bg-neutral-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-slide-in-up">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-widest mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Kestik! Sahne Bulunamadı
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Bu sahne senaryodan çıkarılmış.
            </h2>
            
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto">
                Aradığın sayfa silinmiş, taşınmış veya hiç çekilmemiş olabilir. 
                Belki de kurgu masasında kaybolmuştur. Merak etme, seni sete geri götürebiliriz.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                    onClick={onGoHome}
                    className="w-full sm:w-auto px-8 py-3.5 bg-white text-black rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2 group"
                >
                    <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Ana Sayfaya Dön
                </button>

                <button 
                    onClick={() => window.history.back()}
                    className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-white/10 text-neutral-300 rounded-xl font-bold text-sm hover:bg-white/5 hover:text-white transition-colors"
                >
                    Geri Sar
                </button>
            </div>
        </div>

      </div>

      {/* 4. FOOTER DECORATION (Film Strip) */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 pointer-events-none flex justify-center overflow-hidden">
          <div className="w-[120%] h-full border-t-4 border-b-4 border-dashed border-white/30 flex items-center justify-between px-4">
             {/* Simple decorative lines simulating sprocket holes */}
             {Array.from({length: 20}).map((_, i) => (
                 <div key={i} className="w-1 h-full bg-white/20"></div>
             ))}
          </div>
      </div>

    </div>
  );
};

export default NotFoundView;
