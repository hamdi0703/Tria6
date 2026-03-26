import { useMemo } from 'react';
import { Movie, Genre } from '../types';
import { useTheme } from '../context/ThemeContext';

export const useCollectionStats = (movies: Movie[], genres: Genre[]) => {
  const { theme } = useTheme();

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    if (!movies || movies.length === 0) return null;

    let totalMinutes = 0;
    let totalEpisodes = 0;
    let totalRating = 0;
    let ratedCount = 0;
    let topRatedCount = 0; 
    
    const isTvContext = movies.some(m => !!(m.name || m.first_air_date));

    const genreCounts: Record<number, number> = {};
    const decadeCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const actorCounts: Record<number, { id: number; name: string; count: number; image: string | null }> = {};
    const directorCounts: Record<number, { id: number; name: string; count: number; image: string | null }> = {};

    movies.forEach(m => {
        // KPI
        const isTv = !!(m.name || m.first_air_date);
        let duration = 0;
        if (isTv) {
            const epLen = (Array.isArray(m.episode_run_time) && m.episode_run_time.length > 0) ? m.episode_run_time[0] : (m.runtime || 45); 
            duration = (m.number_of_episodes || 1) * epLen;
            totalEpisodes += (m.number_of_episodes || 0);
        } else {
            duration = m.runtime || 0;
        }
        totalMinutes += duration;

        if (typeof m.vote_average === 'number' && m.vote_average > 0) {
            totalRating += m.vote_average;
            ratedCount++;
            if (m.vote_average >= 8) topRatedCount++;
        }

        // Genres
        const ids = m.genre_ids || m.genres?.map(g => g.id) || [];
        ids.forEach(id => { if (id) genreCounts[id] = (genreCounts[id] || 0) + 1; });

        // Decades
        const dateString = m.release_date || m.first_air_date;
        if (dateString) {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const decade = Math.floor(year / 10) * 10;
                decadeCounts[`${decade}`] = (decadeCounts[`${decade}`] || 0) + 1;
            }
        }

        // Countries
        if (Array.isArray(m.production_countries)) {
            m.production_countries.forEach(c => {
                 if (c?.iso_3166_1) {
                     countryCounts[c.iso_3166_1] = (countryCounts[c.iso_3166_1] || 0) + 1;
                 }
            });
        }

        // Cast & Crew (Filtered for "Known" entities only - must have image)
        const castList = m.credits?.cast || [];
        castList.slice(0, 5).forEach(actor => { 
            // CLEANING: Only count actors with a profile picture (removes extras/unknowns)
            if (actor?.id && actor.profile_path) {
                if (!actorCounts[actor.id]) actorCounts[actor.id] = { id: actor.id, name: actor.name, count: 0, image: actor.profile_path };
                actorCounts[actor.id].count += 1;
            }
        });

        const crewList = m.credits?.crew || [];
        const creatorsList = m.created_by || [];
        
        crewList.filter(c => c.job === 'Director').forEach(d => {
            // CLEANING: Directors usually need an image too to be "Dashboard worthy"
            if (d?.id && d.profile_path) {
                if (!directorCounts[d.id]) directorCounts[d.id] = { id: d.id, name: d.name, count: 0, image: d.profile_path };
                directorCounts[d.id].count += 1;
            }
        });
        creatorsList.forEach(creator => {
            if (creator?.id && creator.profile_path) {
                if (!directorCounts[creator.id]) directorCounts[creator.id] = { id: creator.id, name: creator.name, count: 0, image: creator.profile_path };
                directorCounts[creator.id].count += 1;
            }
        });
    });

    const avgRating = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : '-';
    const totalHours = Math.floor(totalMinutes / 60);
    const uniqueGenres = Object.keys(genreCounts).length;
    const uniqueCountries = Object.keys(countryCounts).length;

    // ListWidget Data Mapping
    const sortedActors = Object.values(actorCounts).sort((a,b) => b.count - a.count).map(a => ({ ...a, label: a.name })); 
    const sortedDirectors = Object.values(directorCounts).sort((a,b) => b.count - a.count).map(d => ({ ...d, label: d.name })); 

    // Region Names
    const regionNames = new Intl.DisplayNames(['tr'], { type: 'region' });
    const sortedCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([code, count]) => {
            let label = code;
            try { label = regionNames.of(code) || code; } catch(e) {}
            return {
                id: code,
                label: label,
                count: count,
                image: `https://flagcdn.com/w80/${code.toLowerCase()}.png`, 
                isFlag: true 
            };
        });

    const sortedDecades = Object.entries(decadeCounts)
        .sort((a, b) => b[0].localeCompare(a[0])) 
        .map(([decade, count]) => ({
            id: decade,
            label: `${decade}'ler`,
            count: count,
            image: null 
        }));

    return {
        totalCount: movies.length,
        totalHours,
        totalEpisodes,
        isTvContext,
        avgRating,
        topRatedCount,
        uniqueGenres,
        uniqueCountries,
        genreCounts,
        actorCounts: sortedActors,
        directorCounts: sortedDirectors,
        countryCounts: sortedCountries,
        decadeCounts: sortedDecades
    };
  }, [movies]);

  // --- CHART DATA PREPARATION ---
  const chartData = useMemo(() => {
      if (!stats) return null;

      // 1. Map IDs to Names & Aggregate duplicate names (Fixes "Bilinmiyor" duplication)
      // ID yerine İsim bazlı toplama yapıyoruz.
      const nameCounts: Record<string, number> = {};
      
      Object.entries(stats.genreCounts).forEach(([idStr, count]) => {
          const id = parseInt(idStr);
          const genreObj = genres.find(g => g.id === id);
          // Eğer tür ismi bulunamazsa veya boşsa 'Diğer' olarak işaretle
          const name = genreObj && genreObj.name ? genreObj.name : 'Diğer'; 
          
          nameCounts[name] = (nameCounts[name] || 0) + (count as number);
      });

      // 2. Sort by Count
      const sortedGenres: [string, number][] = Object.entries(nameCounts).sort((a, b) => b[1] - a[1]);
      
      let finalGenreLabels: string[] = [];
      let finalGenreValues: number[] = [];

      // 3. Limit to Top 8 + Others (Updated from 5)
      const LIMIT = 8;
      
      if (sortedGenres.length > LIMIT) {
          const topItems = sortedGenres.slice(0, LIMIT);
          const others = sortedGenres.slice(LIMIT);
          
          finalGenreLabels = topItems.map(([name]) => name);
          finalGenreValues = topItems.map(([_, count]) => count);

          // Correct typing for reduce - Fixes TS error here
          const otherCount = others.reduce<number>((acc, curr) => acc + curr[1], 0);
          
          if (otherCount > 0) {
              finalGenreLabels.push('Diğer');
              finalGenreValues.push(otherCount);
          }
      } else {
          finalGenreLabels = sortedGenres.map(([name]) => name);
          finalGenreValues = sortedGenres.map(([_, count]) => count);
      }
      
      return {
          genreData: {
              labels: finalGenreLabels,
              datasets: [{
                  data: finalGenreValues,
                  backgroundColor: [
                      '#4f46e5', // Indigo
                      '#ec4899', // Pink
                      '#f59e0b', // Amber
                      '#10b981', // Emerald
                      '#8b5cf6', // Violet
                      '#06b6d4', // Cyan
                      '#f43f5e', // Rose
                      '#3b82f6', // Blue
                      '#64748b', // Slate (For Others or 9th)
                  ],
                  hoverOffset: 4,
                  borderWidth: 0,
              }]
          }
      };
  }, [stats, genres]);

  return { stats, chartData, theme };
};