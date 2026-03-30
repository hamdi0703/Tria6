
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Movie, Collection, SubscriptionTier } from '../types';

interface ProfileData {
    id: string;
    username: string;
    avatar_url: string;
    bio?: string;
    website?: string;
    created_at: string;
    collections: Collection[];
    isPrivate?: boolean;
    is_public?: boolean;
    tier?: SubscriptionTier; // Added Tier
}

export const useProfileData = (
    username: string,
    authUser: any,
    myCollections: Collection[],
    myReviews: Record<number, any>
) => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [movieCache, setMovieCache] = useState<Record<number, Movie>>({});

    const isOwner = authUser?.user_metadata?.username === username;

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            // A. OWN PROFILE (Context Optimized)
            if (isOwner && authUser) {
                // Fetch collection items for own collections since myCollections mostly has empty movies (lazy loaded)
                const collectionIds = myCollections.map(c => c.id);
                let allItems: any[] = [];
                if (collectionIds.length > 0) {
                    const { data: items } = await supabase
                        .from('collection_items')
                        .select('collection_id, movie_data, added_at')
                        .in('collection_id', collectionIds);
                    allItems = items || [];
                }

                const populatedCollections = myCollections.map(col => {
                    const colItems = allItems.filter(item => item.collection_id === col.id);
                    return {
                        ...col,
                        movies: colItems.map(item => ({ ...item.movie_data, addedAt: item.added_at }))
                    };
                });

                const builtProfile: ProfileData = {
                    id: authUser.id,
                    username: authUser.user_metadata?.username,
                    avatar_url: authUser.user_metadata?.avatar_url,
                    bio: '',
                    website: '',
                    created_at: authUser.created_at,
                    collections: populatedCollections,
                    tier: 'BASIC' // Default, fetch will overwrite
                };

                // Lazy fetch extended details (including tier)
                supabase.from('profiles').select('*').eq('id', authUser.id).single().then(({ data }) => {
                    if (data) {
                        setProfile((prev: any) => ({ ...prev, ...data, tier: data.tier || 'BASIC' }));
                    }
                });

                setProfile(builtProfile);

                const reviewArray = Object.values(myReviews).sort((a: any, b: any) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setReviews(reviewArray);

                const cache: Record<number, Movie> = {};
                populatedCollections.forEach(col => {
                    col.movies.forEach((m: Movie) => {
                        cache[m.id] = m;
                    });
                });
                setMovieCache(cache);
                
                setLoading(false);
                return;
            }

            // B. VISITOR PROFILE (Cloud Fetch)
            try {
                // 1. Fetch Basic Profile
                const { data: userProfile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('username', username)
                    .single();
                
                if (profileError || !userProfile) throw new Error("Kullanıcı bulunamadı");

                if (userProfile.is_public === false) {
                    setProfile({ ...userProfile, collections: [], isPrivate: true, tier: userProfile.tier || 'BASIC' }); 
                    setLoading(false);
                    return;
                }

                // 2. Fetch Details
                const [collectionsResult, reviewsResult] = await Promise.all([
                    supabase
                        .from('user_collections')
                        .select('*')
                        .eq('user_id', userProfile.id)
                        .eq('is_public', true),
                    
                    supabase
                        .from('reviews')
                        .select('*')
                        .eq('user_id', userProfile.id)
                        .order('created_at', { ascending: false })
                ]);

                let rawCollections = collectionsResult.data || [];
                const collectionIds = rawCollections.map((c: any) => c.id);
                let allItems: any[] = [];

                if (collectionIds.length > 0) {
                    const { data: items } = await supabase
                        .from('collection_items')
                        .select('collection_id, movie_data, added_at')
                        .in('collection_id', collectionIds);
                    allItems = items || [];
                }

                const collections: Collection[] = rawCollections.map((d: any) => {
                    const colItems = allItems.filter(item => item.collection_id === d.id);
                    return {
                        id: d.id,
                        name: d.name,
                        description: d.description,
                        isPublic: d.is_public,
                        shareToken: d.share_token,
                        coverImage: d.cover_image,
                        movies: colItems.map(item => ({ ...item.movie_data, addedAt: item.added_at })),
                        ownerId: d.user_id
                    };
                });

                setProfile({
                    ...userProfile,
                    collections: collections,
                    tier: userProfile.tier || 'BASIC'
                });
                
                setReviews(reviewsResult.data || []);

                const cache: Record<number, Movie> = {};
                collections.forEach(col => {
                    col.movies.forEach(m => {
                        cache[m.id] = m;
                    });
                });
                setMovieCache(cache);

            } catch (error) {
                console.error(error);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [username, isOwner, authUser, myCollections, myReviews]);

    return { loading, profile, reviews, movieCache, isOwner };
};
