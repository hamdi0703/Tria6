
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ResetPasswordModalProps {
  onClose: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ onClose }) => {
  const { updatePassword } = useAuth();
  const { showToast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
        showToast('Şifreler birbiriyle eşleşmiyor.', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Şifre en az 6 karakter olmalıdır.', 'error');
        return;
    }

    setLoading(true);
    try {
        await updatePassword(password);
        // Başarılı olursa modalı kapat
        onClose();
        // İsteğe bağlı: Kullanıcıyı temiz bir URL'e yönlendir (hash'i temizle)
        window.history.replaceState(null, '', window.location.pathname);
    } catch (error: any) {
        showToast(error.message || 'Şifre güncellenemedi.', 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop - Tıklanınca kapanmaz, işlem zorunlu */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-slide-in-up">
        
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                Yeni Şifre Belirle
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Lütfen hesabınız için yeni ve güçlü bir şifre girin.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-2">Yeni Şifre</label>
                <input 
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

            <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-2">Şifre Tekrar</label>
                <input 
                    type="password" 
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="••••••••"
                    disabled={loading}
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
