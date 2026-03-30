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
        return null; // Eğer hiç yorum yoksa bu bölümü hiç gösterme
    }

    return (
        <div className="mt-20 pt-16 border-t-2 border-dashed border-neutral-200 dark:border-neutral-800 animate-fade-in px-4 md:px-0">
            <div className="mb-10 text-center md:text-left">
                 <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-2 tracking-tight flex items-center justify-center md:justify-start gap-3">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {ownerName} Ne Düşünüyor?
                 </h2>
                 <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base">
                    Liste sahibinin bu koleksiyondaki yapımlar hakkındaki kişisel değerlendirmeleri ve puanları.
                 </p>
            </div>

            <div className="flex flex-col gap-6">
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