/// <reference types="vite/client" />
import { TmdbResponse, GenreResponse, SortOption, Movie, MediaType } from '../types';

// SYSTEM CONFIGURATION
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const CARD_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; 
export const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
const BASE_URL = 'https://api.themoviedb.org/3';

// Güvenli API Anahtarı Erişimi
const getApiKey = () => {
  // Fix: Added reference to vite/client to resolve import.meta.env error
  const key = import.meta.env.VITE_TMDB_API_KEY;
  if (!key) {
      console.error("VITE_TMDB_API_KEY bulunamadı. Lütfen .env dosyasını oluşturun.");
      return '';
  }
  return key;
};

const SYSTEM_API_KEY = getApiKey();

// Fallback Genres (In case API fails)
const FALLBACK_GENRES = [
  { id: 28, name: "Aksiyon" }, { id: 12, name: "Macera" }, { id: 16, name: "Animasyon" },
  { id: 35, name: "Komedi" }, { id: 80, name: "Suç" }, { id: 99, name: "Belgesel" },
  { id: 18, name: "Dram" }, { id: 10751, name: "Aile" }, { id: 14, name: "Fantastik" },
  { id: 36, name: "Tarih" }, { id: 27, name: "Korku" }, { id: 10402, name: "Müzik" },
  { id: 9648, name: "Gizem" }, { id: 10749, name: "Romantik" }, { id: 878, name: "Bilim Kurgu" },
  { id: 10770, name: "TV Movie" }, { id: 53, name: "Gerilim" }, { id: 10752, name: "Savaş" },
  { id: 37, name: "Western" }
];

interface DiscoverOptions {
    page?: number;
    sortBy?: SortOption;
    genreId?: number | number[];
    year?: number;
    type?: MediaType;
    minVoteCount?: number;
    minRating?: number;
    runtimeMin?: number;
    runtimeMax?: number;
}

export class TmdbService {
  
  constructor() {
    if (!SYSTEM_API_KEY) {
        // Silent fail constructor, actual calls will log errors
    }
  }

  // Helper: Sleep function
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchFromApi<T>(endpoint: string, params: Record<string, string> = {}, retries = 3, backoff = 1000): Promise<T> {
    if (!SYSTEM_API_KEY) {
        throw new Error("API Key Missing");
    }

    const queryParams = new URLSearchParams({
      api_key: SYSTEM_API_KEY,
      language: 'tr-TR',
      include_adult: 'false',
      ...params,
    });

    const url = `${BASE_URL}${endpoint}?${queryParams.toString()}`;

    try {
      const response = await fetch(url);

      // Handle Rate Limiting (429)
      if (response.status === 429) {
        if (retries > 0) {
          console.warn(`TMDB Rate Limit Hit. Retrying in ${backoff}ms... (${retries} attempts left)`);
          await this.delay(backoff);
          return this.fetchFromApi<T>(endpoint, params, retries - 1, backoff * 2);
        } else {
          throw new Error("API Rate Limit Exceeded.");
        }
      }

      if (!response.ok) {
        // Retry 5xx Server Errors (Transient issues)
        if (response.status >= 500 && retries > 0) {
             console.warn(`TMDB Server Error (${response.status}). Retrying...`);
             await this.delay(backoff);
             return this.fetchFromApi<T>(endpoint, params, retries - 1, backoff * 2);
        }
        throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error: any) {
        // Handle "Failed to fetch" (Network Error)
        if ((error.message === 'Failed to fetch' || error.message.includes('NetworkError')) && retries > 0) {
             console.warn(`Network error. Retrying... (${retries} left)`);
             await this.delay(backoff);
             return this.fetchFromApi<T>(endpoint, params, retries - 1, backoff * 2);
        }
        
        // Critical Failure: Return empty structure instead of crashing if possible
        console.error(`TMDB Request Failed [${endpoint}]:`, error);
        
        // Return safe defaults for common list structures to prevent app crash
        if (endpoint.includes('/list') || endpoint.includes('/discover') || endpoint.includes('/search') || endpoint.includes('/trending')) {
            return { results: [], page: 1, total_pages: 0, total_results: 0 } as any;
        }
        
        throw error;
    }
  }

  async getTrending(page: number = 1): Promise<TmdbResponse> {
    return this.fetchFromApi<TmdbResponse>('/trending/movie/week', { page: page.toString() });
  }

  async searchMovies(query: string, page: number = 1, type: MediaType = 'movie', year?: number): Promise<TmdbResponse> {
    const params: Record<string, string> = {
      query: query,
      page: page.toString()
    };

    if (year) {
      if (type === 'movie') {
        params['primary_release_year'] = year.toString();
      } else {
        params['first_air_date_year'] = year.toString();
      }
    }

    return this.fetchFromApi<TmdbResponse>(`/search/${type}`, params);
  }

  async getGenres(type: MediaType = 'movie'): Promise<GenreResponse> {
    try {
        return await this.fetchFromApi<GenreResponse>(`/genre/${type}/list`);
    } catch (e) {
        console.warn("Using fallback genres");
        return { genres: FALLBACK_GENRES };
    }
  }

  // UPDATED DISCOVER METHOD
  async discoverMovies(
    page: number = 1, 
    sortBy: SortOption = 'popularity.desc', 
    genreId?: number | number[],
    year?: number,
    type: MediaType = 'movie',
    decade?: number,
    minVoteCount: number = 100,
    // New Options Object for advanced filtering
    options?: {
        minRating?: number;
        runtimeMin?: number;
        runtimeMax?: number;
    }
  ): Promise<TmdbResponse> {
    const params: Record<string, string> = {
      page: page.toString(),
      sort_by: sortBy,
      'vote_count.gte': minVoteCount.toString(), 
    };

    if (genreId) {
        // If array, join with pipe (|) for OR logic in TMDB
        params['with_genres'] = Array.isArray(genreId) ? genreId.join('|') : genreId.toString();
    }

    // Single Year Filter
    if (year) {
      if (type === 'movie') {
        params['primary_release_year'] = year.toString();
      } else {
        params['first_air_date_year'] = year.toString();
      }
    }

    // Decade Filter
    if (decade) {
        if (type === 'movie') {
            params['primary_release_date.gte'] = `${decade}-01-01`;
            params['primary_release_date.lte'] = `${decade + 9}-12-31`;
        } else {
            params['first_air_date.gte'] = `${decade}-01-01`;
            params['first_air_date.lte'] = `${decade + 9}-12-31`;
        }
    }

    // New Advanced Filters
    if (options) {
        if (options.minRating) params['vote_average.gte'] = options.minRating.toString();
        if (options.runtimeMin) params['with_runtime.gte'] = options.runtimeMin.toString();
        if (options.runtimeMax) params['with_runtime.lte'] = options.runtimeMax.toString();
    }

    return this.fetchFromApi<TmdbResponse>(`/discover/${type}`, params);
  }

  async getRecommendations(id: number, type: MediaType = 'movie'): Promise<TmdbResponse> {
      return this.fetchFromApi<TmdbResponse>(`/${type}/${id}/recommendations`);
  }

  async getMovieDetail(id: number, type: MediaType = 'movie'): Promise<Movie> {
    return this.fetchFromApi<Movie>(`/${type}/${id}`, {
      append_to_response: 'credits'
    });
  }

  // --- ROULETTE LOGIC ---
  async getRouletteMovies(
    type: MediaType,
    genreId: number | null,
    minRating: number | null,
    minVoteCount: number = 50 
  ): Promise<Movie[]> {
    const params: Record<string, string> = {
        sort_by: 'popularity.desc',
        'vote_count.gte': minVoteCount.toString(), 
        include_adult: 'false'
    };

    if (genreId) params['with_genres'] = genreId.toString();
    if (minRating) params['vote_average.gte'] = minRating.toString();

    try {
        const initialData = await this.fetchFromApi<TmdbResponse>(`/discover/${type}`, {
            ...params,
            page: '1'
        });

        if (initialData.total_results === 0) return [];

        const totalPages = initialData.total_pages;
        // TMDB API Limit
        const maxPageLimit = Math.min(totalPages, 500); 
        const randomPage = Math.floor(Math.random() * maxPageLimit) + 1;

        if (randomPage === 1) {
             return initialData.results.sort(() => 0.5 - Math.random());
        }

        const randomData = await this.fetchFromApi<TmdbResponse>(`/discover/${type}`, {
            ...params,
            page: randomPage.toString()
        });

        return randomData.results.sort(() => 0.5 - Math.random());

    } catch (e) {
        console.error("Roulette Fetch Error:", e);
        return [];
    }
  }
}
