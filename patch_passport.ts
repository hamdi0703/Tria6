import fs from 'fs';

let content = fs.readFileSync('./components/PassportModal.tsx', 'utf-8');

const searchBlock = `  const [bio, setBio] = useState<string>('');
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
            favoritePosters.push(\`\${IMAGE_BASE_URL}\${movie.poster_path}\`);
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
  }, [user, collections, reviews, bio, tier]);`;

const replaceBlock = `  const [bio, setBio] = useState<string>('');
  const [tier, setTier] = useState<SubscriptionTier>('BASIC');
  const [fullMovieMap, setFullMovieMap] = useState<Map<number, Movie>>(new Map());
  const [totalWatchedCount, setTotalWatchedCount] = useState<number>(0);
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true);

  // Fetch Bio, Tier, and all user items separately since items are lazy-loaded
  useEffect(() => {
      const fetchProfileAndItems = async () => {
          if (user && !user.id.startsWith('mock-')) {
              // 1. Fetch Profile Info
              const { data: profileData } = await supabase.from('profiles').select('bio, tier').eq('id', user.id).single();
              if (profileData) {
                  setBio(profileData.bio || '');
                  setTier(profileData.tier || 'BASIC');
              }

              // 2. Fetch all collection items to get accurate unique counts and poster data for showcase
              const collectionIds = collections.map(c => c.id).filter(id => !id.startsWith('guest-'));
              if (collectionIds.length > 0) {
                  const { data: itemsData } = await supabase
                      .from('collection_items')
                      .select('movie_data')
                      .in('collection_id', collectionIds);

                  if (itemsData) {
                      const uniqueItems = new Set<number>();
                      const movieMap = new Map<number, Movie>();

                      itemsData.forEach(item => {
                          const movie = item.movie_data as Movie;
                          if (movie && movie.id) {
                              uniqueItems.add(movie.id);
                              movieMap.set(movie.id, movie);
                          }
                      });

                      setTotalWatchedCount(uniqueItems.size);
                      setFullMovieMap(movieMap);
                  }
              } else {
                  setTotalWatchedCount(0);
                  setFullMovieMap(new Map());
              }
          } else {
             // Mock/Guest user fallback
             const uniqueItems = new Set<number>();
             const movieMap = new Map<number, Movie>();
             collections.forEach(c => {
                 c.movies?.forEach(m => {
                     uniqueItems.add(m.id);
                     movieMap.set(m.id, m);
                 });
             });
             setTotalWatchedCount(uniqueItems.size);
             setFullMovieMap(movieMap);
          }
          setIsLoadingItems(false);
      };

      fetchProfileAndItems();
  }, [user, collections]);

  // --- DATA MAPPING LOGIC (Strictly mapped to schema) ---
  const passportData = useMemo(() => {
    if (!user || isLoadingItems) return null;

    // 1. Header Data
    const username = user.user_metadata?.username || 'Member';
    const avatarUrl = getAvatarUrl(user.user_metadata?.avatar_url);
    const joinDate = new Date(user.created_at || Date.now()).getFullYear().toString();

    // 2. Statistics Row
    // Column 2: "Lists Created" -> Count of collections
    const listsCreated = collections.length;

    // Column 3: "Avg Score" -> Average of ratings from reviews
    const ratings = (Object.values(reviews) as UserReview[]).map(r => r.rating).filter(r => r > 0);
    const avgScore = ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : '-';

    // 3. Showcase Section (Top Favorites)
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

    selectedIds.forEach(id => {
        const movie = fullMovieMap.get(id);
        if (movie && movie.poster_path) {
            favoritePosters.push(\`\${IMAGE_BASE_URL}\${movie.poster_path}\`);
        }
    });

    return {
        username,
        avatarUrl,
        memberSince: joinDate,
        bio,
        stats: {
            totalWatched: totalWatchedCount,
            listsCreated,
            avgScore
        },
        favorites: favoritePosters,
        tier // Pass Tier
    };
  }, [user, collections, reviews, bio, tier, fullMovieMap, totalWatchedCount, isLoadingItems]);`;

content = content.replace(searchBlock, replaceBlock);
fs.writeFileSync('./components/PassportModal.tsx', content);
