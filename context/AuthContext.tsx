
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useToast } from './ToastContext';

interface User {
  id: string;
  email?: string;
  created_at?: string; 
  user_metadata?: {
    username?: string;
    avatar_url?: string;
  };
  is_blocked?: boolean; 
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (username: string, avatarUrl: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>; // New Function
  deleteAccount: () => Promise<void>;
  updateUserStatus: (isBlocked: boolean) => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_ADMIN_USER: User = {
  id: 'mock-admin-id-12345',
  email: 'admin@tria.app',
  created_at: new Date().toISOString(),
  user_metadata: { username: 'Admin', avatar_url: '' },
  is_blocked: false
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { showToast } = useToast();
  
  // --- NON-BLOCKING PROFILE CHECK ---
  // Bu fonksiyon artık "await" ile beklenmeyecek. Arka planda çalışıp
  // eğer profil yoksa oluşturacak. Kullanıcıyı bekletmeyeceğiz.
  const ensureProfileExistsBackground = async (authUser: any) => {
      if (!authUser || authUser.id.startsWith('mock-')) return;

      try {
          // 1. Profil var mı kontrol et
          const { data, error } = await supabase
              .from('profiles')
              .select('id, is_blocked')
              .eq('id', authUser.id)
              .maybeSingle();
          
          if (error) throw error;

          if (data) {
              if (data.is_blocked) {
                  await supabase.auth.signOut();
                  setUser(null);
                  showToast('Hesabınız engellenmiş durumda.', 'error');
              }
              return; 
          }

          // 2. Yoksa oluştur (Insert)
          const { error: insertError } = await supabase.from('profiles').insert({
              id: authUser.id,
              username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User',
              avatar_url: authUser.user_metadata?.avatar_url || '1',
              is_public: true
          });

          if (insertError) {
              if (insertError.code !== '23505') {
                  console.warn("Arka plan profil oluşturma uyarısı:", insertError.message);
              }
          }
      } catch (e) {
          // Supabase bağlantı hatası veya diğer hatalar sessizce yutulur
          console.debug("Profile check background skipped (Network/Auth Error).");
      }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // 1. Mock Kullanıcı Kontrolü
      const mock = localStorage.getItem('tria_mock_user');
      if (mock) {
          if(mounted) {
            setUser(JSON.parse(mock));
            setLoading(false);
          }
          return;
      }

      // 2. Supabase Oturumu Kontrolü
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            ensureProfileExistsBackground(session.user);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.warn("Auth initialization unavailable (Offline or Supabase down).", error);
        if (mounted) setUser(null); // Offline modda çıkış yapılmış gibi davran
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // 3. Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        if (localStorage.getItem('tria_mock_user') && event !== 'SIGNED_OUT') return;

        if (session?.user) {
            setUser(session.user);
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                ensureProfileExistsBackground(session.user);
            }
        } else {
            setUser(null);
        }
        
        setLoading(false);
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, [showToast]);

  const signIn = async (email: string, pass: string) => {
    if (email === 'admin' && pass === 'admin') {
      localStorage.setItem('tria_mock_user', JSON.stringify(MOCK_ADMIN_USER));
      setUser(MOCK_ADMIN_USER);
      showToast('Giriş başarılı (Admin)', 'success');
      return;
    }
    
    localStorage.removeItem('tria_mock_user');
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        
        if (data.user) {
          setUser(data.user);
          ensureProfileExistsBackground(data.user);
          showToast('Giriş başarılı!', 'success');
        }
    } catch (error: any) {
        // Ağ hatası özel durumu
        if (error.message === 'Failed to fetch') {
            throw new Error("Bağlantı hatası. Lütfen internetinizi kontrol edin.");
        }
        throw error;
    }
  };

  const signUp = async (email: string, pass: string, username: string) => {
    localStorage.removeItem('tria_mock_user');
    
    try {
        const { data, error } = await supabase.auth.signUp({
          email, 
          password: pass, 
          options: { data: { username } }
        });
        
        if (error) throw error;
        
        if (data.session) {
            if (data.user) {
                setUser(data.user);
                ensureProfileExistsBackground(data.user);
            }
            showToast('Kayıt başarılı! Oturum açıldı.', 'success');
        } else {
            // Eğer session yoksa, email doğrulaması gerekiyordur
            showToast('Kayıt başarılı! Lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayarak hesabınızı onaylayın.', 'info');
        }
    } catch (error: any) {
        if (error.message === 'Failed to fetch') {
            throw new Error("Bağlantı hatası. Sunucuya erişilemiyor.");
        }
        throw error;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('tria_collections');
    localStorage.removeItem('tria_user_reviews');
    localStorage.removeItem('tria_mock_user');
    
    if (user && !user.id.startsWith('mock-')) {
        try {
            await supabase.auth.signOut();
        } catch(e) {
            console.warn("Sign out local only due to network error");
        }
    }
    
    setUser(null); 
    showToast('Çıkış yapıldı', 'info');
  };

  const updateProfile = async (username: string, avatarUrl: string) => {
    if (!user) return;
    
    if (user.id.startsWith('mock-')) {
        const upd = { ...user, user_metadata: { ...user.user_metadata, username, avatar_url: avatarUrl } };
        setUser(upd); 
        localStorage.setItem('tria_mock_user', JSON.stringify(upd));
        return;
    }

    const { error } = await supabase.auth.updateUser({
      data: { username, avatar_url: avatarUrl }
    });
    if (error) throw error;

    setUser(prev => prev ? ({
        ...prev,
        user_metadata: { ...prev.user_metadata, username, avatar_url: avatarUrl }
    }) : null);
  };

  const updatePassword = async (password: string) => {
      if (user?.id.startsWith('mock-')) return;
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      showToast('Şifreniz güncellendi', 'success');
  };

  const resetPassword = async (email: string) => {
      const redirectTo = window.location.origin; 
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
      });
      
      if (error) throw error;
      showToast('Sıfırlama bağlantısı e-postanıza gönderildi.', 'success');
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
        if (!user.id.startsWith('mock-')) {
            const { error } = await supabase.rpc('delete_own_account');
            if (error) throw error;
        }
        await signOut();
        showToast('Hesabınız silindi.', 'info');
    } catch (e) {
        console.error(e);
        // Hata olsa bile oturumu kapatarak UI'ı temizle
        await signOut();
    }
  };

  const updateUserStatus = async (isBlocked: boolean) => {
      if (!user) return;
      if (user.id.startsWith('mock-')) {
          const upd = { ...user, is_blocked: isBlocked };
          setUser(upd); localStorage.setItem('tria_mock_user', JSON.stringify(upd));
          return;
      }
      
      const { error } = await supabase.from('profiles').update({ is_blocked: isBlocked }).eq('id', user.id);

      if (error) { 
          showToast('İşlem başarısız', 'error'); 
          return; 
      }

      if (isBlocked) {
          showToast('Hesap donduruldu, çıkış yapılıyor...', 'info');
          setTimeout(signOut, 1500);
      } else {
          showToast('Hesap aktif edildi', 'success');
          setUser({ ...user, is_blocked: false });
      }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        loading, 
        signIn, 
        signUp, 
        signOut, 
        updateProfile,
        updatePassword,
        resetPassword,
        deleteAccount,
        updateUserStatus, 
        isAuthModalOpen, 
        openAuthModal: () => setIsAuthModalOpen(true), 
        closeAuthModal: () => setIsAuthModalOpen(false) 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth missing');
    return context;
}
