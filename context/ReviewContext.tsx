
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserReview } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabaseClient';

const STORAGE_KEY = 'tria_user_reviews';

interface ReviewContextType {
  reviews: Record<number, UserReview>;
  addReview: (review: UserReview) => Promise<void>;
  removeReview: (movieId: number) => Promise<void>;
  getReview: (movieId: number) => UserReview | undefined;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<Record<number, UserReview>>({});
  const { user } = useAuth();

  // Load reviews: Hybrid Strategy (Supabase if logged in, LocalStorage if not)
  useEffect(() => {
    const loadFromLocal = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setReviews(JSON.parse(stored));
        } else {
          setReviews({});
        }
      } catch (error) {
        console.error("Failed to load local reviews", error);
      }
    };

    const loadReviews = async () => {
      if (user) {
        // Check if it is a mock user (Admin)
        if (user.id.startsWith('mock-')) {
            loadFromLocal();
            return;
        }

        // Authenticated Load
        try {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', user.id);
          
          if (error) throw error;
          
          if (data) {
            const mapped: Record<number, UserReview> = {};
            data.forEach((r: any) => {
              mapped[r.movie_id] = {
                id: r.id, // ID'yi de sakla
                movieId: r.movie_id,
                rating: r.rating,
                comment: r.comment,
                hasSpoiler: r.has_spoiler,
                createdAt: r.created_at,
                upvotes: r.upvotes || 0,
                downvotes: r.downvotes || 0,
                tags: r.tags || [],
                category: r.category
              };
            });
            setReviews(mapped);
          }
        } catch (err) {
          console.warn('Supabase sync failed, check connection.');
        }
      } else {
        // Guest Load
        loadFromLocal();
      }
    };

    loadReviews();
  }, [user]);

  // Sync to LocalStorage (Backup for offline capability or Guest mode)
  useEffect(() => {
    if (!user || user.id.startsWith('mock-')) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    }
  }, [reviews, user]);

  const addReview = useCallback(async (review: UserReview) => {
    // 1. Optimistic Update (Immediate UI feedback for Context Consumers)
    // Bu, veritabanı yazma işleminden bağımsız olarak UI'ın güncel kalmasını sağlar.
    setReviews(prev => ({
      ...prev,
      [review.movieId]: review
    }));

    // Not: Gerçek DB yazma işlemi genelde ReviewSection içinde React Query mutation ile yapılır.
    // Ancak burası, Context'i kullanan diğer bileşenlerin (örn: Profil sayfası) anında güncellenmesi için kritiktir.
  }, []);

  const removeReview = useCallback(async (movieId: number) => {
    // 1. Optimistic Update
    setReviews(prev => {
      const newState = { ...prev };
      delete newState[movieId];
      return newState;
    });
  }, []);

  const getReview = useCallback((movieId: number) => {
    return reviews[movieId];
  }, [reviews]);

  return (
    <ReviewContext.Provider value={{ reviews, addReview, removeReview, getReview }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviewContext = () => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviewContext must be used within a ReviewProvider');
  }
  return context;
};
