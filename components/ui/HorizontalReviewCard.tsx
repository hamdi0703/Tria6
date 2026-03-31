import React, { useState } from 'react';
import { Movie, UserReview } from '../../types';

const BASE_IMG_URL = 'https://image.tmdb.org/t/p/';

interface HorizontalReviewCardProps {
    movie: Movie;
    review: UserReview;
    ownerName: string;
}

const HorizontalReviewCard: React.FC<HorizontalReviewCardProps> = ({ movie, review, ownerName }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const title = movie.title || movie.name || 'Untitled';
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : (movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : '');
    const posterPath = movie.poster_path;
    const imageUrl = posterPath ? `${BASE_IMG_URL}w342${posterPath}` : null;
    const reviewDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    // Check if the comment is long enough to need expansion
    const MAX_LENGTH = 180;
    const isLongComment = review.comment && review.comment.length > MAX_LENGTH;
    const displayComment = isLongComment && !isExpanded
        ? review.comment?.substring(0, MAX_LENGTH) + '...'
        : review.comment;

    return (
        <div className="flex flex-col md:flex-row bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.4)] transition-all duration-500 border border-white/40 dark:border-white/5 hover:-translate-y-1 h-full items-stretch">

            {/* SOL KISIM: Afiş (Sabit Aspect Ratio ve Align Top) */}
            <div className="w-full md:w-[150px] lg:w-[180px] relative group cursor-pointer shrink-0 aspect-[2/3] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm font-medium">
                            Afiş Yok
                    </div>
                )}

                {/* Premium Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 md:opacity-0 md:group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />

                {/* Mobile Only: Title over image */}
                <div className="absolute bottom-4 left-4 right-4 md:hidden text-white z-10 pointer-events-none">
                    <h3 className="font-black text-xl leading-tight drop-shadow-lg line-clamp-2">{title}</h3>
                    {releaseYear && <span className="text-xs font-bold text-white/80 mt-1 block drop-shadow-md">{releaseYear}</span>}
                </div>
            </div>

            {/* SAĞ KISIM: İnceleme ve Detaylar */}
            <div className="w-full md:flex-1 p-6 md:p-8 flex flex-col justify-between relative bg-white/40 dark:bg-neutral-900/40 min-h-[250px] z-10">

                {/* Arka Plan Büyük Quote İkonu (Dekoratif) */}
                <svg className="absolute top-8 right-8 w-32 h-32 text-indigo-50 dark:text-indigo-900/10 opacity-60 pointer-events-none transform rotate-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                {/* Desktop Title & Date Header */}
                <div className="hidden md:flex justify-between items-start mb-6 pb-5 border-b border-neutral-200/50 dark:border-neutral-800/50 relative z-10">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white leading-tight tracking-tight">
                            {title}
                        </h3>
                        {releaseYear && (
                            <div className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mt-1.5 flex items-center gap-2">
                                <span>{releaseYear}</span>
                                {movie.vote_average ? (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-neutral-400 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                            {movie.vote_average.toFixed(1)}
                                        </span>
                                    </>
                                ) : null}
                            </div>
                        )}
                    </div>
                    {reviewDate && (
                         <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.2em] shrink-0 mt-2 py-1 px-3 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-full">
                             {reviewDate}
                         </div>
                    )}
                </div>

                {/* Mobile Date Header */}
                <div className="flex md:hidden justify-between items-center mb-5 pb-4 border-b border-neutral-200/50 dark:border-neutral-800/50 relative z-10">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{ownerName}</div>
                    {reviewDate && <div className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800/50 py-1 px-2 rounded-md">{reviewDate}</div>}
                </div>

                {/* Yorum İçeriği ve Puan */}
                <div className="flex-grow flex flex-col justify-center relative z-10">

                    {/* Puan Rozeti (Premium Glow Etkisi) */}
                    {review.rating && review.rating > 0 && (
                        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-[0_4px_15px_rgba(99,102,241,0.3)] self-start transform transition-transform hover:scale-105">
                             <svg className="w-5 h-5 text-yellow-300 fill-current drop-shadow-md" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                             <span className="text-xl font-black text-white leading-none tracking-tight">
                                {review.rating} <span className="text-sm font-semibold text-white/60">/ 10</span>
                             </span>
                        </div>
                    )}

                    {/* Yorum Metni */}
                    {review.comment ? (
                        <div className="relative">
                            <p className="text-base md:text-[17px] text-neutral-700 dark:text-neutral-300 leading-[1.8] font-medium z-10 relative">
                                "{displayComment}"
                            </p>

                            {isLongComment && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="mt-4 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors focus:outline-none flex items-center gap-1 group/btn"
                                >
                                    {isExpanded ? 'Daha Az Göster' : 'Devamını Oku'}
                                    <svg className={`w-4 h-4 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'group-hover/btn:translate-y-0.5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-neutral-400 dark:text-neutral-500 italic font-medium bg-neutral-50/50 dark:bg-neutral-800/30 p-4 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700/50 w-fit">
                            <svg className="w-5 h-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Sadece puan verildi, yazılı bir inceleme eklenmedi.
                        </div>
                    )}
                </div>

                {/* Alt Kategori / Etiketler (Modern Hap Butonları) */}
                {(review.category || review.watchTime || review.character || review.hasSpoiler) && (
                    <div className="mt-8 pt-5 border-t border-neutral-200/50 dark:border-neutral-800/50 flex flex-wrap gap-2.5 relative z-10">
                        {review.category && review.category !== 'REVIEW' && (
                             <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200/50 dark:border-indigo-500/20 uppercase tracking-wider backdrop-blur-sm">
                                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                 {review.category.replace('_', ' ')}
                             </span>
                        )}
                        {review.watchTime && (
                             <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200/50 dark:border-emerald-500/20 uppercase tracking-wider backdrop-blur-sm">
                                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                 {review.watchTime}
                             </span>
                        )}
                        {review.hasSpoiler && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded-full border border-rose-200/50 dark:border-rose-500/20 uppercase tracking-wider backdrop-blur-sm shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                 SPOILER İÇERİR
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HorizontalReviewCard;