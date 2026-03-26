
import React, { useState } from 'react';
import { Collection } from '../types';
import { useToast } from '../context/ToastContext';
import { getProfileShareUrl, getCollectionShareUrl } from '../utils/urlUtils';

interface ShareProfileModalProps {
  username: string;
  avatarUrl: string;
  publicCollections: Collection[];
  onClose: () => void;
}

const ShareProfileModal: React.FC<ShareProfileModalProps> = ({ 
    username, 
    avatarUrl, 
    publicCollections, 
    onClose 
}) => {
  const { showToast } = useToast();
  const [selectedListId, setSelectedListId] = useState<string>(publicCollections[0]?.id || '');

  const profileLink = getProfileShareUrl(username);

  const handleCopyProfile = () => {
      navigator.clipboard.writeText(profileLink);
      showToast('Profil bağlantısı kopyalandı', 'success');
  };

  const handleCopyList = () => {
      const col = publicCollections.find(c => c.id === selectedListId);
      if (col && col.shareToken) {
          const listLink = getCollectionShareUrl(col.shareToken);
          navigator.clipboard.writeText(listLink);
          showToast(`"${col.name}" bağlantısı kopyalandı`, 'success');
      } else {
          showToast('Bu liste için bağlantı bulunamadı', 'error');
      }
  };

  // Display URL (stripped for aesthetics in UI, actual copy uses full link)
  const displayUrl = profileLink.replace(/^https?:\/\//, '').split('?')[0];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-slide-in-up overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
            <div>
                <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">Paylaşım Merkezi</h2>
                <p className="text-xs text-neutral-500">Neyi paylaşmak istersin?</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div className="p-6 grid gap-8">
            
            {/* OPTION 1: SHARE PROFILE */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                <div className="relative bg-white dark:bg-neutral-950 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center gap-5">
                    
                    {/* Visual Preview */}
                    <div className="flex-shrink-0 text-center sm:text-left">
                        <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 mx-auto sm:mx-0">
                            <img src={avatarUrl} alt={username} className="w-full h-full rounded-full object-cover bg-neutral-900" />
                        </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left min-w-0">
                        <h3 className="font-bold text-neutral-900 dark:text-white text-lg">Profilini Paylaş</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 truncate">{displayUrl}</p>
                        <button 
                            onClick={handleCopyProfile}
                            className="w-full sm:w-auto px-6 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs hover:scale-105 transition-transform shadow-lg"
                        >
                            Bağlantıyı Kopyala
                        </button>
                    </div>
                </div>
            </div>

            {/* OPTION 2: SHARE LIST */}
            {publicCollections.length > 0 && (
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                    <div className="relative bg-white dark:bg-neutral-950 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                        
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-900 dark:text-white">Liste Paylaş</h3>
                                <p className="text-xs text-neutral-500">Herkese açık listelerin</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <select 
                                value={selectedListId}
                                onChange={(e) => setSelectedListId(e.target.value)}
                                className="flex-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-500/50"
                            >
                                {publicCollections.map(col => (
                                    <option key={col.id} value={col.id}>{col.name}</option>
                                ))}
                            </select>
                            <button 
                                onClick={handleCopyList}
                                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold text-xs transition-colors shadow-lg shadow-pink-600/20"
                            >
                                Kopyala
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {publicCollections.length === 0 && (
                <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-900/30 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
                    <p className="text-xs text-neutral-500">
                        Henüz herkese açık bir listeniz yok. Listelerinizin ayarlarından "Herkese Açık" seçeneğini aktif edebilirsiniz.
                    </p>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default ShareProfileModal;
