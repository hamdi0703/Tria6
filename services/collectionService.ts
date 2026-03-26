
import { supabase } from './supabaseClient';
import { Collection, Movie } from '../types';

export const collectionService = {
    // 1. Sadece Liste Başlıklarını (Metadata) Getir - HIZLI
    async getUserCollectionsMetadata(userId: string) {
        // Filmleri çekmiyoruz, sadece kaç tane olduğunu sayıyoruz (count)
        return supabase
            .from('user_collections')
            .select('id, name, description, is_public, share_token, cover_image, top_favorite_movies, top_favorite_shows, user_id')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });
    },

    // 2. Bir listenin içeriğini (Items) getir - SAYFALAMA YAPILABİLİR
    async getCollectionItems(collectionId: string) {
        const { data, error } = await supabase
            .from('collection_items')
            .select('movie_data, added_at')
            .eq('collection_id', collectionId)
            .order('added_at', { ascending: false }); // En son eklenen en üstte

        if (error) throw error;

        // DB'den gelen yapıyı Movie formatına çevir
        return data.map((item: any) => ({
            ...item.movie_data,
            addedAt: item.added_at
        })) as Movie[];
    },

    // Yeni Liste Oluştur
    async createCollection(collectionData: any) {
        // movies jsonb alanını temizleyerek gönderiyoruz
        const { movies, itemCount, ...cleanData } = collectionData;
        return supabase
            .from('user_collections')
            .insert(cleanData)
            .select()
            .single();
    },

    // Listeyi Sil
    async deleteCollection(id: string) {
        return supabase
            .from('user_collections')
            .delete()
            .eq('id', id);
    },

    // Liste Ayarlarını Güncelle
    async updateCollectionSettings(id: string, updates: Partial<Collection>) {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;
        if (updates.shareToken !== undefined) dbUpdates.share_token = updates.shareToken;
        if (updates.coverImage !== undefined) dbUpdates.cover_image = updates.coverImage;

        return supabase
            .from('user_collections')
            .update(dbUpdates)
            .eq('id', id);
    },

    // TEK BİR FİLM EKLE (Relational Insert)
    async addMovieToCollection(collectionId: string, movie: Movie) {
        return supabase
            .from('collection_items')
            .insert({
                collection_id: collectionId,
                movie_id: movie.id,
                movie_data: movie, // JSONB Caching
                added_at: new Date().toISOString()
            });
    },

    // TEK BİR FİLM SİL (Relational Delete)
    async removeMovieFromCollection(collectionId: string, movieId: number) {
        return supabase
            .from('collection_items')
            .delete()
            .eq('collection_id', collectionId)
            .eq('movie_id', movieId);
    },

    // FAVORİLERİ GÜNCELLE
    async updateTopFavorites(id: string, topMovies: any[], topShows: any[]) {
        return supabase
            .from('user_collections')
            .update({ 
                top_favorite_movies: topMovies,
                top_favorite_shows: topShows
            })
            .eq('id', id);
    },

    // FİLM GÜNCELLE (Detaylar değişince cache'i yenile)
    async updateCachedMovie(collectionId: string, movie: Movie) {
        return supabase
            .from('collection_items')
            .update({ movie_data: movie })
            .eq('collection_id', collectionId)
            .eq('movie_id', movie.id);
    },

    // Token ile Liste Getir (Paylaşım) - İçeriğiyle birlikte
    async getCollectionByToken(token: string) {
        // Guard against invalid tokens stringified
        if (!token || token === 'null' || token === 'undefined') {
            return { data: null, error: { message: 'Invalid token' } };
        }

        // Önce listeyi al
        const { data: list, error } = await supabase
            .from('user_collections')
            .select('*')
            .eq('share_token', token)
            .single();
        
        if (error || !list) return { data: null, error };

        // DÖNÜŞÜM: DB (snake_case) -> APP (camelCase)
        const mappedList: Collection = {
            id: list.id,
            name: list.name,
            description: list.description,
            isPublic: list.is_public,
            shareToken: list.share_token,
            coverImage: list.cover_image,
            ownerId: list.user_id,
            owner: list.user_id, // Geçici olarak ID atıyoruz, UI'da kullanıcı adını profile tablosundan çekmek gerekebilir ama şimdilik ID yeterli
            topFavoriteMovies: list.top_favorite_movies, // KRİTİK DÜZELTME
            topFavoriteShows: list.top_favorite_shows,   // KRİTİK DÜZELTME
            movies: [] 
        };

        // Sonra içeriğini al
        const { data: items } = await supabase
            .from('collection_items')
            .select('movie_data, added_at')
            .eq('collection_id', list.id);

        const movies = items?.map((i: any) => ({ ...i.movie_data, addedAt: i.added_at })) || [];
        mappedList.movies = movies;

        return { data: mappedList, error: null };
    },

    // ID ile Liste Getir (Bulut)
    async getCollectionById(id: string) {
        const { data: list, error } = await supabase
            .from('user_collections')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !list) return { data: null, error };

        // DÖNÜŞÜM: DB (snake_case) -> APP (camelCase)
        const mappedList: Collection = {
            id: list.id,
            name: list.name,
            description: list.description,
            isPublic: list.is_public,
            shareToken: list.share_token,
            coverImage: list.cover_image,
            ownerId: list.user_id,
            topFavoriteMovies: list.top_favorite_movies, // KRİTİK DÜZELTME
            topFavoriteShows: list.top_favorite_shows,   // KRİTİK DÜZELTME
            movies: []
        };

        const { data: items } = await supabase
            .from('collection_items')
            .select('movie_data, added_at')
            .eq('collection_id', list.id);

        const movies = items?.map((i: any) => ({ ...i.movie_data, addedAt: i.added_at })) || [];
        mappedList.movies = movies;

        return { data: mappedList, error: null };
    }
};
