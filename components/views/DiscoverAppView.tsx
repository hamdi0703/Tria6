
import React from 'react';
import InfiniteMarquee from '../landing/InfiniteMarquee';
import ScrollReveal from '../landing/ScrollReveal';
import GameShowcase from '../landing/GameShowcase';
import MoodSelector from '../landing/MoodSelector';
import LiveTicker from '../landing/LiveTicker';
import FeatureBoards from '../landing/FeatureBoards';
import LandingHeader from '../landing/LandingHeader';
import HowItWorks from '../landing/HowItWorks';
import Footer from '../Footer'; // LandingFooter yerine ana Footer'ı kullanıyoruz
import { ViewMode } from '../../hooks/useAppNavigation';
import { useAuth } from '../../context/AuthContext';

interface DiscoverAppViewProps {
  onExit: () => void; // Unused but kept for interface compatibility if needed
  onNavigate: (mode: ViewMode) => void;
}

const DiscoverAppView: React.FC<DiscoverAppViewProps> = ({ onNavigate }) => {
  const { openAuthModal } = useAuth();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* --- STICKY HEADER --- */}
      <LandingHeader 
        onLogin={openAuthModal} 
        onNavigateApp={() => onNavigate('explore')} 
      />

      {/* --- BACKGROUND FX (AURORA) - Mobile Optimized --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Opacity reduced on mobile to improve performance and readability */}
          <div className="opacity-40 md:opacity-100">
            <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-900/20 rounded-full blur-[80px] md:blur-[120px] animate-pulse will-change-transform"></div>
            <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse will-change-transform" style={{animationDelay: '2s'}}></div>
            <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[80px] md:blur-[100px] animate-pulse will-change-transform" style={{animationDelay: '4s'}}></div>
          </div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]"></div>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 md:pb-32">
          <div className="animate-slide-in-up mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-emerald-300 text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  v2.2: Kararlı Sürüm Yayında
              </div>
          </div>
          
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.95] mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-neutral-600 animate-slide-in-up" style={{animationDelay: '100ms'}}>
              Sinemayı <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Yeniden</span> Keşfet.
          </h1>
          
          <p className="max-w-2xl text-base md:text-xl text-neutral-400 font-medium leading-relaxed mb-10 animate-slide-in-up px-4" style={{animationDelay: '200ms'}}>
              Sıradan listelerden fazlası. Kesintisiz performans, yapay zeka destekli öneriler ve sinematik oyunlarla dolu kişisel evrenin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-slide-in-up px-4" style={{animationDelay: '300ms'}}>
              {/* Main Call to Action: Updates URL to /app */}
              <button 
                onClick={() => onNavigate('explore')} 
                className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-black text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                  Keşfetmeye Başla
              </button>
              <button 
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} 
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors backdrop-blur-md"
              >
                  Teknolojiyi Tanı
              </button>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
      </section>

      {/* --- HOW IT WORKS (NEW) --- */}
      <section className="relative z-10 bg-neutral-900/30 border-y border-white/5">
          <HowItWorks />
      </section>

      {/* --- MARQUEE SECTION --- */}
      <section className="relative z-20 py-8 md:py-12 bg-black border-b border-neutral-900">
          <InfiniteMarquee items={[
              'Yapay Zeka', 
              'Kesintisiz Akış', 
              'Akıllı Önbellek', 
              'Detaylı Analiz', 
              'Güvenli Mimari', 
              'TMDB Entegrasyon', 
              'Sinematik Oyunlar'
          ]} />
      </section>

      {/* --- FEATURE 1: MOOD SELECTOR --- */}
      <section className="relative z-10 py-20 md:py-32 px-4 md:px-6 max-w-5xl mx-auto">
          <ScrollReveal>
              <MoodSelector />
          </ScrollReveal>
      </section>

      {/* --- GAMIFICATION SECTION --- */}
      <section className="relative z-10 py-20 md:py-32 bg-neutral-900/30 border-y border-white/5 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-6">
              <ScrollReveal>
                  <div className="mb-12">
                    <h2 className="text-3xl md:text-6xl font-black mb-4 leading-tight">
                        Kararsızlık <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Sona Erdi.</span>
                    </h2>
                    <p className="text-base md:text-lg text-neutral-400 leading-relaxed max-w-2xl">
                        Ne izleyeceğine karar veremiyor musun? İzleme Listem'in entegre mini oyunları ile şansını dene. Her biri farklı bir deneyim sunar.
                    </p>
                  </div>
                  
                  {/* GAME SHOWCASE - Passing Navigation Prop */}
                  <GameShowcase onNavigate={onNavigate} />

              </ScrollReveal>
          </div>
      </section>

      {/* --- MAIN FEATURES (HER ŞEY TEK YERDE) --- */}
      <section className="relative z-10 py-16 md:py-20 px-4 md:px-6 max-w-7xl mx-auto">
          <ScrollReveal>
              <FeatureBoards />
          </ScrollReveal>
      </section>

      {/* --- FEATURE 2: LIVE TICKER --- */}
      <section className="relative z-10">
          <LiveTicker />
      </section>

      {/* --- FINAL CTA --- */}
      <section className="relative py-24 md:py-32 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 to-transparent pointer-events-none"></div>
          <ScrollReveal>
            <h2 className="text-4xl md:text-8xl font-black tracking-tighter text-white mb-8">
                Hazır mısın?
            </h2>
            <button 
                onClick={() => onNavigate('explore')}
                className="group relative px-8 py-4 md:px-12 md:py-6 bg-white text-black rounded-full font-black text-lg md:text-xl hover:scale-105 transition-all shadow-[0_0_60px_rgba(255,255,255,0.4)] overflow-hidden w-full sm:w-auto"
            >
                <span className="relative z-10">UYGULAMAYA GİT</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
            <p className="mt-8 text-neutral-500 text-xs md:text-sm font-mono tracking-widest">İZLEME LİSTEM 2.0 • GÜVENLİ VE HIZLI</p>
          </ScrollReveal>
      </section>

      {/* --- FOOTER (ONLY HERE) --- */}
      <Footer onNavigate={onNavigate} />

    </div>
  );
};

export default DiscoverAppView;
