
import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: 'Keşfet',
      desc: 'Yapay zeka önerileri veya mini oyunlarla (CineRoulette, FrameFocus) zevkine uygun içerikleri bul.',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 2,
      title: 'Listele',
      desc: 'İzlediklerini puanla, favorilerini seç ve kişisel koleksiyonlarını oluştur. Her şey tek bir yerde.',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 3,
      title: 'Paylaş',
      desc: 'Profilini veya özel listelerini tek tıkla arkadaşlarına gönder. CineMatch ile ortak zevkleri yakala.',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      color: 'from-pink-500 to-rose-600'
    }
  ];

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
          Nasıl Çalışır?
        </h2>
        <p className="text-neutral-400 max-w-lg mx-auto text-sm md:text-base">
          Sinema deneyimini dijitalleştirmek hiç bu kadar kolay ve estetik olmamıştı.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Bağlantı Çizgisi (Sadece Masaüstü) */}
        <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>

        {steps.map((step) => (
          <div key={step.id} className="relative group">
            
            {/* Kart */}
            <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl relative z-10 hover:border-white/20 transition-colors h-full flex flex-col items-center text-center shadow-2xl">
              
              {/* İkon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {step.icon}
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>

            {/* Arka Plan Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-3xl -z-10`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
