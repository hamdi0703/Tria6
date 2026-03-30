
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService';
import { UserReview } from '../types';

// Helper to check valid UUID structure (Basic check)
const isValidId = (id?: string) => id && !id.startsWith('guest-') && id.length > 20;

// Global Yorumlar (Infinite)
export const useGlobalReviews = (movieId: number) => {
    return useInfiniteQuery({
        queryKey: ['reviews', movieId],
        queryFn: async ({ pageParam = 0 }) => {
            return await reviewService.getMovieReviews(movieId, pageParam);
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasMore ? allPages.length : undefined;
        },
        initialPageParam: 0,
        staleTime: 1000 * 60 * 2, // 2 dakika cache
    });
};

// Liste Sahibinin Yorumu (Tekil)
export const useOwnerReview = (movieId: number, ownerId?: string) => {
    return useQuery({
        queryKey: ['ownerReview', movieId, ownerId],
        queryFn: async () => {
            if (!ownerId) return null;
            return await reviewService.getSpecificUserReview(movieId, ownerId);
        },
        // Enabled check prevents query from running for invalid/guest IDs
        enabled: !!movieId && isValidId(ownerId),
        retry: false 
    });
};

// Toplu Yorum Çekimi (OwnerReviewsSection vb. için)
export const useOwnerReviewsBatch = (ownerId: string, movieIds: number[]) => {
    return useQuery({
        queryKey: ['ownerReviewsBatch', ownerId, movieIds],
        queryFn: async () => {
            if (!ownerId || movieIds.length === 0) return [];
            const fetchedReviews = await reviewService.getReviewsByUserAndMovies(ownerId, movieIds);

            // Sadece puanı veya yorumu olanları filtrele ve tarihe göre sırala
            const validReviews = fetchedReviews.filter(r => (r.rating && r.rating > 0) || (r.comment && r.comment.trim() !== ''));

            validReviews.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });

            return validReviews;
        },
        enabled: isValidId(ownerId) && movieIds.length > 0,
        staleTime: 1000 * 60 * 5, // 5 dakika cache (hız için)
    });
};

// Mutation Hooks (Ekle/Sil)
export const useReviewMutations = (movieId: number, userId?: string) => {
    const queryClient = useQueryClient();

    const addMutation = useMutation({
        mutationFn: (review: Partial<UserReview>) => {
            if (!userId) throw new Error("Giriş gerekli");
            if (!isValidId(userId)) throw new Error("Misafir kullanıcılar yorum yapamaz.");
            return reviewService.upsertReview(review, userId);
        },
        onSuccess: () => {
            // Yorum eklendiğinde global listeyi ve kendi yorumunu yenile
            queryClient.invalidateQueries({ queryKey: ['reviews', movieId] });
            if (userId && isValidId(userId)) {
                queryClient.invalidateQueries({ queryKey: ['ownerReview', movieId, userId] });
            }
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => {
            if (!userId) throw new Error("Giriş gerekli");
            return reviewService.deleteReview(movieId, userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', movieId] });
            if (userId && isValidId(userId)) {
                queryClient.invalidateQueries({ queryKey: ['ownerReview', movieId, userId] });
            }
        }
    });

    const voteMutation = useMutation({
        mutationFn: (variables: { reviewId: string, voteType: 'UP' | 'DOWN' }) => {
            if (!userId) throw new Error("Giriş gerekli");
            return reviewService.voteReview(variables.reviewId, userId, variables.voteType);
        },
        // Optimistic update logic handled in UI component or here (using onSuccess to refetch is safer but slower)
        onSuccess: () => {
             // Invalidate to fetch fresh counts
             queryClient.invalidateQueries({ queryKey: ['reviews', movieId] });
        }
    });

    return { addMutation, deleteMutation, voteMutation };
};
