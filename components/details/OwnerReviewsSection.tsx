import React, { useEffect, useState } from 'react';
import { Movie, UserReview } from '../../types';
import { reviewService } from '../../services/reviewService';
import HorizontalReviewCard from '../ui/HorizontalReviewCard';

interface OwnerReviewsSectionProps {
    ownerId: string;
    ownerName: string;
    movies: Movie[];
}

const OwnerReviewsSection: React.FC<OwnerReviewsSectionProps> = ({ ownerId, ownerName, movies }) => {
    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!ownerId || !movies || movies.length === 0) return;

            setIsLoading(true);
            try {
                const movieIds = movies.map(m => m.id);
                const fetchedReviews = await reviewService.getReviewsByUserAndMovies(ownerId, movieIds);
                // Sadece puanı veya yorumu olanları filtrele
                const validReviews = fetchedReviews.filter(r => (r.rating && r.rating > 0) || (r.comment && r.comment.trim() !== ''));

                // Tarihe göre sırala (en yeni en üstte)
                validReviews.sort((a, b) => {
                     const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                     const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                     return dateB - dateA;
                });

                setReviews(validReviews);
            } catch (error) {
                console.error("Owner reviews fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [ownerId, movies]);

    if (isLoading) {
        return (
            <div className="mt-20 flex flex-col items-center">
                 <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border border-neutral-200 dark:border-neutral-800 animate-fade-in mx-4">
                <svg className="w-16 h-16 opacity-40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="font-medium">{ownerName} bu kategorideki yapımlar için henüz bir inceleme yazmamış.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in px-4 md:px-0">
            {/* GRID YAPIYA GEÇİŞ: lg:grid-cols-2 ile büyük ekranda yan yana iki kart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reviews.map(review => {
                    const movie = movies.find(m => m.id === review.movieId);
                    if (!movie) return null;
                    return (
                        <HorizontalReviewCard
                            key={review.id}
                            movie={movie}
                            review={review}
                            ownerName={ownerName}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default OwnerReviewsSection;