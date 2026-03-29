
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
    // Column 1: "Total Watched/İçerik" -> Count of unique items across all collections
    const uniqueItems = new Set<number>();
    collections.forEach(c => {
        c.movies?.forEach(m => uniqueItems.add(m.id));
    });
    const totalWatched = uniqueItems.size;

    // Column 2: "Lists Created" -> Count of collections
    const listsCreated = collections.length;

    // Column 3: "Avg Score" -> Average of ratings from reviews
    const ratings = (Object.values(reviews) as UserReview[]).map(r => r.rating).filter(r => r > 0);
    const avgScore = ratings.length > 0 
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) 
        : '-';

    // 3. Showcase Section (Top Favorites)
    // Logic: Pull from Vitrin (Showcase) which is stored in collections.
    // We want the first 3 movies from topFavoriteMovies and the first 1 show from topFavoriteShows
    // across all collections (typically stored in the first/main collection).
    const favoritePosters: string[] = [];
    
    let showcaseMovies: number[] = [];
    let showcaseShows: number[] = [];

    // Collect all showcase items from all user collections
    collections.forEach(c => {
        if (c.topFavoriteMovies) {
            showcaseMovies = [...showcaseMovies, ...c.topFavoriteMovies.filter(id => id !== null) as number[]];
        }
        if (c.topFavoriteShows) {
            showcaseShows = [...showcaseShows, ...c.topFavoriteShows.filter(id => id !== null) as number[]];
        }
    });

    // Remove duplicates just in case
    showcaseMovies = Array.from(new Set(showcaseMovies));
    showcaseShows = Array.from(new Set(showcaseShows));

    // We want 4 slots: Take up to 3 movies, and up to 1 show to fill 4 slots.
    // If not enough movies, fill with more shows, and vice versa.
    const selectedIds: number[] = [];

    // First, try to add up to 3 movies
    const moviesToAdd = Math.min(3, showcaseMovies.length);
    for (let i = 0; i < moviesToAdd; i++) {
        selectedIds.push(showcaseMovies[i]);
    }

    // Then, try to add shows to reach 4 total
    for (let i = 0; i < showcaseShows.length && selectedIds.length < 4; i++) {
        selectedIds.push(showcaseShows[i]);
    }

    // If we still don't have 4 and there are more movies, add them
    for (let i = moviesToAdd; i < showcaseMovies.length && selectedIds.length < 4; i++) {
        selectedIds.push(showcaseMovies[i]);
    }

    // Create a map of all known movies to look up poster URLs
    const allLoadedMovies = collections.flatMap(c => c.movies);
    const movieMap = new Map<number, Movie>();
    allLoadedMovies.forEach(m => movieMap.set(m.id, m));

    selectedIds.forEach(id => {
        const movie = movieMap.get(id);
        if (movie && movie.poster_path) {
            favoritePosters.push(`${IMAGE_BASE_URL}${movie.poster_path}`);
        }
    });

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
