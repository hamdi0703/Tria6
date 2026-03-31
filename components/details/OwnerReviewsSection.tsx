import React, { useMemo } from 'react';
import { Movie } from '../../types';
import HorizontalReviewCard from '../ui/HorizontalReviewCard';
import { useOwnerReviewsBatch } from '../../hooks/useReviewQueries';

interface OwnerReviewsSectionProps {
    ownerId: string;
    ownerName: string;
    movies: Movie[];
}

const OwnerReviewsSection: React.FC<OwnerReviewsSectionProps> = ({ ownerId, ownerName, movies }) => {
    // Sadece bu listede bulunan filmlerin ID'lerini al
    const movieIds = useMemo(() => movies.map(m => m.id), [movies]);

    // React Query ile verileri çek (Zaten SharedListView'da prefetch edildiği için anında gelir)
    const { data: reviews = [], isLoading } = useOwnerReviewsBatch(ownerId, movieIds);

    // Yükleniyor durumunu sadece izlenecek film varsa ve henüz data yoksa göster.
    // Eger movies bosses, isLoading true bile olsa beklemeye gerek yok cunku query disabled
    if (isLoading && movies.length > 0) {
        return (
            <div className="mt-20 flex flex-col items-center">
                 <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (movies.length === 0 || reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border border-neutral-200 dark:border-neutral-800 animate-fade-in mx-4 shadow-inner">
                <svg className="w-16 h-16 opacity-40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="font-medium text-lg">{ownerName} bu kategorideki yapımlar için henüz bir inceleme yazmamış.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in px-4 md:px-0 py-8 relative">

            {/* ZAMAN ÇİZELGESİ (TIMELINE) ÇİZGİSİ */}
            <div className="absolute left-[38px] md:left-[45px] top-16 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-indigo-200 dark:via-indigo-900/30 to-transparent z-0 hidden md:block rounded-full opacity-60"></div>

            {/* KARTLAR (TEK SÜTUN, YUKARIDAN AŞAĞIYA TIMELINE) */}
            <div className="flex flex-col gap-12 lg:gap-16 relative z-10">
                {reviews.map((review, index) => {
                    const movie = movies.find(m => m.id === review.movieId);
                    if (!movie) return null;

                    return (
                        <div
                            key={review.id}
                            className="relative flex items-center md:items-stretch group"
                            style={{
                                animation: `fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                animationDelay: `${index * 120}ms`,
                                opacity: 0 // Başlangıçta görünmez, animasyonla gelir
                            }}
                        >

                            {/* TIMELINE NOKTASI VE PULSE EFEKTİ (Sadece Desktop) */}
                            <div className="hidden md:flex flex-col items-center justify-start mr-8 mt-8 relative z-10 shrink-0">
                                {/* Dış Pulse Halkası */}
                                <div className="absolute w-8 h-8 rounded-full bg-indigo-400/20 animate-pulse-slow"></div>
                                {/* İç Nokta */}
                                <div className="w-4 h-4 rounded-full bg-indigo-500 border-2 border-white dark:border-neutral-900 shadow-[0_0_15px_rgba(99,102,241,0.6)] group-hover:scale-150 group-hover:bg-indigo-400 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.8)] transition-all duration-300 relative z-10"></div>
                            </div>

                            {/* KART (Tek sütunda tam genişlik yayılır) */}
                            <div className="w-full transition-transform duration-500 md:group-hover:-translate-y-1 md:group-hover:translate-x-1">
                                <HorizontalReviewCard
                                    movie={movie}
                                    review={review}
                                    ownerName={ownerName}
                                />
                            </div>

                        </div>
                    );
                })}
            </div>

            {/* ANIMATION KEYFRAMES (Eğer global.css'de yoksa diye inline eklendi) */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(40px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.5); opacity: 0.1; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}} />
        </div>
    );
};

export default OwnerReviewsSection;