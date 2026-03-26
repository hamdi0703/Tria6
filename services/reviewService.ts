
import { supabase } from './supabaseClient';
import { UserReview, PostCategory } from '../types';

const PAGE_SIZE = 10;

export const reviewService = {
    // 1. Global Yorumları Getir
    async getMovieReviews(movieId: number, page: number = 0) {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        // 1. Yorumları Çek (Array sütunlarını da alıyoruz)
        const { data: reviewsData, error, count } = await supabase
            .from('reviews')
            .select(`
                id,
                movie_id,
                rating,
                comment,
                has_spoiler,
                category,
                tags,
                created_at,
                upvotes,
                downvotes,
                upvoted_by,
                downvoted_by,
                user_id,
                profiles:user_id (
                    username,
                    avatar_url
                )
            `, { count: 'exact' })
            .eq('movie_id', movieId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Review fetch error:", error);
            return { data: [], count: 0, hasMore: false };
        }

        // 2. Mevcut kullanıcı ID'sini al
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;

        // 3. Veriyi Formatla ve Oy Durumunu Hesapla
        const formattedReviews: UserReview[] = reviewsData.map((r: any) => {
            // Etiket Çözümleme
            let resolvedTags: PostCategory[] = r.tags || [];
            if (resolvedTags.length === 0 && r.category) {
                resolvedTags = [r.category as PostCategory];
            }
            if (resolvedTags.length === 0) resolvedTags = ['REVIEW'];

            // Oy Durumunu Belirle (Array kontrolü)
            let voteStatus: 'UP' | 'DOWN' | null = null;
            if (currentUserId) {
                if (r.upvoted_by && r.upvoted_by.includes(currentUserId)) voteStatus = 'UP';
                else if (r.downvoted_by && r.downvoted_by.includes(currentUserId)) voteStatus = 'DOWN';
            }

            return {
                id: r.id,
                movieId: r.movie_id,
                rating: r.rating,
                comment: r.comment,
                hasSpoiler: r.has_spoiler,
                category: r.category || 'REVIEW',
                tags: resolvedTags,
                createdAt: r.created_at,
                upvotes: r.upvotes || 0,
                downvotes: r.downvotes || 0,
                upvoted_by: r.upvoted_by || [],
                downvoted_by: r.downvoted_by || [],
                user_id: r.user_id,
                username: r.profiles?.username || 'Anonim',
                avatar_url: r.profiles?.avatar_url || '1',
                currentUserVote: voteStatus
            };
        });

        return { data: formattedReviews, count, hasMore: (count || 0) > to + 1 };
    },

    // 2. Kullanıcının Kendi Yorumunu Getir
    async getSpecificUserReview(movieId: number, userId: string) {
        if (!userId || userId.startsWith('guest-')) {
            return null;
        }

        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                profiles:user_id (username, avatar_url)
            `)
            .eq('movie_id', movieId)
            .eq('user_id', userId)
            .maybeSingle();

        if (error) return null;
        if (!data) return null;

        // Backward Compatibility
        let resolvedTags: PostCategory[] = data.tags || [];
        if (resolvedTags.length === 0 && data.category) {
            resolvedTags = [data.category as PostCategory];
        }
        if (resolvedTags.length === 0) resolvedTags = ['REVIEW'];

        // Kendi yorumuna oy veremez mantığı olsa da yapıyı koruyoruz
        let voteStatus: 'UP' | 'DOWN' | null = null;
        if (data.upvoted_by && data.upvoted_by.includes(userId)) voteStatus = 'UP';
        else if (data.downvoted_by && data.downvoted_by.includes(userId)) voteStatus = 'DOWN';

        return {
            id: data.id,
            movieId: data.movie_id,
            rating: data.rating,
            comment: data.comment,
            hasSpoiler: data.has_spoiler,
            category: data.category || 'REVIEW',
            tags: resolvedTags,
            createdAt: data.created_at,
            upvotes: data.upvotes || 0,
            downvotes: data.downvotes || 0,
            upvoted_by: data.upvoted_by || [],
            downvoted_by: data.downvoted_by || [],
            user_id: data.user_id,
            username: data.profiles?.username || 'Kullanıcı',
            avatar_url: data.profiles?.avatar_url || '1',
            currentUserVote: voteStatus
        } as UserReview;
    },

    // 3. Yorum Ekle/Güncelle (Upsert)
    async upsertReview(review: Partial<UserReview>, userId: string) {
        if (!userId || userId.startsWith('guest-')) {
            throw new Error("Yorum yapmak için giriş yapmalısınız.");
        }

        const tagsToSave = review.tags && review.tags.length > 0 ? review.tags : ['REVIEW'];

        const dbPayload = {
            user_id: userId,
            movie_id: review.movieId,
            rating: review.rating,
            comment: review.comment,
            has_spoiler: review.hasSpoiler || false,
            category: tagsToSave[0],
            tags: tagsToSave,
            updated_at: new Date().toISOString()
        };

        // GÜNCELLEME: onConflict constraint ismini açıkça belirtiyoruz.
        const { error } = await supabase
            .from('reviews')
            .upsert(dbPayload, { onConflict: 'user_id, movie_id' });

        if (error) {
            console.error("Upsert Error:", error);
            throw new Error("Yorum kaydedilemedi: " + error.message);
        }
    },

    // 4. Yorum Sil
    async deleteReview(movieId: number, userId: string) {
        if (!userId || userId.startsWith('guest-')) {
             throw new Error("Silme işlemi için yetkiniz yok.");
        }

        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('user_id', userId)
            .eq('movie_id', movieId);

        if (error) {
             console.error("Delete Error:", error);
             throw new Error("Silme işlemi başarısız: " + error.message);
        }
    },

    // 5. Yorum Oyla (RPC)
    async voteReview(reviewId: string, userId: string, voteType: 'UP' | 'DOWN') {
        if (!userId || userId.startsWith('guest-')) {
            throw new Error("Oy vermek için giriş yapmalısınız.");
        }

        // RPC Fonksiyonunu Çağır
        const { error } = await supabase.rpc('handle_review_vote', {
            target_review_id: reviewId,
            voter_id: userId,
            vote_type: voteType
        });

        if (error) {
            console.error("Vote Error:", error);
            throw new Error("Oylama işlemi başarısız.");
        }
    },

    // 6. Şikayet Et
    async reportReview(params: any) {
        const { reviewId, reviewContent, reviewOwnerId, reporterId, reason, additionalDetails, movieTitle } = params;
        const payload = {
            user_id: reporterId || null, 
            type: 'report', 
            subject: `[ŞİKAYET] ${movieTitle} - ${reason}`,
            message: `KATEGORİ: ${reason}\n\nDETAY:\n${additionalDetails || '-'}\n\nİÇERİK:\n"${reviewContent}"`,
            contact_email: 'system-report@tria.app',
            status: 'pending',
            device_info: { target: 'review', review_id: reviewId, reported_user: reviewOwnerId }
        };
        const { error } = await supabase.from('feedback').insert(payload);
        if (error) throw error;
    }
};
