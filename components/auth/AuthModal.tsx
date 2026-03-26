
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface AuthModalProps {
  onClose: () => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { signIn, signUp, resetPassword } = useAuth();
  const { showToast } = useToast();
  
  const [view, setView] = useState<AuthView>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false); // Yeni State: Mail gönderildi mi?
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const getTurkishErrorMessage = (msg: string) => {
    if (!msg) return 'Bir hata oluştu.';
    const m = msg.toLowerCase();
    
    if (m.includes('invalid login credentials')) return 'E-posta veya şifre hatalı.';
    if (m.includes('email not confirmed')) return 'Lütfen önce e-posta adresinizi doğrulayın.';
    if (m.includes('user already registered')) return 'Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.';
    if (m.includes('password should be at least')) return 'Şifre çok kısa (en az 6 karakter olmalı).';
    if (m.includes('rate limit')) return 'Çok fazla deneme yaptınız, lütfen biraz bekleyin.';
    if (m.includes('hesap engellendi')) return 'Bu hesap güvenlik nedeniyle engellenmiştir.';
    if (m.includes('weak_password')) return 'Şifre çok zayıf. Daha karmaşık bir şifre seçin.';
    if (m.includes('anonymous')) return 'Anonim giriş desteklenmiyor.';
    
    return 'İşlem sırasında bir hata oluştu: ' + msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (view === 'LOGIN') {
        await signIn(email, password);
        onClose();
      } else if (view === 'REGISTER') {
        await signUp(email, password, username);
        setView('LOGIN'); 
      } else if (view === 'FORGOT_PASSWORD') {
        await resetPassword(email);
        setResetSent(true); // Başarılı ekrana geç
      }
    } catch (error: any) {
      console.error(error);
      const msg = getTurkishErrorMessage(error.message || error.error_description);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
      switch(view) {
          case 'LOGIN': return 'Tekrar Hoşgeldiniz';
          case 'REGISTER': return 'Aramıza Katılın';
          case 'FORGOT_PASSWORD': return 'Şifre Sıfırlama';
      }
  };

  const getDescription = () => {
      switch(view) {
          case 'LOGIN': return 'Film yolculuğunuza kaldığınız yerden devam edin.';
          case 'REGISTER': return 'Koleksiyonunuzu oluşturun ve düşüncelerinizi paylaşın.';
          case 'FORGOT_PASSWORD': return 'E-posta adresinizi girin, size bir sıfırlama bağlantısı gönderelim.';
      }
  };

  // --- SUCCESS VIEW FOR RESET PASSWORD ---
  if (view === 'FORGOT_PASSWORD' && resetSent) {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-slide-in-up transition-all text-center z-10">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400 animate-pulse">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">E-posta Gönderildi!</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                    <strong>{email}</strong> adresine bir sıfırlama bağlantısı gönderdik. Lütfen gelen kutunuzu (veya spam klasörünü) kontrol edin.
                </p>
                <button 
                    onClick={() => { setView('LOGIN'); setResetSent(false); }}
                    className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                    Giriş Ekranına Dön
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-slide-in-up transition-all z-10">
        <button 
          onClick={onClose}
          aria-label="Kapat"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                {getTitle()}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {getDescription()}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'REGISTER' && (
                <div>
                    <label htmlFor="auth-username" className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-2">Kullanıcı Adı</label>
                    <input 
                        id="auth-username"
                        type="text" 
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-medium"
                        placeholder="SinemaGuru"
                        disabled={loading}
                    />
                </div>
            )}
            
            <div>
                <label htmlFor="auth-email" className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-2">E-posta</label>
                <input 
                    id="auth-email"
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="ornek@email.com"
                    disabled={loading}
                />
            </div>

            {view !== 'FORGOT_PASSWORD' && (
                <div>
                    <div className="flex justify-between mb-2">
                        <label htmlFor="auth-password" className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">Şifre</label>
                        {view === 'LOGIN' && (
                            <button 
                                type="button" 
                                onClick={() => setView('FORGOT_PASSWORD')}
                                className="text-xs text-indigo-500 hover:text-indigo-600 hover:underline font-bold"
                            >
                                Şifremi Unuttum
                            </button>
                        )}
                    </div>
                    <input 
                        id="auth-password"
                        type="password" 
                        required
                        minLength={6}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-medium"
                        placeholder="••••••••"
                        disabled={loading}
                    />
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {view === 'LOGIN' ? 'Giriş Yap' : view === 'REGISTER' ? 'Kayıt Ol' : 'Bağlantı Gönder'}
            </button>
        </form>

        <div className="mt-6 text-center space-y-2">
            {view === 'FORGOT_PASSWORD' ? (
                <button 
                    onClick={() => { setView('LOGIN'); setResetSent(false); }}
                    className="text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    disabled={loading}
                >
                    Giriş ekranına dön
                </button>
            ) : (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {view === 'LOGIN' ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
                    <button 
                        onClick={() => setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                        className="ml-2 font-bold text-indigo-600 hover:underline"
                        disabled={loading}
                    >
                        {view === 'LOGIN' ? 'Kayıt Ol' : 'Giriş Yap'}
                    </button>
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
