
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FEEDBACK_CATEGORIES, FeedbackType } from '../constants/feedbackData';

interface FeedbackModalProps {
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Form State
  const [type, setType] = useState<FeedbackType>('idea');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  
  // UI State
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState<{ subject?: boolean; message?: boolean; email?: boolean }>({});

  // Auto-fill email if user is logged in
  useEffect(() => {
      if (user?.email) setEmail(user.email);
  }, [user]);

  // Shake effect reset timer
  useEffect(() => {
      if (shake) {
          const timer = setTimeout(() => setShake(false), 500);
          return () => clearTimeout(timer);
      }
  }, [shake]);

  const getPlaceholders = () => {
      switch(type) {
          case 'bug': return { subject: 'Örn: Ana sayfada kaydırma sorunu', message: 'Hata nasıl oluştu? Adımları tarif edebilir misiniz?' };
          case 'idea': return { subject: 'Örn: Karanlık mod için yeni renk paleti', message: 'Bu özellik neden harika olurdu? Detayları anlatın.' };
          case 'contact': return { subject: 'Örn: İşbirliği teklifi', message: 'Size nasıl yardımcı olabiliriz?' };
          default: return { subject: 'Konu başlığı', message: 'Mesajınız...' };
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = user ? true : emailRegex.test(email);

    const newErrors = {
        subject: !subject.trim(),
        message: !message.trim(),
        email: !isEmailValid
    };
    
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
        showToast('Lütfen işaretli alanları kontrol edin.', 'error');
        setShake(true);
        return;
    }

    setIsSending(true);

    try {
        const userContext = user ? {
            id: user.id,
            username: user.user_metadata?.username || 'Unknown',
            role: 'authenticated'
        } : { role: 'guest' };

        const payload = {
            user_id: user?.id || null, 
            type,
            subject: subject.trim(),
            message: message.trim(),
            contact_email: user ? user.email : email.trim(),
            // Advanced Metadata for Debugging
            device_info: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                screen: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language,
                currentUrl: window.location.href,
                timestamp: new Date().toISOString(),
                userContext: userContext 
            },
            status: 'pending' // Default status for DB
        };

        const { error } = await supabase.from('feedback').insert(payload);

        if (error) throw error;

        setIsSent(true);
        
        // Close automatically after success animation
        setTimeout(() => {
            onClose();
        }, 2500);

    } catch (error) {
        console.error("Feedback error:", error);
        showToast('Geri bildirim gönderilemedi. Bağlantınızı kontrol edin.', 'error');
        setIsSending(false);
    }
  };

  const placeholders = getPlaceholders();

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className={`relative w-full max-w-lg bg-white dark:bg-[#09090b] rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh] overflow-hidden transition-transform duration-300 ${shake ? 'animate-shake' : 'animate-slide-in-up'}`}>
        
        {isSent ? (
            /* SUCCESS STATE */
            <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400 animate-toast-in shadow-xl shadow-green-500/10">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-3xl font-black text-neutral-900 dark:text-white mb-3 tracking-tight">Teşekkürler!</h3>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed text-sm">
                    Geri bildiriminiz başarıyla bize ulaştı. İzleme Listem'yı daha iyi bir yer yapmamıza yardımcı olduğunuz için minnettarız.
                </p>
            </div>
        ) : (
            /* FORM STATE */
            <>
                {/* 1. HEADER (Fixed at top) */}
                <div className="p-6 md:p-8 pb-4 flex items-start justify-between bg-white dark:bg-[#09090b] z-20 shrink-0 relative">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">İletişim Merkezi</span>
                        </div>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight leading-none">Bize Ulaşın</h2>
                        <p className="text-sm text-neutral-500 font-medium mt-2">Görüşleriniz bizim için çok değerli.</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-500 dark:text-neutral-400"
                        aria-label="Kapat"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* 2. SCROLLABLE CONTENT (Middle area) */}
                <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-4 custom-scrollbar min-h-0 relative z-10">
                    <form id="feedback-form" onSubmit={handleSubmit} className="space-y-6 pt-2 pb-6">
                        
                        {/* CATEGORIES */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">Konu Nedir?</label>
                            <div className="grid grid-cols-2 gap-3">
                                {FEEDBACK_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        disabled={isSending}
                                        onClick={() => setType(cat.id)}
                                        className={`relative p-4 rounded-2xl border text-left transition-all duration-300 group overflow-hidden ${
                                            type === cat.id 
                                            ? `${cat.bg} ring-1 ring-offset-0 ring-current` 
                                            : 'border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                        } ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className={`mb-3 transition-colors ${type === cat.id ? cat.color : 'text-neutral-400 dark:text-neutral-500'}`}>
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <div className={`font-bold text-sm ${type === cat.id ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>{cat.label}</div>
                                            <div className="text-[10px] text-neutral-500 dark:text-neutral-500 font-medium opacity-80">{cat.sub}</div>
                                        </div>
                                        {type === cat.id && (
                                            <div className="absolute top-3 right-3 text-indigo-500 dark:text-white animate-scale-in">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* INPUTS */}
                        <div className="space-y-5">
                            
                            {/* Email Field */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">
                                    E-posta {user ? <span className="text-green-500 text-[10px] lowercase font-normal ml-1">(otomatik alındı)</span> : <span className="text-red-400">*</span>}
                                </label>
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if(errors.email) setErrors({...errors, email: false});
                                    }}
                                    disabled={!!user || isSending}
                                    placeholder="Size dönüş yapabilmemiz için..."
                                    className={`w-full px-4 py-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-neutral-900 dark:text-white font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed ${
                                        errors.email ? 'border-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-neutral-200 dark:border-neutral-800 focus:border-indigo-500'
                                    }`}
                                />
                                {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold animate-slide-in-up">Geçerli bir e-posta adresi giriniz.</p>}
                            </div>

                            {/* Subject Field */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">
                                    Konu Başlığı <span className="text-red-400">*</span>
                                </label>
                                <input 
                                    type="text"
                                    value={subject}
                                    onChange={(e) => {
                                        setSubject(e.target.value);
                                        if(errors.subject) setErrors({...errors, subject: false});
                                    }}
                                    disabled={isSending}
                                    placeholder={placeholders.subject}
                                    className={`w-full px-4 py-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-neutral-900 dark:text-white font-bold text-sm disabled:opacity-60 ${
                                        errors.subject ? 'border-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-neutral-200 dark:border-neutral-800 focus:border-indigo-500'
                                    }`}
                                />
                            </div>

                            {/* Message Field */}
                            <div>
                                <label className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">
                                    <span>Mesajınız <span className="text-red-400">*</span></span>
                                    <span className={`text-[10px] ${message.length > 900 ? 'text-red-500' : 'text-neutral-500'}`}>{message.length}/1000</span>
                                </label>
                                <textarea 
                                    value={message}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 1000) {
                                            setMessage(e.target.value);
                                            if(errors.message) setErrors({...errors, message: false});
                                        }
                                    }}
                                    disabled={isSending}
                                    maxLength={1000}
                                    placeholder={placeholders.message}
                                    className={`w-full h-32 px-4 py-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-neutral-900 dark:text-white font-medium resize-none text-sm leading-relaxed disabled:opacity-60 ${
                                        errors.message ? 'border-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-neutral-200 dark:border-neutral-800 focus:border-indigo-500'
                                    }`}
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* 3. FOOTER (Fixed at bottom) */}
                <div className="p-6 md:p-8 pt-4 bg-white dark:bg-[#09090b] border-t border-neutral-100 dark:border-neutral-800 z-20 shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
                    <button 
                        type="submit"
                        form="feedback-form"
                        disabled={isSending}
                        className="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    >
                        {isSending ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Gönderiliyor...</span>
                            </>
                        ) : (
                            <>
                                <span>Geri Bildirimi Gönder</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </>
                        )}
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
