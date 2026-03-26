
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { TmdbService } from '../services/tmdbService';
import { MediaType, SortOption } from '../types';

const tmdb = new TmdbService();

// --- INFINITE SCROLL HOOK (ExploreView) ---
export const useDiscoverInfinite = (
  searchQuery: string,
  mediaType: MediaType,
  sortBy: SortOption,
  genreId: number | null,
  year: number | null
) => {
  return useInfiniteQuery({
    queryKey: ['discover', searchQuery, mediaType, sortBy, genreId, year],
    queryFn: async ({ pageParam = 1 }) => {
      // Search Logic
      if (searchQuery) {
        const response = await tmdb.searchMovies(searchQuery, pageParam, mediaType, year || undefined);
        // Client-side filtering for Search (API limitation on search + filters)
        let results = response.results;
        
        if (genreId) {
           results = results.filter(m => m.genre_ids?.includes(genreId));
        }
        
        // Client-side Sort for Search
        results.sort((a, b) => {
            if (sortBy === 'vote_average.desc') return b.vote_average - a.vote_average;
            if (sortBy === 'primary_release_date.desc') {
                const dateA = a.release_date || a.first_air_date || '';
                const dateB = b.release_date || b.first_air_date || '';
                return dateB.localeCompare(dateA);
            }
            if (sortBy === 'primary_release_date.asc') {
                const dateA = a.release_date || a.first_air_date || '';
                const dateB = b.release_date || b.first_air_date || '';
                return dateA.localeCompare(dateB);
            }
            return 0; // Default popularity handled by API usually
        });
        
        return { ...response, results };
      } 
      
      // Discover Logic
      else {
        return await tmdb.discoverMovies(
          pageParam,
          sortBy,
          genreId || undefined,
          year || undefined,
          mediaType
        );
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new filter to prevent flicker
  });
};

// --- MOVIE DETAIL HOOK ---
export const useMovieDetail = (id: number, type: MediaType) => {
  return useQuery({
    queryKey: ['movieDetail', id, type],
    queryFn: async () => {
      try {
        return await tmdb.getMovieDetail(id, type);
      } catch (e) {
        // Fallback: Try other media type if first fails (e.g. ID mismatch)
        const altType = type === 'movie' ? 'tv' : 'movie';
        return await tmdb.getMovieDetail(id, altType);
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 min cache for details
  });
};
