
export type MediaType = 'movie' | 'tv';

export type SortOption = 
  | 'popularity.desc' 
  | 'vote_average.desc' 
  | 'primary_release_date.desc' 
  | 'primary_release_date.asc' 
  | 'vote_count.desc';

// --- Dashboard Specific Types ---
export type SortOptionType = 'added_desc' | 'added_asc' | 'date_desc' | 'date_asc' | 'rating_desc' | 'rating_asc' | 'runtime_desc' | 'runtime_asc' | 'title_asc' | 'votes_desc';
export type GroupOptionType = 'none' | 'year' | 'genre' | 'director' | 'actor' | 'runtime' | 'rating';
export type FilterStatusType = 'all' | 'rated' | 'reviewed';
// --------------------------------

// --- SOCIAL / DISCUSSION TYPES ---
export type PostCategory = 
  | 'REVIEW' 
  | 'THEORY' 
  | 'ANALYSIS' 
  | 'DETAILS' 
  | 'CHARACTER' 
  | 'CINEMATOGRAPHY' 
  | 'SCENARIO' 
  | 'ACTING' 
  | 'SOUNDTRACK'
  | 'ENDING';

// --- USER & SUBSCRIPTION TYPES ---
export type SubscriptionTier = 'BASIC' | 'PRO' | 'ADMIN';

// --- CINEMATCH TYPES ---
export interface SessionFilters {
    mediaType: MediaType;
    minRating: number;
    year: number | null; // Decade start or specific year
    duration: 'SHORT' | 'MEDIUM' | 'LONG' | 'ANY'; // <90, 90-120, >120
    genres: number[];
}

export interface MatchSession {
    id: string;
    code: string;
    host_id: string;
    guest_id?: string;
    genre_ids?: number[]; 
    status: 'WAITING' | 'ACTIVE' | 'FINISHED';
    movie_queue?: Movie[]; // JSONB stored as Movie[]
    created_at: string;
    filters?: SessionFilters; // Yeni filtreleri saklamak için (Opsiyonel JSONB)
}

export interface MatchVote {
    id: string;
    session_id: string;
    user_id: string;
    movie_id: number;
    vote_type: 'LIKE' | 'DISLIKE';
    movie_data?: Movie;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

export interface Creator {
  id: number;
  name: string;
  profile_path: string | null;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
  vote_count?: number; // EKLENDİ: Bayes hesabı için gerekli
}

export interface Movie {
  id: number;
  title?: string;
  name?: string; // For TV
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string; // For TV
  last_air_date?: string; // For TV
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  episode_run_time?: number[]; // For TV
  number_of_seasons?: number; // For TV
  number_of_episodes?: number; // For TV
  seasons?: Season[]; // For TV
  networks?: Network[]; // For TV
  status?: string;
  tagline?: string;
  credits?: Credits;
  created_by?: Creator[];
  production_countries?: ProductionCountry[];
  addedAt?: string; // Local timestamp for sorting in collection
  adult?: boolean;
}

export interface TmdbResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface GenreResponse {
  genres: Genre[];
}

export interface UserReview {
  id?: string;
  movieId: number;
  rating: number;
  comment: string;
  hasSpoiler?: boolean;
  category?: PostCategory; 
  tags?: PostCategory[]; 
  timestamp?: string; 
  sceneTime?: string; // New: E.g., "01:23"
  character?: string; // New: E.g., "Neo"
  title?: string; 
  createdAt: string;
  user_id?: string; 
  username?: string; 
  avatar_url?: string; 
  upvotes: number;  
  downvotes: number; 
  upvoted_by?: string[]; 
  downvoted_by?: string[];
  currentUserVote?: 'UP' | 'DOWN' | null; 
}

export interface Collection {
  id: string;
  name: string;
  description?: string; 
  isPublic?: boolean;   
  shareToken?: string;  
  coverImage?: string; 
  movies: Movie[]; 
  itemCount?: number; 
  topFavoriteMovies?: (number | null)[]; 
  topFavoriteShows?: (number | null)[];  
  owner?: string; 
  ownerId?: string; 
}

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
