
import React, { useState, useEffect } from 'react';
import { Movie } from '../../types';
import { TmdbService, IMAGE_BASE_URL } from '../../services/tmdbService';

interface TimelineReviewProps {
    review: any;
    onSelect: (m: Movie) => void;
    cachedMovie?: Movie;
}

const TimelineReview: React.FC<TimelineReviewProps> = ({ review, onSelect, cachedMovie }) => {
    const [movieData, setMovieData] = useState<Movie | null>(cachedMovie || null);

    useEffect(() => {
        if (cachedMovie) {
            setMovieData(cachedMovie);
            return;
        }
        const fetchM = async () => {
            try {
                const tmdb = new TmdbService();
                // Fallback for ID property mismatch (db uses movie_id, context uses movieId)
                const id = review.movie_id || review.movieId;
                if(id) {
                    const data = await tmdb.getMovieDetail(id);
                    setMovieData(data);
                }
            } catch (e) { console.error(e); }
        };
        fetchM();
    }, [review, cachedMovie]);

    if (!movieData) return (
        <div className="pl-8 pb-4">
            <div className="h-24 bg-neutral-100 dark:bg-neutral-800/50 rounded-2xl animate-pulse"></div>
        </div>
    );

    return (
        <div className="relative pl-8 pb-10 border-l-2 border-neutral-200 dark:border-neutral-800 last:border-0 last:pb-0 group">
            {/* Dot */}
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white dark:border-black"></div>
            
            <div 
                onClick={() => onSelect(movieData)}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-lg transition-all"
            >
                <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                    <img src={`${IMAGE_BASE_URL}${movieData.poster_path}`} className="w-full h-full object-cover" alt="" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-neutral-900 dark:text-white truncate pr-2">
                            {movieData.title || movieData.name}
                        </h4>
                        <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-lg">
                            <span className="text-yellow-600 dark:text-yellow-400 text-xs font-black">{review.rating}</span>
                            <span className="text-[10px] text-yellow-600/50">/10</span>
                        </div>
                    </div>
                    
                    <div className="text-[10px] text-neutral-400 mb-3 font-medium uppercase tracking-wide">
                        {new Date(review.created_at || review.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>

                    {review.comment ? (
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">
                            {review.has_spoiler || review.hasSpoiler ? (
                                <span className="text-red-500 italic">⚠️ Spoiler içeriyor.</span>
                            ) : (
                                `"${review.comment}"`
                            )}
                        </p>
                    ) : (
                        <p className="text-xs text-neutral-400 italic">Yorum yok, sadece puan.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimelineReview;
