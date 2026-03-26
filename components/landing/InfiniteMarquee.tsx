
import React from 'react';

const InfiniteMarquee: React.FC<{ items: string[]; reverse?: boolean }> = ({ items, reverse = false }) => {
    return (
        <div className="relative flex overflow-hidden py-4 bg-neutral-950/50 border-y border-white/5 backdrop-blur-sm">
            <div className={`flex whitespace-nowrap gap-8 animate-marquee ${reverse ? 'animate-marquee-reverse' : ''}`}>
                {[...items, ...items, ...items, ...items].map((item, idx) => (
                    <span key={idx} className="text-sm md:text-lg font-bold text-neutral-500 uppercase tracking-[0.2em] px-4">
                        {item}
                    </span>
                ))}
            </div>
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>
            
            <style>{`
                @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
                @keyframes marquee-reverse { 0% { transform: translateX(-100%); } 100% { transform: translateX(0%); } }
                .animate-marquee { animation: marquee 40s linear infinite; }
                .animate-marquee-reverse { animation: marquee-reverse 40s linear infinite; }
            `}</style>
        </div>
    );
};

export default InfiniteMarquee;
