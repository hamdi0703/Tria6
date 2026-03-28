
import React, { useState, useEffect } from 'react';
import { useCollectionContext } from '../context/CollectionContext';
import { useReviewContext } from '../context/ReviewContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { AVATAR_PERSONAS, getAvatarUrl, getAvatarPersona } from '../utils/avatarUtils';
import { supabase } from '../services/supabaseClient';

export type ProfileTab = 'PROFILE' | 'SECURITY' | 'APP_PREFS' | 'DATA_ZONE';

interface ProfileModalProps {
  onClose: () => void;
  onResetApp: () => void;
  initialTab?: ProfileTab; 
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onResetApp, initialTab = 'PROFILE' }) => {
  const { collections } = useCollectionContext();
  const { reviews } = useReviewContext();
  const { user, signOut, updateProfile, updatePassword, deleteAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const [loading, setLoading] = useState(false);

  // Form States
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('1'); 
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Init Data
  useEffect(() => {
    if (user) {
        setUsername(user.user_metadata?.username || '');
        const currentAvatar = user.user_metadata?.avatar_url;
        setSelectedAvatarId(currentAvatar && !currentAvatar.startsWith('http') ? currentAvatar : '1');
        
        // Fetch extended profile data
        const fetchExtended = async () => {
            if (user.id.startsWith('mock-')) return;
            const { data } = await supabase.from('profiles').select('bio, website, is_public').eq('id', user.id).single();
            if (data) {
                setBio(data.bio || '');
                setWebsite(data.website || '');
                setIsProfilePublic(data.is_public !== false); 
            }
        };
        fetchExtended();
    }
  }, [user]);

  const currentPersona = getAvatarPersona(selectedAvatarId);

  // --- ACTIONS ---

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await updateProfile(username, selectedAvatarId);
          
          if (!user?.id.startsWith('mock-')) {
              await supabase.from('profiles').update({
                  bio: bio,
                  website: website,
                  is_public: isProfilePublic
              }).eq('id', user?.id);
          }
          showToast('Profil ayarları kaydedildi.', 'success');
      } catch (error: any) {
          showToast(error.message, 'error');
      } finally {
          setLoading(false);
      }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword !== confirmPassword) {
          showToast('Şifreler eşleşmiyor', 'error');
          return;
      }
      if (newPassword.length < 6) {
          showToast('Şifre en az 6 karakter olmalı', 'error');
          return;
      }
      setLoading(true);
      try {
          await updatePassword(newPassword);
          setNewPassword('');
          setConfirmPassword('');
      } catch (error: any) {
          showToast(error.message, 'error');
      } finally {
          setLoading(false);
      }
  };

  const handleDeleteAccount = async () => {
      if (window.confirm('BU İŞLEM GERİ ALINAMAZ! Hesabınızı ve tüm verilerinizi silmek istediğinize emin misiniz?')) {
          setLoading(true);
          await deleteAccount();
          onClose();
      }
  };

  const handleExportData = () => {
      const data = {
          profile: { username, bio, website },
          collections: collections,
          reviews: reviews,
          exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tria-backup-${username || 'user'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Verileriniz indirildi.', 'success');
  };

  // --- MENU COMPONENT ---
  const SidebarItem = ({ id, label, icon, desc }: { id: ProfileTab, label: string, icon: React.ReactNode, desc: string }) => (
      <button
          onClick={() => setActiveTab(id)}
          className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 group ${
              activeTab === id 
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-black shadow-md' 
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400'
          }`}
      >
          <div className={`p-2 rounded-lg ${activeTab === id ? 'bg-white/20 dark:bg-black/10' : 'bg-neutral-200 dark:bg-neutral-800 group-hover:bg-white dark:group-hover:bg-neutral-700'}`}>
              {icon}
          </div>
          <div className="flex-1 min-w-0">
              <div className="font-bold text-sm leading-tight">{label}</div>
              <div className={`text-[10px] truncate mt-0.5 ${activeTab === id ? 'text-white/70 dark:text-black/60' : 'text-neutral-400'}`}>{desc}</div>
          </div>
          {activeTab === id && (
              <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          )}
      </button>
  );

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-white dark:bg-neutral-950 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row overflow-hidden h-[85vh] md:h-[650px] animate-slide-in-up">
        
        {/* --- LEFT SIDEBAR (NAVIGATION) --- */}
        <div className="w-full md:w-80 bg-neutral-50/80 dark:bg-neutral-900/30 p-6 flex flex-col border-r border-neutral-100 dark:border-neutral-800 backdrop-blur-md overflow-y-auto">
            
            {/* User Header */}
            <div className="mb-8 flex items-center gap-3 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-neutral-700 shadow-md">
                    <img src={getAvatarUrl(selectedAvatarId)} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                    <h2 className="font-bold text-neutral-900 dark:text-white truncate">{username}</h2>
                    <p className="text-[10px] text-neutral-500 font-medium">Ayarlar & Profil</p>
                </div>
            </div>

            <div className="space-y-6 flex-1">
                <div>
                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-2">Kişisel</h3>
                    <div className="space-y-1">
                        <SidebarItem 
                            id="PROFILE" 
                            label="Profil Düzenle" 
                            desc="Avatar, bio ve detaylar"
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                        />
                        <SidebarItem 
                            id="SECURITY" 
                            label="Gizlilik & Güvenlik" 
                            desc="Şifre ve görünürlük"
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-2">Sistem</h3>
                    <div className="space-y-1">
                        <SidebarItem 
                            id="APP_PREFS" 
                            label="Uygulama Tercihleri" 
                            desc="Tema ve görünüm"
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}
                        />
                        <SidebarItem 
                            id="DATA_ZONE" 
                            label="Veri & Depolama" 
                            desc="Yedekleme ve temizlik"
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>}
                        />
                    </div>
                </div>
            </div>

            <button 
                onClick={() => { signOut(); onClose(); }}
                className="mt-6 w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-bold"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Oturumu Kapat
            </button>
        </div>

        {/* --- RIGHT CONTENT AREA --- */}
        <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-white dark:bg-neutral-950 relative custom-scrollbar">
            
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors z-20 text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* TAB: PROFILE (Avatar & Info) */}
            {activeTab === 'PROFILE' && (
                <div className="max-w-2xl mx-auto animate-fade-in space-y-10">
                    <div>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-2">Profil Görünümü</h2>
                        <p className="text-neutral-500 dark:text-neutral-400">İzleme Listem topluluğunda nasıl göründüğünüzü özelleştirin.</p>
                    </div>

                    {/* Avatar Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-neutral-900 dark:text-white">Avatar Seçimi</label>
                            <span className="text-xs font-bold text-indigo-500 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded">{currentPersona.name}</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                            {AVATAR_PERSONAS.map((persona) => (
                                <button
                                    key={persona.id}
                                    onClick={() => setSelectedAvatarId(persona.id)}
                                    className={`relative group rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                                        selectedAvatarId === persona.id 
                                        ? 'border-indigo-500 shadow-xl scale-105 z-10' 
                                        : 'border-transparent bg-neutral-100 dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 opacity-80 hover:opacity-100'
                                    }`}
                                >
                                    <img src={getAvatarUrl(persona.id)} alt={persona.name} className="w-full h-full object-cover" />
                                    {selectedAvatarId === persona.id && (
                                        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-white"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-neutral-100 dark:bg-neutral-800"></div>

                    {/* Basic Info Form */}
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Kullanıcı Adı</label>
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 focus:border-indigo-500 outline-none font-medium transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Web Sitesi</label>
                                <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 focus:border-indigo-500 outline-none font-medium transition-all placeholder-neutral-400" placeholder="https://" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Biyografi</label>
                            <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full h-28 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 focus:border-indigo-500 outline-none font-medium resize-none transition-all placeholder-neutral-400" placeholder="Favori film türlerin, yönetmenlerin..." />
                        </div>
                        
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={loading} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 disabled:opacity-50">
                                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB: SECURITY (Password & Privacy) */}
            {activeTab === 'SECURITY' && (
                <div className="max-w-xl mx-auto animate-fade-in space-y-10">
                    <div>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-2">Hesap Güvenliği</h2>
                        <p className="text-neutral-500 dark:text-neutral-400">Şifrenizi ve gizlilik ayarlarınızı yönetin.</p>
                    </div>

                    {/* Privacy Toggle */}
                    <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-neutral-900 dark:text-white text-base">Herkese Açık Profil</h4>
                            <p className="text-xs text-neutral-500 mt-1 max-w-[250px]">Aktifken profilinizi ve herkese açık listelerinizi diğer kullanıcılar görebilir.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={isProfilePublic} 
                                onChange={() => setIsProfilePublic(!isProfilePublic)} 
                                className="sr-only peer" 
                            />
                            <div className="w-12 h-7 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
                        </label>
                    </div>
                    
                    <button onClick={handleUpdateProfile} className="w-full py-3 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                        Gizlilik Ayarını Güncelle
                    </button>

                    <div className="h-px bg-neutral-100 dark:bg-neutral-800"></div>

                    {/* Password Change */}
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wide">Şifre Değiştir</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Yeni Şifre" className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-indigo-500 outline-none transition-all" />
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Yeni Şifre (Tekrar)" className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-indigo-500 outline-none transition-all" />
                        </div>
                        
                        <div className="flex justify-end">
                            <button type="submit" disabled={!newPassword || loading} className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
                                Şifreyi Güncelle
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB: APP PREFS (Theme) */}
            {activeTab === 'APP_PREFS' && (
                <div className="max-w-xl mx-auto animate-fade-in space-y-10">
                    <div>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-2">Uygulama Tercihleri</h2>
                        <p className="text-neutral-500 dark:text-neutral-400">İzleme Listem arayüzünü kişiselleştirin.</p>
                    </div>

                    {/* Theme Selector */}
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => theme === 'dark' && toggleTheme()}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-2xl shadow-sm">☀️</div>
                            <span className="font-bold text-sm">Aydınlık Mod</span>
                        </button>
                        <button 
                            onClick={() => theme === 'light' && toggleTheme()}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'dark' ? 'border-indigo-500 bg-indigo-900/20 text-indigo-400' : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-2xl shadow-sm">🌙</div>
                            <span className="font-bold text-sm">Karanlık Mod</span>
                        </button>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-4">
                        <div className="text-blue-500 dark:text-blue-400 mt-1">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-700 dark:text-blue-300 text-sm">Otomatik Tema</h4>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Uygulama, varsayılan olarak tarayıcı veya cihaz tercihlerinizi takip eder.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: DATA (Export & Delete) */}
            {activeTab === 'DATA_ZONE' && (
                <div className="max-w-xl mx-auto animate-fade-in space-y-10">
                    <div>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-2">Veri Yönetimi</h2>
                        <p className="text-neutral-500 dark:text-neutral-400">Verilerinizi indirin veya sıfırlayın.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer" onClick={handleExportData}>
                            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-neutral-900 dark:text-white">Verilerimi İndir (JSON)</h4>
                                <p className="text-xs text-neutral-500">Tüm koleksiyon ve incelemelerinizin yedeğini alın.</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer" onClick={() => { if(window.confirm('Önbellek temizlensin mi? Bu işlem oturumunuzu kapatmaz.')) onResetApp(); }}>
                            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-neutral-900 dark:text-white">Önbelleği Temizle</h4>
                                <p className="text-xs text-neutral-500">Uygulama yavaşladıysa veya senkronizasyon sorunu varsa deneyin.</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-neutral-100 dark:bg-neutral-800"></div>

                    <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-red-600 dark:text-red-400">Hesabı Sil</h4>
                                <p className="text-xs text-red-500 dark:text-red-400/70 mt-1 mb-4">Bu işlem geri alınamaz. Profiliniz, listeleriniz ve tüm verileriniz kalıcı olarak silinecektir.</p>
                                <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors">
                                    Hesabımı Kalıcı Olarak Sil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
