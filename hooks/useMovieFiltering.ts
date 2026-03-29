
import { useState, useMemo } from 'react';
import { Movie, Genre, MediaType, SortOptionType, FilterStatusType, GroupOptionType } from '../types';
import { useReviewContext } from '../context/ReviewContext';

export const useMovieFiltering = (
    movies: Movie[] = [], 
    genres: Genre[] = []
) => {
    const { reviews } = useReviewContext();

    // States
    const [activeTab, setActiveTab] = useState<MediaType>('movie');
    const [currentSort, setCurrentSort] = useState<SortOptionType>('added_desc');
    const [filterGenre, setFilterGenre] = useState<number | null>(null);
    const [filterYear, setFilterYear] = useState<number | null>(null);
    const [filterMinRating, setFilterMinRating] = useState<number | null>(null);
    const [filterMinTmdbRating, setFilterMinTmdbRating] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState<FilterStatusType>('all');
    const [currentGroup, setCurrentGroup] = useState<GroupOptionType>('none');

    // 1. Filter by Media Type (Tab)
    const tabFilteredMovies = useMemo(() => {
        return movies.filter(m => {
            const isTv = !!(m.name || m.first_air_date);
            return activeTab === 'tv' ? isTv : !isTv;
        });
    }, [movies, activeTab]);

    // 2. Apply Complex Filters & Sorting
    const processedMovies = useMemo(() => {
        let result = [...tabFilteredMovies];

        // Genre Filter
        if (filterGenre) {
            result = result.filter(m => m.genre_ids?.includes(filterGenre) || m.genres?.some(g => g.id === filterGenre));
        }

        // Year Filter
        if (filterYear) {
            result = result.filter(m => {
                const date = m.release_date || m.first_air_date;
                return date ? new Date(date).getFullYear() === filterYear : false;
            });
        }

        // Min Rating Filter (User Rating)
        if (filterMinRating) {
            result = result.filter(m => {
                const userRating = reviews[m.id]?.rating;
                return userRating ? userRating >= filterMinRating : false;
            });
        }

        // Min TMDB Rating Filter
        if (filterMinTmdbRating) {
            result = result.filter(m => {
                const tmdbRating = m.vote_average;
                return tmdbRating ? tmdbRating >= filterMinTmdbRating : false;
            });
        }

        // Status Filter
        if (filterStatus === 'rated') {
            result = result.filter(m => !!reviews[m.id]?.rating);
        } else if (filterStatus === 'reviewed') {
            result = result.filter(m => !!reviews[m.id]?.comment);
        }

        // Sorting Logic
        result.sort((a, b) => {
            switch (currentSort) {
                case 'added_desc': return new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime();
                case 'added_asc': return new Date(a.addedAt || 0).getTime() - new Date(b.addedAt || 0).getTime();
                case 'date_desc': return new Date(b.release_date || b.first_air_date || 0).getTime() - new Date(a.release_date || a.first_air_date || 0).getTime();
                case 'date_asc': return new Date(a.release_date || a.first_air_date || 0).getTime() - new Date(b.release_date || b.first_air_date || 0).getTime();
                case 'rating_user_desc': return (reviews[b.id]?.rating || 0) - (reviews[a.id]?.rating || 0);
                case 'rating_user_asc': return (reviews[a.id]?.rating || 0) - (reviews[b.id]?.rating || 0);
                case 'rating_tmdb_desc': return (b.vote_average || 0) - (a.vote_average || 0);
                case 'rating_tmdb_asc': return (a.vote_average || 0) - (b.vote_average || 0);
                case 'votes_desc': return (b.vote_count || 0) - (a.vote_count || 0);
                case 'title_asc': return (a.title || a.name || '').localeCompare(b.title || b.name || '');
                case 'runtime_desc': {
                    const durA = (a.runtime || (a.episode_run_time?.[0] || 0) * (a.number_of_episodes || 0));
                    const durB = (b.runtime || (b.episode_run_time?.[0] || 0) * (b.number_of_episodes || 0));
                    return durB - durA;
                }
                case 'runtime_asc': {
                    const durA = (a.runtime || (a.episode_run_time?.[0] || 0) * (a.number_of_episodes || 0));
                    const durB = (b.runtime || (b.episode_run_time?.[0] || 0) * (b.number_of_episodes || 0));
                    return durA - durB;
                }
                default: return 0;
            }
        });

        return result;
    }, [tabFilteredMovies, filterGenre, filterYear, filterMinRating, filterMinTmdbRating, filterStatus, currentSort, reviews]);

    // 3. Grouping Logic
    const groupedMovies = useMemo<Record<string, Movie[]>>(() => {
        if (currentGroup === 'none') return { 'Tümü': processedMovies };
        
        const groups: Record<string, Movie[]> = {};
        
        processedMovies.forEach(m => {
            let key = 'Diğer';
            if (currentGroup === 'year') {
                key = (m.release_date || m.first_air_date || 'Bilinmiyor').substring(0, 4);
            } else if (currentGroup === 'rating_user') {
                const r = reviews[m.id]?.rating;
                key = r ? `${r} Puan` : 'Puanlanmamış';
            } else if (currentGroup === 'rating_tmdb') {
                const tr = m.vote_average;
                key = tr ? `${Math.floor(tr)} Puan` : 'Puanlanmamış';
            } else if (currentGroup === 'director') {
                const d = m.credits?.crew?.find(c => c.job === 'Director')?.name;
                key = d || 'Bilinmiyor';
            } else if (currentGroup === 'actor') {
                const a = m.credits?.cast?.[0]?.name;
                key = a || 'Bilinmiyor';
            }
            
            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
        });
        
        return groups;
    }, [processedMovies, currentGroup, genres, reviews]);

    return {
        activeTab, setActiveTab,
        currentSort, setCurrentSort,
        filterGenre, setFilterGenre,
        filterYear, setFilterYear,
        filterMinRating, setFilterMinRating,
        filterMinTmdbRating, setFilterMinTmdbRating,
        filterStatus, setFilterStatus,
        currentGroup, setCurrentGroup,
        tabFilteredMovies,
        processedMovies,
        groupedMovies
    };
};
