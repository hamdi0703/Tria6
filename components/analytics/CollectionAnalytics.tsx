
import React, { useMemo, useState, useRef } from 'react';
import { Movie, Genre } from '../../types';
import { IMAGE_BASE_URL } from '../../services/tmdbService';
import { useCollectionStats } from '../../hooks/useCollectionStats';

// Chart.js Imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  TooltipItem
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS Components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement
);

interface CollectionAnalyticsProps {
  movies: Movie[];
  genres: Genre[];
}

// --- SUB-COMPONENT: LIST WIDGET ---
interface ListWidgetProps {
  title: string;
  iconColor: string; 
  items: { id: string | number; label: string; count: number; image?: string | null; subtext?: string; isFlag?: boolean }[];
  emptyMessage: string;
}

const ListWidget: React.FC<ListWidgetProps> = ({ title, iconColor, items, emptyMessage }) => {
  const [expanded, setExpanded] = useState(false);
  const limit = expanded ? 10 : 5;
  const visibleItems = items.slice(0, limit);
  const hasMore = items.length > 5;

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
        <span className={`w-2 h-2 rounded-full ${iconColor}`}></span>
        {title}
      </h3>
      
      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {visibleItems.length > 0 ? (
          visibleItems.map((item, idx) => (
            <div 
                key={`${item.id}-${idx}`} 
                className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-neutral-100 dark:border-neutral-700 shadow-sm flex items-center justify-center ${!item.image ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-white'}`}>
                {item.image ? (
                    <img 
                    src={item.isFlag ? item.image : `${IMAGE_BASE_URL}${item.image}`} 
                    alt={item.label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    />
                ) : (
                    <div className="text-[10px] font-bold text-neutral-400">
                    {item.label.replace(/[^0-9]/g, '').slice(0,2) || item.label.charAt(0)}
                    </div>
                )}
                </div>
                
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.label}
                    </span>
                    {item.subtext && <span className="text-[9px] text-neutral-400 truncate">{item.subtext}</span>}
                </div>
              </div>

              <span className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md min-w-[24px] text-center">
                {item.count}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-neutral-400 text-center py-8 opacity-60 italic">{emptyMessage}</p>
        )}
      </div>

      {hasMore && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[9px] font-bold text-neutral-400 hover:text-indigo-500 flex items-center justify-center gap-1 transition-colors uppercase tracking-wide"
        >
          {expanded ? 'Daha Az' : 'Tümü'}
        </button>
      )}
    </div>
  );
};

const CollectionAnalytics: React.FC<CollectionAnalyticsProps> = ({ movies, genres }) => {
  // Use Custom Hook for Logic
  const { stats, chartData, theme } = useCollectionStats(movies, genres);
  
  // UI State for Drag & Drop
  const [layoutOrder, setLayoutOrder] = useState<string[]>([
      'kpi', 
      'genre', 
      'timeline', 'country', 'directors', 'actors'
  ]);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // --- CHART OPTIONS ---
  const commonOptions = useMemo(() => {
      const isDark = theme === 'dark';
      return {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: { display: false },
              tooltip: {
                  backgroundColor: isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)',
                  titleColor: isDark ? '#fff' : '#000',
                  bodyColor: isDark ? '#ccc' : '#444',
                  titleFont: { family: 'Poppins', size: 12, weight: 'bold' as const },
                  bodyFont: { family: 'Poppins', size: 11 },
                  padding: 10,
                  cornerRadius: 8,
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  borderWidth: 1,
                  displayColors: true,
                  boxPadding: 4,
                  callbacks: {
                      label: (context: TooltipItem<any>) => ` ${context.label}: ${context.formattedValue} Yapım`
                  }
              }
          },
          elements: {
              arc: { borderWidth: 0 }
          }
      };
  }, [theme]);

  // --- DRAG HANDLERS ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    e.currentTarget.classList.add('opacity-50');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
    e.preventDefault();
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
    if (dragItem.current !== null && dragOverItem.current !== null) {
        const copyListItems = [...layoutOrder];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setLayoutOrder(copyListItems);
    }
  };

  // --- RENDER WIDGETS ---
  const renderWidget = (key: string) => {
      if (!stats || !chartData) return null;

      switch(key) {
          case 'kpi':
              return (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
                    {/* Library Volume */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Kütüphane</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-neutral-900 dark:text-white">{stats.totalCount}</span>
                                <span className="text-[10px] text-neutral-500 font-medium">yapım</span>
                            </div>
                        </div>
                    </div>
                    {/* Time/Episodes */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{stats.isTvContext ? 'Toplam Bölüm' : 'Toplam Süre'}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-neutral-900 dark:text-white">
                                    {stats.isTvContext ? stats.totalEpisodes : stats.totalHours}
                                </span>
                                <span className="text-[10px] text-neutral-500 font-medium">{stats.isTvContext ? 'bölüm' : 'saat'}</span>
                            </div>
                        </div>
                    </div>
                    {/* Rating */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Kalite</span>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-neutral-900 dark:text-white">{stats.avgRating}</span>
                            </div>
                        </div>
                    </div>
                    {/* Diversity */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Dünya</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-neutral-900 dark:text-white">{stats.uniqueCountries}</span>
                                <span className="text-[10px] text-neutral-500 font-medium">ülke</span>
                            </div>
                        </div>
                    </div>
                </div>
              );
          case 'genre':
              return (
                <div className="h-full flex flex-col md:flex-row items-center gap-8 px-4 py-2">
                    <div className="flex-1 flex flex-col justify-center min-w-[180px]">
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                            Tür Dağılımı
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">
                            En baskın türünüz: <strong className="text-neutral-900 dark:text-white">{chartData.genreData.labels[0]}</strong>.
                        </p>
                        
                        {/* Sayılı Liste (Geliştirilmiş UX) - Artık tür adı ve sayısı yan yana - 8 Öğe Gösteriliyor */}
                        <div className="flex flex-col gap-2">
                            {chartData.genreData.labels.slice(0, 8).map((label, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: (chartData.genreData.datasets[0].backgroundColor as string[])[idx] }}></div>
                                        <span className="font-bold text-neutral-600 dark:text-neutral-300">{label}</span>
                                    </div>
                                    <span className="font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded text-[10px]">
                                        {chartData.genreData.datasets[0].data[idx]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-[220px] max-w-sm relative flex items-center justify-center">
                        <Doughnut 
                            data={chartData.genreData} 
                            options={{
                                ...commonOptions,
                                cutout: '70%',
                                plugins: {
                                    ...commonOptions.plugins,
                                    legend: { display: false } // Legend'ı gizledik, yan tarafa detaylı liste koyduk
                                }
                            } as any} 
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"> 
                            <span className="text-3xl font-black text-neutral-900 dark:text-white">{stats.uniqueGenres}</span>
                            <span className="text-[9px] font-bold text-neutral-400 uppercase">Çeşit</span>
                        </div>
                    </div>
                </div>
              );
          case 'timeline':
              return <ListWidget title="Zaman Tüneli" iconColor="bg-indigo-500" items={stats.decadeCounts} emptyMessage="Tarih verisi bulunamadı." />;
          case 'country':
              return <ListWidget title="Yapım Ülkeleri" iconColor="bg-rose-500" items={stats.countryCounts} emptyMessage="Ülke verisi bulunamadı." />;
          case 'directors':
              return <ListWidget title="Yönetmenler" iconColor="bg-amber-500" items={stats.directorCounts} emptyMessage="Yönetmen verisi bulunamadı." />;
          case 'actors':
              return <ListWidget title="Oyuncular" iconColor="bg-purple-500" items={stats.actorCounts} emptyMessage="Oyuncu verisi bulunamadı." />;
          default: return null;
      }
  };

  const getColSpan = (key: string) => {
      switch(key) {
          case 'kpi': return 'col-span-12';
          case 'genre': return 'col-span-12';
          case 'timeline': case 'country': case 'directors': case 'actors': return 'col-span-12 md:col-span-6 lg:col-span-3';
          default: return 'col-span-12';
      }
  };

  if (!stats || !chartData) return null;

  return (
    <div className="mb-12 animate-fade-in">
        <p className="text-[10px] text-neutral-400 mb-4 text-center italic flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            Analiz kutularını sürükleyip yerlerini değiştirebilirsiniz.
        </p>

        <div className="grid grid-cols-12 gap-4">
            {layoutOrder.map((key, index) => (
                <div
                    key={key}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`${getColSpan(key)} bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 cursor-grab active:cursor-grabbing relative group`}
                >
                    <div className="absolute top-3 right-3 text-neutral-300 dark:text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                    </div>
                    {renderWidget(key)}
                </div>
            ))}
        </div>
    </div>
  );
};

export default CollectionAnalytics;
