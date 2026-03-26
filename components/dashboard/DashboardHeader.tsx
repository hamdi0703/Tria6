
import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { useToast } from '../../context/ToastContext';
import { useCollectionContext } from '../../context/CollectionContext'; // Added to use collections
import ListSettingsModal from './ListSettingsModal';
import { useClickOutside } from '../../hooks/useClickOutside';

interface DashboardHeaderProps {
  collections: any[]; 
  activeCollectionId: string;
  onSwitchCollection: (id: string) => void;
  onCreateCollection: (name: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  collections, 
  activeCollectionId, 
  onSwitchCollection,
  onCreateCollection
}) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const { activeCollectionMovies } = useCollectionContext(); // Get count from source

  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Selector State
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  useClickOutside(selectorRef, () => setIsSelectorOpen(false));

  const activeCollection = collections.find(c => c.id === activeCollectionId);
  // Count'u artık context'ten gelen aktif film listesinden alıyoruz (Lazy load uyumlu)
  const movieCount = activeCollectionMovies.length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        openAuthModal();
        return;
    }
    if (newListName.trim()) {
      onCreateCollection(newListName.trim());
      setNewListName('');
      setIsCreating(false);
      setIsSelectorOpen(false); // Close selector after creation
    }
  };

  return (
    <div className="mb-8 flex flex-col gap-6 animate-fade-in relative z-30">
      
      {/* SETTINGS MODAL */}
      {isSettingsOpen && activeCollection && (
          <ListSettingsModal 
              collection={activeCollection} 
              onClose={() => setIsSettingsOpen(false)} 
          />
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* LIST SELECTOR (DROPDOWN) - REPLACES HORIZONTAL SCROLL */}
        <div className="relative z-40 w-full md:w-auto" ref={selectorRef}>
            <button 
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-5 py-3 shadow-sm hover:shadow-md transition-all w-full md:min-w-[280px] group"
            >
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div className="flex-1 text-left min-w-0">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Aktif Liste</div>
                    <div className="text-sm font-black text-neutral-900 dark:text-white truncate flex items-center gap-2">
                        {activeCollection?.name || 'Seçim Yapın'}
                        <svg className={`w-4 h-4 text-neutral-400 transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-600 dark:text-neutral-300">
                        {movieCount}
                    </span>
                </div>
            </button>

            {/* DROPDOWN MENU */}
            {isSelectorOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden animate-slide-in-up">
                    <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {collections.map(col => (
                            <button
                                key={col.id}
                                onClick={() => {
                                    onSwitchCollection(col.id);
                                    setIsSelectorOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                                    activeCollectionId === col.id 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-2 h-2 rounded-full ${activeCollectionId === col.id ? 'bg-indigo-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}></div>
                                    <span className="text-sm font-bold truncate">{col.name}</span>
                                    {col.isPublic && (
                                        <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    )}
                                </div>
                                {activeCollectionId === col.id && <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                            </button>
                        ))}
                    </div>
                    
                    <div className="p-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                        {!isCreating ? (
                            <button 
                                onClick={() => setIsCreating(true)}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all text-sm font-bold"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Yeni Liste Oluştur
                            </button>
                        ) : (
                            <form onSubmit={handleCreateSubmit} className="flex gap-2">
                                <input 
                                    type="text" 
                                    autoFocus
                                    value={newListName}
                                    onChange={e => setNewListName(e.target.value)}
                                    placeholder="Liste adı..."
                                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm outline-none focus:border-indigo-500"
                                />
                                <button type="submit" className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </button>
                                <button type="button" onClick={() => setIsCreating(false)} className="p-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* SETTINGS BUTTON */}
        <div className="flex items-center gap-2 self-end md:self-auto">
            <button 
                onClick={() => user ? setIsSettingsOpen(true) : openAuthModal()}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-colors text-sm font-bold"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden md:inline">Ayarlar</span>
            </button>
        </div>
      </div>

      {/* DESCRIPTION PANEL */}
      {activeCollection?.description && (
          <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 text-sm text-neutral-500 dark:text-neutral-400 italic">
              "{activeCollection.description}"
          </div>
      )}

    </div>
  );
};

export default DashboardHeader;
