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
        <div className="flex flex-col md:flex-row bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-neutral-100 dark:border-neutral-800 hover:-translate-y-1">

            {/* SOL KISIM: Afiş ve Kısa Künye */}
            <div className="w-full md:w-1/4 lg:w-1/5 relative group cursor-pointer shrink-0">
                <div className="aspect-[2/3] md:h-full md:aspect-auto bg-neutral-800 relative overflow-hidden">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-500">
                             Afiş Yok
                        </div>
                    )}

                    {/* Dark gradient for mobile readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:hidden" />

                    {/* Mobile Only: Title over image */}
                    <div className="absolute bottom-4 left-4 right-4 md:hidden text-white z-10">
                        <h3 className="font-bold text-lg leading-tight drop-shadow-md">{title}</h3>
                        {releaseYear && <span className="text-xs font-medium text-white/80">{releaseYear}</span>}
                    </div>
                </div>
            </div>

            {/* SAĞ KISIM: İnceleme ve Detaylar */}
            <div className="w-full md:w-3/4 lg:w-4/5 p-6 md:p-8 flex flex-col justify-between relative bg-neutral-50 dark:bg-neutral-900">

                {/* Desktop Title & Date Header */}
                <div className="hidden md:flex justify-between items-start mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-neutral-900 dark:text-white leading-tight">
                            {title}
                        </h3>
                        {releaseYear && (
                            <div className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mt-1">
                                {releaseYear} • {movie.vote_average ? `Global: ${movie.vote_average.toFixed(1)}` : ''}
                            </div>
                        )}
                    </div>
                    {reviewDate && (
                         <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider shrink-0 mt-1">
                             {reviewDate}
                         </div>
                    )}
                </div>

                {/* Mobile Date Header */}
                <div className="flex md:hidden justify-between items-center mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{ownerName}</div>
                    {reviewDate && <div className="text-[10px] text-neutral-400">{reviewDate}</div>}
                </div>

                {/* Yorum İçeriği ve Puan */}
                <div className="flex-grow flex flex-col justify-center">

                    {/* Puan Rozeti */}
                    {review.rating && review.rating > 0 && (
                        <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800 self-start">
                             <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                             <span className="text-lg font-black text-indigo-700 dark:text-indigo-400 leading-none">
                                {review.rating} <span className="text-sm font-medium opacity-50">/ 10</span>
                             </span>
                        </div>
                    )}

                    {/* Yorum Metni */}
                    {review.comment ? (
                        <div className="relative">
                            <svg className="absolute -top-3 -left-4 w-8 h-8 text-neutral-200 dark:text-neutral-800 opacity-50 transform -scale-x-100" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                            <p className="text-base md:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed italic z-10 relative">
                                "{displayComment}"
                            </p>

                            {isLongComment && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="mt-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors focus:outline-none"
                                >
                                    {isExpanded ? 'Daha Az Göster' : 'Devamını Oku'}
                                </button>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-400 italic">Sadece puan verildi, yorum yapılmadı.</p>
                    )}
                </div>

                {/* Alt Kategori / Etiketler (Opsiyonel) */}
                {(review.category || review.watchTime || review.character) && (
                    <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/50 flex flex-wrap gap-2">
                        {review.category && review.category !== 'REVIEW' && (
                             <span className="text-[10px] font-bold px-2.5 py-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-md uppercase tracking-wider">
                                 {review.category.replace('_', ' ')}
                             </span>
                        )}
                        {review.watchTime && (
                             <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-800/30">
                                 ⏱ {review.watchTime}
                             </span>
                        )}
                        {review.hasSpoiler && (
                            <span className="text-[10px] font-bold px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md border border-red-100 dark:border-red-800/30">
                                 🚨 SPOILER
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HorizontalReviewCard;