
import { supabase } from './supabaseClient';
import { UserReview, PostCategory } from '../types';

const PAGE_SIZE = 10;

export const reviewService = {
    // 1. Global Yorumları Getir
    async getMovieReviews(movieId: number, page: number = 0) {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        // 1. Yorumları Çek (Profiles ilişkisi olmadan, 400 hatasını önlemek için)
        const response = await supabase
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
                user_id
            `, { count: 'exact' })
            .eq('movie_id', movieId)
            .order('created_at', { ascending: false })
            .range(from, to);

        const reviewsData = response.data || [];
        const count = response.count || 0;
        const error = response.error;

        if (error) {
            console.error("Review fetch error:", error);
            return { data: [], count: 0, hasMore: false };
        }

        // 1.5 Kullanıcı profillerini ayrı olarak çek
        const userIds = [...new Set(reviewsData.map(r => r.user_id).filter(Boolean))];
        let profilesMap: Record<string, any> = {};

        if (userIds.length > 0) {
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .in('id', userIds);

            if (profilesData) {
                profilesMap = profilesData.reduce((acc, profile) => {
                    acc[profile.id] = profile;
                    return acc;
                }, {} as Record<string, any>);
            }
        }

        // 2. Mevcut kullanıcı ID'sini al (Anonim okuma için hata fırlatmaz, null döner)
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;

        // 3. Veriyi Formatla ve Oy Durumunu Hesapla
        const formattedReviews: UserReview[] = reviewsData.map((r: any) => {
            // Etiket Çözümleme
            let allTags: string[] = r.tags || [];
            let resolvedTags: PostCategory[] = [];
            let character: string | undefined = undefined;
            let watchTime: string | undefined = undefined;

            allTags.forEach(tag => {
                if (typeof tag === 'string') {
                    if (tag.startsWith('CHARACTER:')) character = tag.replace('CHARACTER:', '');
                    else if (tag.startsWith('TIME:')) watchTime = tag.replace('TIME:', '');
                    else resolvedTags.push(tag as PostCategory);
                }
            });

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

            const profile = r.user_id ? profilesMap[r.user_id] : null;

            return {
                id: r.id,
                movieId: r.movie_id,
                rating: r.rating,
                comment: r.comment,
                hasSpoiler: r.has_spoiler,
                category: r.category || 'REVIEW',
                tags: resolvedTags,
                character: character,
                watchTime: watchTime,
                createdAt: r.created_at,
                upvotes: r.upvotes || 0,
                downvotes: r.downvotes || 0,
                upvoted_by: r.upvoted_by || [],
                downvoted_by: r.downvoted_by || [],
                user_id: r.user_id,
                username: profile?.username || 'Anonim',
                avatar_url: profile?.avatar_url || '1',
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

        // Relation olmadan çekiyoruz
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('movie_id', movieId)
            .eq('user_id', userId)
            .maybeSingle();

        if (error) return null;
        if (!data) return null;

        // Kullanıcı profilini çekiyoruz
        let profile = null;
        if (data.user_id) {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', data.user_id)
                .maybeSingle();
            profile = profileData;
        }

        // Backward Compatibility
        let allTags: string[] = data.tags || [];
        let resolvedTags: PostCategory[] = [];
        let character: string | undefined = undefined;
        let watchTime: string | undefined = undefined;

        allTags.forEach(tag => {
            if (typeof tag === 'string') {
                if (tag.startsWith('CHARACTER:')) character = tag.replace('CHARACTER:', '');
                else if (tag.startsWith('TIME:')) watchTime = tag.replace('TIME:', '');
                else resolvedTags.push(tag as PostCategory);
            }
        });

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
            character: character,
            watchTime: watchTime,
            createdAt: data.created_at,
            upvotes: data.upvotes || 0,
            downvotes: data.downvotes || 0,
            upvoted_by: data.upvoted_by || [],
            downvoted_by: data.downvoted_by || [],
            user_id: data.user_id,
            username: profile?.username || 'Kullanıcı',
            avatar_url: profile?.avatar_url || '1',
            currentUserVote: voteStatus
        } as UserReview;
    },

    // 3. Yorum Ekle/Güncelle (Upsert)
    async upsertReview(review: Partial<UserReview>, userId: string) {
        if (!userId || userId.startsWith('guest-')) {
            throw new Error("Yorum yapmak için giriş yapmalısınız.");
        }

        const tagsToSave = review.tags && review.tags.length > 0 ? review.tags : ['REVIEW'];

        // JSONB column "tags" or similar could store extra metadata,
        // but since we only have `comment` we will save `character` and `watchTime`
        // as structured JSON inside the existing `comment` field if we want, or append them as text.
        // Or if there is a metadata column, we could use it. But looking at supabase_setup.sql, we have:
        // rating, comment, has_spoiler, category, tags.
        // Since `tags` is JSONB, we can safely embed additional info there without modifying schema:
        // tags: [...tagsToSave, { character: review.character, watchTime: review.watchTime }]
        // But since tags is `PostCategory[]` in TypeScript, maybe it's simpler to append to the comment text,
        // OR format the comment. Since the user can edit, a text format is trickier to parse back.
        // Let's use a delimiter in the comment string, or just add them to the `tags` array as string values and filter them later.

        // For now, let's embed them into a special JSON string inside `tags` if needed,
        // or just accept them as normal strings in the `tags` array in Postgres.

        let extraMeta = [];
        if (review.character) extraMeta.push(`CHARACTER:${review.character}`);
        if (review.watchTime) extraMeta.push(`TIME:${review.watchTime}`);

        const finalTags = [...tagsToSave, ...extraMeta];

        const dbPayload = {
            user_id: userId,
            movie_id: review.movieId,
            rating: review.rating,
            comment: review.comment,
            has_spoiler: review.hasSpoiler || false,
            category: tagsToSave[0],
            tags: finalTags,
            updated_at: new Date().toISOString()
        };

        // GÜNCELLEME: upsert için primary key constraint (unique identifier) kullanın.
        // Veritabanı yapısına bağlı olarak, genelde benzersiz olan sütunların constraint ismini vermek daha güvenlidir
        // Veya supabase upsert'te doğrudan kullanıcının aynı filme birden fazla yorum atmasını engelleyen
        // benzersiz indeks (user_id, movie_id) adı girilmelidir. Eğer bu bir constraint değilse, hata verecektir.
        // Bu hatayı (there is no unique or exclusion constraint matching the ON CONFLICT specification) önlemek
        // için önce ilgili kullanıcının ve filmin yorumunu silip insert yapabiliriz veya sadece id varsa ona göre yapabiliriz.

        // Geçici ama güvenli çözüm: onConflict parametresini varsayılan primary key (id) olarak kullanmak.
        // Ama biz user_id ve movie_id kullanmak istiyoruz, onConflict parametresini kaldırıp .eq zinciriyle match edeceğiz
        // ya da eğer upsert desteklenmiyorsa update ve insert işlemini ayıracağız.

        let existingReview;

        // Önce yorum var mı diye bak
        const { data: existingData } = await supabase
            .from('reviews')
            .select('id')
            .eq('user_id', userId)
            .eq('movie_id', review.movieId)
            .maybeSingle();

        existingReview = existingData;

        let error;

        if (existingReview && existingReview.id) {
            // Yorum varsa, update et
            const updateResponse = await supabase
                .from('reviews')
                .update(dbPayload)
                .eq('id', existingReview.id);
            error = updateResponse.error;
        } else {
            // Yorum yoksa, insert et
            const insertResponse = await supabase
                .from('reviews')
                .insert(dbPayload);
            error = insertResponse.error;
        }

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

    // 7. Kullanıcının Birden Fazla Film İçin Yorumlarını Getir (Toplu Çekim)
    async getReviewsByUserAndMovies(userId: string, movieIds: number[]) {
        if (!userId || userId.startsWith('guest-') || !movieIds || movieIds.length === 0) {
            return [];
        }

        const { data, error } = await supabase
            .from('reviews')
            .select(`
                id,
                movie_id,
                rating,
                comment,
                has_spoiler,
                category,
                created_at,
                updated_at,
                tags
            `)
            .eq('user_id', userId)
            .in('movie_id', movieIds);

        if (error || !data) {
            console.error("Batch review fetch error:", error);
            return [];
        }

        return data.map((r: any) => {
            // Etiket Çözümleme
            let allTags: string[] = r.tags || [];
            let resolvedTags: PostCategory[] = [];
            let character: string | undefined = undefined;
            let watchTime: string | undefined = undefined;

            allTags.forEach(tag => {
                if (typeof tag === 'string') {
                    if (tag.startsWith('CHARACTER:')) character = tag.replace('CHARACTER:', '');
                    else if (tag.startsWith('TIME:')) watchTime = tag.replace('TIME:', '');
                    else resolvedTags.push(tag as PostCategory);
                }
            });

            if (resolvedTags.length === 0 && r.category) {
                resolvedTags = [r.category as PostCategory];
            }
            if (resolvedTags.length === 0) resolvedTags = ['REVIEW'];

            return {
                id: r.id,
                movieId: r.movie_id,
                rating: r.rating,
                comment: r.comment,
                hasSpoiler: r.has_spoiler,
                category: r.category || 'REVIEW',
                tags: resolvedTags,
                character: character,
                watchTime: watchTime,
                createdAt: r.created_at,
                user_id: userId
            } as UserReview;
        });
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
