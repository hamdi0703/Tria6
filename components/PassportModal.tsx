
import React, { useMemo, useState, useEffect } from 'react';
import TriaPassport from './profile/TriaPassport';
import { useCollectionContext } from '../context/CollectionContext';
import { useReviewContext } from '../context/ReviewContext';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatarUtils';
import { IMAGE_BASE_URL } from '../services/tmdbService';
import { supabase } from '../services/supabaseClient';
import { UserReview, Movie, SubscriptionTier } from '../types';

interface PassportModalProps {
  onClose: () => void;
}

const PassportModal: React.FC<PassportModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { collections } = useCollectionContext();
  const { reviews } = useReviewContext();
  
  const [bio, setBio] = useState<string>('');
  const [tier, setTier] = useState<SubscriptionTier>('BASIC');

  // Fetch Bio & Tier separately since it's in the profiles table (not in context)
  useEffect(() => {
      const fetchProfile = async () => {
          if (user && !user.id.startsWith('mock-')) {
              const { data } = await supabase.from('profiles').select('bio, tier').eq('id', user.id).single();
              if (data) {
                  setBio(data.bio || '');
                  setTier(data.tier || 'BASIC');
              }
          }
      };
      fetchProfile();
  }, [user]);

  // --- DATA MAPPING LOGIC (Strictly mapped to schema) ---
  const passportData = useMemo(() => {
    if (!user) return null;

    // 1. Header Data
    const username = user.user_metadata?.username || 'Member';
    const avatarUrl = getAvatarUrl(user.user_metadata?.avatar_url);
    const joinDate = new Date(user.created_at || Date.now()).getFullYear().toString();

    // 2. Statistics Row
    // Column 1: "Total Watched" -> Count of 'id' from reviews (keys of reviews object)
    const totalWatched = Object.keys(reviews).length;

    // Column 2: "Lists Created" -> Count of collections
    const listsCreated = collections.length;

    // Column 3: "Avg Score" -> Average of ratings from reviews
    const ratings = (Object.values(reviews) as UserReview[]).map(r => r.rating).filter(r => r > 0);
    const avgScore = ratings.length > 0 
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) 
        : '-';

    // 3. Showcase Section (Top Favorites)
    // Logic: Look for "Favorilerim" list or the active collection.
    // We need to map the IDs in `topFavoriteMovies` to actual Poster URLs.
    const favoritePosters: string[] = [];
    
    // Prioritize the default "Favorilerim" or the first collection
    const sourceCollection = collections.find(c => c.name === 'Favorilerim') || collections[0];

    if (sourceCollection) {
        // Merge movie and show favorites slots
        const allFavIds = [
            ...(sourceCollection.topFavoriteMovies || []),
            ...(sourceCollection.topFavoriteShows || [])
        ].filter(id => id !== null) as number[];

        // Find the movie objects in ANY collection to get the poster path
        // (Since we don't fetch movie details individually here, we look in loaded collections)
        const allLoadedMovies = collections.flatMap(c => c.movies);
        const movieMap = new Map<number, Movie>();
        allLoadedMovies.forEach(m => movieMap.set(m.id, m));

        allFavIds.slice(0, 4).forEach(id => {
            const movie = movieMap.get(id);
            if (movie && movie.poster_path) {
                favoritePosters.push(`${IMAGE_BASE_URL}${movie.poster_path}`);
            }
        });
    }

    // Fallback: If no favorites set, use high rated movies from reviews
    if (favoritePosters.length < 4) {
        const remainingSlots = 4 - favoritePosters.length;
        const highlyRated = (Object.values(reviews) as UserReview[])
            .filter(r => r.rating >= 8)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, remainingSlots);
        
        // Find movies for these reviews
        const allLoadedMovies = collections.flatMap(c => c.movies);
        const movieMap = new Map<number, Movie>();
        allLoadedMovies.forEach(m => movieMap.set(m.id, m));

        highlyRated.forEach(r => {
            const movie = movieMap.get(r.movieId);
            if (movie && movie.poster_path && !favoritePosters.includes(`${IMAGE_BASE_URL}${movie.poster_path}`)) {
                favoritePosters.push(`${IMAGE_BASE_URL}${movie.poster_path}`);
            }
        });
    }

    return {
        username,
        avatarUrl,
        memberSince: joinDate,
        bio,
        stats: {
            totalWatched,
            listsCreated,
            avgScore
        },
        favorites: favoritePosters,
        tier // Pass Tier
    };
  }, [user, collections, reviews, bio, tier]);

  if (!passportData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in" onClick={onClose}>
        
        {/* Close Button (Top Right - Minimalist) */}
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-neutral-500 hover:text-white transition-colors z-[110]"
        >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="relative animate-slide-in-up w-full max-w-md flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <TriaPassport 
                username={passportData.username}
                avatarUrl={passportData.avatarUrl}
                memberSince={passportData.memberSince}
                bio={passportData.bio}
                stats={passportData.stats}
                favorites={passportData.favorites}
                tier={passportData.tier}
            />
            
            <div className="mt-8 flex gap-4 opacity-50 hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-neutral-500 font-mono">POWERED BY TRIA DB</span>
            </div>
        </div>
    </div>
  );
};

export default PassportModal;
