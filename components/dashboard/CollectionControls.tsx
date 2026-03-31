
import React from 'react';
import { Genre, SortOptionType, GroupOptionType, FilterStatusType } from '../../types';
import FilterDropdown from '../ui/FilterDropdown';

interface CollectionControlsProps {
  genres: Genre[];
  
  // Sorting
  currentSort: SortOptionType;
  onSortChange: (opt: SortOptionType) => void;
  
  // Filtering
  filterGenre: number | null;
  onFilterGenreChange: (id: number | null) => void;
  filterYear: number | null;
  onFilterYearChange: (year: number | null) => void;
  filterMinRating: number | null;
  onFilterMinRatingChange: (rating: number | null) => void;
  filterMinTmdbRating: number | null;
  onFilterMinTmdbRatingChange: (rating: number | null) => void;
  
  filterStatus: FilterStatusType;
  onFilterStatusChange: (status: FilterStatusType) => void;

  // Grouping
  currentGroup: GroupOptionType;
  onGroupChange: (opt: GroupOptionType) => void;
  
  resultCount: number;

  // View Mode
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

const CollectionControls: React.FC<CollectionControlsProps> = ({
  genres,
  currentSort,
  onSortChange,
  filterGenre,
  onFilterGenreChange,
  filterYear,
  onFilterYearChange,
  filterMinRating,
  onFilterMinRatingChange,
  filterMinTmdbRating,
  onFilterMinTmdbRatingChange,
  filterStatus,
  onFilterStatusChange,
  currentGroup,
  onGroupChange,
  resultCount,
  viewMode = 'grid',
  onViewModeChange
}) => {
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1959 }, (_, i) => currentYear - i);

  // --- OPTIONS ---
  const sortOptions = [
    { label: 'Eklenme (Yeni → Eski)', value: 'added_desc' },
    { label: 'Eklenme (Eski → Yeni)', value: 'added_asc' },
    { label: 'Tarih (Yeni → Eski)', value: 'date_desc' },
    { label: 'Tarih (Eski → Yeni)', value: 'date_asc' },
    { label: 'Senin Puanın (Yüksek → Düşük)', value: 'rating_user_desc' },
    { label: 'Senin Puanın (Düşük → Yüksek)', value: 'rating_user_asc' },
    { label: 'Genel Puan (Yüksek → Düşük)', value: 'rating_tmdb_desc' },
    { label: 'Genel Puan (Düşük → Yüksek)', value: 'rating_tmdb_asc' },
    { label: 'Popülerlik', value: 'votes_desc' },
    { label: 'Süre (Uzun → Kısa)', value: 'runtime_desc' },
    { label: 'Süre (Kısa → Uzun)', value: 'runtime_asc' },
    { label: 'İsim (A → Z)', value: 'title_asc' },
  ];

  const groupOptions = [
    { label: 'Gruplama Yok', value: 'none' },
    { label: 'Yıl', value: 'year' },
    { label: 'Yönetmen', value: 'director' },
    { label: 'Başrol', value: 'actor' },
    { label: 'Süre', value: 'runtime' },
    { label: 'Senin Puanın', value: 'rating_user' },
    { label: 'Genel Puan', value: 'rating_tmdb' },
  ];

  const statusOptions = [
    { label: 'Tümü', value: 'all' },
    { label: 'Puanladıklarım', value: 'rated' },
    { label: 'İnceleme Yazdıklarım', value: 'reviewed' },
  ];

  const ratingOptions = [
      { label: 'Tümü', value: null },
      { label: '9+ Puan', value: 9 },
      { label: '8+ Puan', value: 8 },
      { label: '7+ Puan', value: 7 },
      { label: '6+ Puan', value: 6 },
  ];

  const genreOptions = [
      { label: 'Tümü', value: null },
      ...(genres || []).map(g => ({ label: g.name, value: g.id }))
  ];

  const yearOptions = [
      { label: 'Tümü', value: null },
      ...years.map(y => ({ label: y.toString(), value: y }))
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 mb-8 shadow-sm flex flex-col gap-6 transition-all hover:shadow-md">
      
      {/* SECTION 1: View Settings (Sort & Group) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* SORT */}
            <FilterDropdown
                label="Sıralama"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>}
                value={currentSort}
                options={sortOptions}
                onChange={onSortChange}
            />

            {/* GROUP */}
            <FilterDropdown
                label="Gruplama"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>}
                value={currentGroup}
                options={groupOptions}
                onChange={onGroupChange}
                activeColor="bg-emerald-500 text-white shadow-emerald-500/30 shadow-lg"
            />
        </div>

        <div className="flex items-center gap-4 self-start lg:self-center">
            {/* View Toggles */}
            {onViewModeChange && (
                <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`p-1.5 rounded-lg transition-all ${
                            viewMode === 'grid'
                                ? 'bg-white dark:bg-neutral-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                        }`}
                        title="Izgara Görünümü"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`p-1.5 rounded-lg transition-all ${
                            viewMode === 'list'
                                ? 'bg-white dark:bg-neutral-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                        }`}
                        title="Liste Görünümü"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Count Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                    {resultCount} Sonuç
                </span>
            </div>
        </div>
      </div>

      <div className="h-px bg-neutral-100 dark:bg-neutral-800 w-full" />

      {/* SECTION 2: Advanced Filters */}
      <div className="flex flex-col gap-3">
          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Filtreleme Seçenekleri</h4>
          
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Status */}
            <FilterDropdown
                label="Durum"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                value={filterStatus}
                options={statusOptions}
                onChange={onFilterStatusChange}
                activeColor="bg-purple-500 text-white shadow-purple-500/30 shadow-lg"
            />

            {/* Genre */}
            <FilterDropdown
                label="Tür"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                value={filterGenre}
                options={genreOptions}
                onChange={onFilterGenreChange}
                activeColor="bg-indigo-600 text-white shadow-indigo-500/30 shadow-lg"
            />

            {/* Year */}
            <FilterDropdown
                label="Yıl"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                value={filterYear}
                options={yearOptions}
                onChange={onFilterYearChange}
                activeColor="bg-blue-500 text-white shadow-blue-500/30 shadow-lg"
            />

            {/* TMDB Rating */}
            <FilterDropdown
                label="Genel Puan"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
                value={filterMinTmdbRating}
                options={ratingOptions}
                onChange={onFilterMinTmdbRatingChange}
                activeColor="bg-yellow-500 text-white shadow-yellow-500/30 shadow-lg"
            />

            {/* User Rating */}
            <FilterDropdown
                label="Senin Puanın"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
                value={filterMinRating}
                options={ratingOptions}
                onChange={onFilterMinRatingChange}
                activeColor="bg-amber-500 text-white shadow-amber-500/30 shadow-lg"
            />
          </div>
      </div>

    </div>
  );
};

export default CollectionControls;
