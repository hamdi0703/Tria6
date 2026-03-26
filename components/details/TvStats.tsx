
import React, { useMemo } from 'react';

interface TvStatsProps {
  seasons?: number;
  episodes?: number;
  runtime?: number[]; // Episode run times
  firstAirDate?: string;
  lastAirDate?: string;
  status?: string;
}

const TvStats: React.FC<TvStatsProps> = ({ 
    seasons = 0, 
    episodes = 0, 
    runtime = [],
    firstAirDate,
    lastAirDate,
    status
}) => {
  
  // Ortalama Süre Hesaplama
  const avgRuntime = useMemo(() => {
      if (!runtime || runtime.length === 0) return 45; // Default fallback
      // Dizideki sürelerin ortalamasını al
      const total = runtime.reduce((acc, curr) => acc + curr, 0);
      return Math.round(total / runtime.length);
  }, [runtime]);

  // Maraton Süresi Hesaplama
  const bingeTime = useMemo(() => {
      if (!episodes) return null;
      const totalMinutes = episodes * avgRuntime;
      
      if (totalMinutes < 60) return `${totalMinutes} Dk`;
      
      const hours = Math.floor(totalMinutes / 60);
      
      if (hours < 24) return `${hours} Saat`;
      
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      
      return `${days} Gün ${remainingHours > 0 ? remainingHours + ' Sa' : ''}`;
  }, [episodes, avgRuntime]);

  // Timeline
  const timeline = useMemo(() => {
      if (!firstAirDate) return null;
      const startYear = new Date(firstAirDate).getFullYear();
      let endYear = '...';
      
      if (status === 'Ended' || status === 'Canceled') {
          endYear = lastAirDate ? new Date(lastAirDate).getFullYear().toString() : startYear.toString();
      } else {
          endYear = 'Günümüz';
      }

      if (startYear.toString() === endYear) return startYear.toString();
      return `${startYear} - ${endYear}`;
  }, [firstAirDate, lastAirDate, status]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Sezon */}
        <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-xl text-center border border-neutral-200 dark:border-neutral-800">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">{seasons}</div>
                <div className="text-xs text-neutral-500 uppercase tracking-wide font-bold">Sezon</div>
        </div>
        
        {/* Bölüm */}
        <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-xl text-center border border-neutral-200 dark:border-neutral-800">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">{episodes}</div>
                <div className="text-xs text-neutral-500 uppercase tracking-wide font-bold">Bölüm</div>
        </div>

        {/* Ortalama Süre (YENİ) */}
        <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-xl text-center border border-neutral-200 dark:border-neutral-800">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">{avgRuntime} <span className="text-sm font-medium text-neutral-500">dk</span></div>
                <div className="text-xs text-neutral-500 uppercase tracking-wide font-bold">Ort. Süre</div>
        </div>

        {/* Maraton Süresi */}
        {bingeTime && (
            <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-xl text-center border border-neutral-200 dark:border-neutral-800">
                <div className="text-lg md:text-xl font-bold text-indigo-600 dark:text-indigo-400">{bingeTime}</div>
                <div className="text-xs text-neutral-500 uppercase tracking-wide font-bold">Maraton</div>
            </div>
        )}

        {/* Timeline */}
        {timeline && (
            <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-xl text-center border border-neutral-200 dark:border-neutral-800">
                <div className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white">{timeline}</div>
                <div className="text-xs text-neutral-500 uppercase tracking-wide font-bold">Yayın Aralığı</div>
            </div>
        )}
    </div>
  );
};

export default TvStats;
