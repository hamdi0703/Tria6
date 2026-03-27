
import React from 'react';
import { Genre, SortOption, MediaType } from '../types';
import FilterDropdown from './ui/FilterDropdown';
import { LAYOUT } from '../constants/layout';

interface FilterBarProps {
  genres: Genre[];
  selectedGenre: number | null;
  onSelectGenre: (id: number | null) => void;
  selectedYear: number | null;
  onSelectYear: (year: number | null) => void;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  disabled: boolean;
  onOpenGameHub?: () => void;
  // NEW PROPS
  mediaType: MediaType;
  onMediaTypeChange: (type: MediaType) => void;
  isMultiSelect: boolean;
  onToggleMultiSelect: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  genres,
  selectedGenre,
  onSelectGenre,
  selectedYear,
  onSelectYear,
  currentSort,
  onSortChange,
  disabled,
  onOpenGameHub,
  mediaType,
  onMediaTypeChange,
  isMultiSelect,
  onToggleMultiSelect
}) => {
  if (disabled) return null;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1959 }, (_, i) => currentYear - i);

  // --- OPTIONS ---
  const genreOptions = [
      { label: 'Tüm Türler', value: null },
      ...(genres || []).map(g => ({ label: g.name, value: g.id }))
  ];

  const yearOptions = [
      { label: 'Tüm Yıllar', value: null },
      ...years.map(y => ({ label: y.toString(), value: y }))
  ];

  const sortOptions = [
      { label: 'Popülerlik', value: 'popularity.desc' },
      { label: 'Puan (Yüksek)', value: 'vote_average.desc' },
      { label: 'En Yeni', value: 'primary_release_date.desc' },
      { label: 'En Eski', value: 'primary_release_date.asc' },
  ];

  return (
    <div className="flex flex-col mb-4 animate-fade-in relative z-40">

      {/* 1. Header & Controls */}
      <div className="mb-4 px-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tighter">
                  Keşfet
              </h2>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                  Kriterlerinize uygun yapımları bulun.
              </p>
          </div>

          {/* MEDIA TYPE TOGGLE (Integrated Here) */}
          <div className="bg-neutral-200 dark:bg-neutral-800 p-1 rounded-xl flex self-start md:self-auto">
              <button 
                  onClick={() => onMediaTypeChange('movie')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mediaType === 'movie' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'}`}
              >
                  Filmler
              </button>
              <button 
                  onClick={() => onMediaTypeChange('tv')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mediaType === 'tv' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'}`}
              >
                  Diziler
              </button>
          </div>
      </div>

      {/* 2. Sticky Controls Section */}
      <div 
        className={`sticky z-30 py-3 -mx-4 px-4 md:mx-0 md:px-0 bg-vista-light/95 dark:bg-black/95 backdrop-blur-xl border-y border-neutral-200/50 dark:border-neutral-800/50 md:border-y-0 md:border-b md:bg-transparent md:backdrop-blur-none transition-all shadow-sm md:shadow-none top-[${LAYOUT.FILTER_BAR_STICKY_MOBILE}] md:top-[${LAYOUT.FILTER_BAR_STICKY_DESKTOP}]`}
      >
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 w-full justify-between">

            {/* LEFT ACTIONS: Game Hub & Multi-Select */}
            <div className="flex gap-2 w-full xl:w-auto overflow-x-auto no-scrollbar">
                <button
                    onClick={onOpenGameHub}
                    className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border border-transparent bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800 group"
                >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="hidden sm:inline">Oyun Alanı</span>
                </button>

                <button
                    onClick={onToggleMultiSelect}
                    className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${
                        isMultiSelect 
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-indigo-500'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{isMultiSelect ? 'Seçim Modu Açık' : 'Çoklu Seçim'}</span>
                </button>
            </div>

            {/* RIGHT ACTIONS: Filters */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full xl:w-auto">
                {/* GENRE */}
                <FilterDropdown
                    className="col-span-2 sm:w-auto"
                    label="Tür Seçin"
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                    value={selectedGenre}
                    options={genreOptions}
                    onChange={onSelectGenre}
                    activeColor="bg-pink-600 text-white shadow-pink-500/30 shadow-lg"
                />

                {/* YEAR */}
                <FilterDropdown
                    className="col-span-1 sm:w-auto"
                    label="Yıl"
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    value={selectedYear}
                    options={yearOptions}
                    onChange={onSelectYear}
                    activeColor="bg-indigo-600 text-white shadow-indigo-500/30 shadow-lg"
                />

                {/* SORT */}
                <FilterDropdown
                    className="col-span-1 sm:w-auto"
                    label="Sıralama"
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>}
                    value={currentSort}
                    options={sortOptions}
                    onChange={onSortChange}
                    align="right"
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
