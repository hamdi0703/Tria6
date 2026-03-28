
import React from 'react';

// --- VISUAL COMPONENTS ---

const ArchitectureVisual = () => (
    <div className="relative w-full h-full min-h-[200px] flex items-center justify-center p-4">
        {/* Abstract Network Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        <div className="relative z-10 flex gap-4">
            {/* Node 1 */}
            <div className="w-16 h-16 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center shadow-2xl relative group">
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <svg className="w-8 h-8 text-white/50 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
            </div>
            
            {/* Connection Line */}
            <div className="w-12 h-0.5 bg-gradient-to-r from-neutral-700 to-indigo-500 self-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/50 w-1/2 animate-[shimmer_1s_infinite] transform skew-x-12"></div>
            </div>

            {/* Node 2 */}
            <div className="w-16 h-16 rounded-xl bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.2)] relative">
                <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
        </div>
        
        {/* Status Badge */}
        <div className="absolute bottom-4 left-4 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[9px] font-bold text-green-400 uppercase tracking-widest">
            Bağlantı Stabil
        </div>
    </div>
);

const AnalyticsVisual = () => (
    <div className="relative w-full h-full min-h-[200px] flex items-end justify-center p-6 gap-2">
        <div className="w-8 bg-neutral-800 rounded-t-lg h-[40%] relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 right-0 bg-indigo-500/50 h-0 group-hover:h-full transition-all duration-700"></div>
        </div>
        <div className="w-8 bg-neutral-800 rounded-t-lg h-[70%] relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 right-0 bg-purple-500/50 h-0 group-hover:h-full transition-all duration-700 delay-100"></div>
        </div>
        <div className="w-8 bg-neutral-800 rounded-t-lg h-[50%] relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 right-0 bg-pink-500/50 h-0 group-hover:h-full transition-all duration-700 delay-200"></div>
        </div>
        <div className="w-8 bg-neutral-800 rounded-t-lg h-[90%] relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 right-0 bg-orange-500/50 h-0 group-hover:h-full transition-all duration-700 delay-300"></div>
        </div>
        
        {/* Floating Tooltip */}
        <div className="absolute top-6 right-6 bg-white text-black text-[10px] font-bold px-3 py-2 rounded-lg shadow-xl animate-bounce">
            %24 Artış
        </div>
    </div>
);

// YENİLENEN KOLEKSİYON GÖRSELİ (STACK EFEKTİ)
const CollectionStackVisual = () => (
    <div className="relative w-full h-full min-h-[200px] flex items-center justify-center p-6 perspective-1000">
        
        {/* Card 3 (Back) */}
        <div className="absolute w-32 h-44 bg-neutral-800 rounded-xl border border-white/5 shadow-xl transform rotate-6 translate-x-4 translate-y-2 opacity-60 group-hover:translate-x-8 group-hover:rotate-12 transition-all duration-500 ease-out"></div>
        
        {/* Card 2 (Middle) */}
        <div className="absolute w-32 h-44 bg-neutral-800 rounded-xl border border-white/10 shadow-xl transform -rotate-3 translate-x-0 translate-y-0 opacity-80 group-hover:-translate-x-4 group-hover:-rotate-6 transition-all duration-500 ease-out flex items-center justify-center">
             <div className="w-12 h-12 rounded-full bg-white/5"></div>
        </div>
        
        {/* Card 1 (Front) */}
        <div className="absolute w-32 h-44 bg-[#121212] rounded-xl border border-white/20 shadow-2xl transform rotate-0 z-10 group-hover:scale-105 transition-all duration-500 ease-out overflow-hidden">
            {/* Fake Poster Content */}
            <div className="h-28 bg-gradient-to-br from-emerald-900/50 to-neutral-900"></div>
            <div className="p-3">
                <div className="h-2 w-16 bg-white/20 rounded mb-2"></div>
                <div className="h-1.5 w-10 bg-emerald-500/50 rounded"></div>
            </div>
            
            {/* Share Badge */}
            <div className="absolute top-2 right-2 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform delay-100">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </div>
        </div>

        {/* UI Controls Mockup */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Herkese Açık</span>
        </div>
    </div>
);

// YENİLENEN YORUM/İNCELEME GÖRSELİ
const ReviewFeatureVisual = () => (
    <div className="relative w-full h-full min-h-[200px] flex items-center justify-center p-6">
        
        {/* Main Review Card */}
        <div className="w-full max-w-sm bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-white/10 p-5 shadow-2xl relative z-10 transform group-hover:-translate-y-2 transition-transform duration-500">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600"></div>
                    <div className="space-y-1">
                        <div className="h-2 w-20 bg-white/20 rounded"></div>
                        <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Lines */}
            <div className="space-y-2 mb-4">
                <div className="h-1.5 w-full bg-white/10 rounded"></div>
                <div className="h-1.5 w-5/6 bg-white/10 rounded"></div>
                <div className="h-1.5 w-4/6 bg-white/10 rounded"></div>
            </div>

            {/* Tags (New Feature Highlight) */}
            <div className="flex gap-2">
                <div className="px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30 text-[9px] text-purple-300 font-bold flex items-center gap-1">
                    <span>⚡</span> Teori
                </div>
                <div className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-[9px] text-blue-300 font-bold flex items-center gap-1">
                    <span>🔍</span> Detay
                </div>
            </div>
        </div>

        {/* Background Elements */}
        <div className="absolute right-8 top-8 w-12 h-12 bg-pink-500 rounded-full blur-2xl opacity-20 pointer-events-none"></div>
    </div>
);

// --- MAIN COMPONENT ---

const FeatureBoards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
      
      {/* CARD 1: AKILLI ALTYAPI (Large) */}
      <div className="lg:col-span-2 bg-[#09090b] rounded-[2rem] border border-white/10 relative overflow-hidden group hover:border-indigo-500/30 transition-colors duration-500">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent pointer-events-none"></div>
         
         <div className="flex flex-col md:flex-row h-full">
             <div className="p-8 md:p-10 flex flex-col justify-center flex-1">
                 <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                 </div>
                 <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Akıllı & Dayanıklı</h3>
                 <p className="text-neutral-400 leading-relaxed">
                     İzleme Listem v2.2, bağlantı sorunlarına karşı dirençli bir mimari sunar.
                     <span className="text-white font-medium"> Akıllı Yedekleme (Smart Fallback)</span> sistemi sayesinde API kesintilerinde bile gezintiye devam edersiniz.
                 </p>
             </div>
             <div className="flex-1 min-h-[250px] relative">
                 <ArchitectureVisual />
             </div>
         </div>
      </div>
      
      {/* CARD 2: ANALİTİK */}
      <div className="bg-[#09090b] rounded-[2rem] border border-white/10 relative overflow-hidden group hover:border-purple-500/30 transition-colors duration-500 flex flex-col">
         <div className="p-8 pb-0">
             <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 text-purple-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
             </div>
             <h3 className="text-2xl font-black text-white mb-2">Detaylı Analiz</h3>
             <p className="text-sm text-neutral-400">İzleme alışkanlıklarını grafiklerle keşfet.</p>
         </div>
         <div className="flex-1 relative mt-4">
             <AnalyticsVisual />
         </div>
      </div>

      {/* CARD 3: KOLEKSİYON (GÜNCELLENDİ) */}
      <div className="bg-[#09090b] rounded-[2rem] border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500 flex flex-col">
         <div className="p-8 pb-0">
             <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 text-emerald-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
             </div>
             <h3 className="text-2xl font-black text-white mb-2">Kişisel Arşiv</h3>
             <p className="text-sm text-neutral-400">Listelerini oluştur, düzenle ve tek tıkla paylaş.</p>
         </div>
         <div className="flex-1 relative mt-4">
             <CollectionStackVisual />
         </div>
      </div>

      {/* CARD 4: TOPLULUK & İNCELEME (GÜNCELLENDİ) */}
      <div className="lg:col-span-2 bg-[#09090b] rounded-[2rem] border border-white/10 relative overflow-hidden group flex flex-col md:flex-row hover:border-pink-500/30 transition-colors duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-900/10 to-transparent pointer-events-none"></div>
          
          <div className="p-8 md:p-10 flex flex-col justify-center flex-1 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">Yeni Özellik</span>
              </div>
              <h3 className="text-3xl font-black text-white mb-3">Sinema Gurusu Ol.</h3>
              <p className="text-neutral-400 mb-6">
                  Sadece puan verme, detaylı analiz yaz. Spoiler etiketi ekle, teorilerini paylaş veya sinematografiyi öv. İzleme Listem ile sesin daha gür çıksın.
              </p>
              <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-neutral-800 border border-white/10 text-[10px] font-bold text-neutral-300">#Teori</span>
                  <span className="px-3 py-1 rounded-full bg-neutral-800 border border-white/10 text-[10px] font-bold text-neutral-300">#Analiz</span>
                  <span className="px-3 py-1 rounded-full bg-neutral-800 border border-white/10 text-[10px] font-bold text-neutral-300">#Spoiler</span>
              </div>
          </div>
          
          {/* Review Feature Visual */}
          <div className="flex-1 min-h-[250px] relative border-t md:border-t-0 md:border-l border-white/5 bg-black/20">
              <ReviewFeatureVisual />
          </div>
      </div>

    </div>
  );
};

export default FeatureBoards;
