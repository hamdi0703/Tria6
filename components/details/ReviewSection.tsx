import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PostCategory, UserReview } from '../../types';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { useCollectionContext } from '../../context/CollectionContext';
import { useReviewContext } from '../../context/ReviewContext';
import { useGlobalReviews, useOwnerReview, useReviewMutations } from '../../hooks/useReviewQueries';
import { REVIEW_TAGS, getTagConfig } from '../../constants/reviewTags';
import { reviewService } from '../../services/reviewService';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Cast } from '../../types';

interface ReviewSectionProps {
  movieId: number;
  movieTitle: string;
  cast?: Cast[];
}

// --- SUB-COMPONENTS ---

// 1. REPORT MODAL
const ReportModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSubmit: (reason: string, details: string) => void;
    isSubmitting: boolean;
}> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside(ref, onClose);

    const [selectedReason, setSelectedReason] = useState<string>('');
    const [details, setDetails] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelectedReason('');
            setDetails('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const reasons = [
        { id: 'spoiler', label: 'Spoiler İçeriyor', icon: '🤐' },
        { id: 'harassment', label: 'Hakaret / Nefret Söylemi', icon: '🤬' },
        { id: 'spam', label: 'Spam / Reklam', icon: '🚫' },
        { id: 'irrelevant', label: 'Konu Dışı', icon: '🤔' },
        { id: 'other', label: 'Diğer', icon: '🚩' }
    ];

    const handleSubmit = () => {
        if (!selectedReason) return;
        const reasonLabel = reasons.find(r => r.id === selectedReason)?.label || 'Bilinmiyor';
        onSubmit(reasonLabel, details);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div ref={ref} className="bg-white dark:bg-[#0f0f0f] w-full max-w-md rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh] animate-slide-in-up overflow-hidden">
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
                            <span className="text-red-500">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </span>
                            İçeriği Bildir
                        </h3>
                        <p className="text-xs text-neutral-500 font-medium">Bu yorumla ilgili sorun nedir?</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-neutral-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">Sebep Seçin</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {reasons.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setSelectedReason(r.id)}
                                disabled={isSubmitting}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                                    selectedReason === r.id 
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 ring-1 ring-red-500' 
                                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                                }`}
                            >
                                <span className="text-lg">{r.icon}</span>
                                <span className="text-xs font-bold">{r.label}</span>
                            </button>
                        ))}
                    </div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">
                        Açıklama <span className="text-neutral-500 font-normal lowercase">(isteğe bağlı)</span>
                    </label>
                    <textarea 
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="Eklemek istediğiniz detaylar..."
                        className="w-full h-24 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm text-neutral-900 dark:text-white resize-none transition-all placeholder-neutral-400"
                    />
                </div>
                <div className="p-6 pt-2">
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedReason}
                        className="w-full py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Gönderiliyor...' : 'Bildirimi Gönder'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. Interactive Stars
const StarRating = ({ current, onChange, size = 'md' }: { current: number, onChange?: (val: number) => void, size?: 'sm' | 'md' | 'lg' }) => {
    const [hover, setHover] = useState(0);
    const interactive = !!onChange;
    const sizeClass = size === 'lg' ? 'w-8 h-8' : size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
    
    return (
        <div className="flex items-center gap-1" onMouseLeave={() => interactive && setHover(0)}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && onChange(star)}
                    onMouseEnter={() => interactive && setHover(star)}
                    className={`focus:outline-none transition-transform duration-200 ${interactive ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
                >
                    <svg 
                        className={`${sizeClass} ${star <= (hover || current) ? 'text-amber-400 fill-current drop-shadow-md' : 'text-neutral-300 dark:text-neutral-800'}`}
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </button>
            ))}
            {current > 0 && (
                <span className="ml-3 text-lg font-black text-neutral-700 dark:text-white animate-fade-in">
                    {hover || current}
                </span>
            )}
        </div>
    );
};

// 3. Read-Only Review Card (Updated with Vote)
const ReviewCard: React.FC<{ 
    review: UserReview; 
    highlighted?: boolean; 
    currentUserId?: string;
    onEdit: (review: UserReview) => void;
    onDelete: () => void;
    onReport: (review: UserReview) => void;
    onVote: (review: UserReview, type: 'UP' | 'DOWN') => void;
    revealedSpoilers: Set<string>;
    toggleSpoiler: (id: string) => void;
}> = ({ review, highlighted, currentUserId, onEdit, onDelete, onReport, onVote, revealedSpoilers, toggleSpoiler }) => {
    const isMe = currentUserId === review.user_id;
    const isRevealed = revealedSpoilers.has(review.id || 'unknown');
    
    // Normalize Tags
    const displayTags = review.tags && review.tags.length > 0 
        ? review.tags 
        : (review.category ? [review.category] : ['REVIEW']);

    const timeAgo = new Date(review.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    // Optimistic Vote Display (Simple)
    const voteStatus = review.currentUserVote; // 'UP', 'DOWN', or null

    return (
        <div className={`group relative p-6 rounded-3xl border transition-all duration-300 ${highlighted ? 'bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border-indigo-500/30' : 'bg-white dark:bg-[#0a0a0a] border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 p-0.5">
                        <img src={getAvatarUrl(review.avatar_url)} alt={review.username} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-neutral-900 dark:text-white text-sm mr-1">{review.username}</span>
                            
                            {/* RENDER TAGS */}
                            <div className="flex flex-wrap gap-1.5">
                                {displayTags.map(tagId => {
                                    const config = getTagConfig(tagId);
                                    return (
                                        <span key={tagId} className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-bold border ${config.bgClass} ${config.colorClass} ${config.borderClass}`}>
                                            {config.icon}
                                            {config.label}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <StarRating current={review.rating} size="sm" />
                            <span className="text-[10px] text-neutral-400">• {timeAgo}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isMe ? (
                        <>
                            <button onClick={() => onEdit(review)} className="p-1.5 text-neutral-400 hover:text-indigo-500 transition-colors" title="Düzenle"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                            <button onClick={onDelete} className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors" title="Sil"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </>
                    ) : (
                        <button onClick={() => onReport(review)} className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors" title="Bildir">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-8a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 4a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2h-6a2 2 0 01-2-2V4z" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* EXTRA META (Character & Time) */}
            {(review.character || review.watchTime) && (!review.hasSpoiler || isRevealed || isMe) && (
                <div className="flex flex-wrap gap-3 mb-4">
                    {review.character && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-2.5 py-1 rounded-lg border border-amber-100 dark:border-amber-900/30">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Karakter: {review.character}
                        </div>
                    )}
                    {review.watchTime && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Zaman/Bölüm: {review.watchTime}
                        </div>
                    )}
                </div>
            )}

            {/* COMMENT CONTENT */}
            {review.hasSpoiler && !isRevealed && !isMe ? (
                <button onClick={() => toggleSpoiler(review.id || 'unknown')} className="w-full py-8 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center gap-2 group/spoiler">
                    <span className="text-sm font-bold text-red-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        Spoiler İçeriyor
                    </span>
                    <span className="text-xs text-neutral-500 group-hover/spoiler:underline">Görüntülemek için tıkla</span>
                </button>
            ) : (
                <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap font-medium">
                    {review.comment}
                </p>
            )}

            {/* ACTIONS FOOTER (LIKE / DISLIKE) */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button 
                    onClick={() => onVote(review, 'UP')}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                        voteStatus === 'UP' 
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg' 
                        : 'text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                >
                    <svg className={`w-4 h-4 ${voteStatus === 'UP' ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {review.upvotes > 0 && <span>{review.upvotes}</span>}
                </button>

                <button 
                    onClick={() => onVote(review, 'DOWN')}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                        voteStatus === 'DOWN' 
                        ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg' 
                        : 'text-neutral-500 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                >
                    <svg className={`w-4 h-4 ${voteStatus === 'DOWN' ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    {review.downvotes > 0 && <span>{review.downvotes}</span>}
                </button>
            </div>
        </div>
    );
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ movieId, movieTitle, cast = [] }) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const { sharedList } = useCollectionContext();
  
  // CACHE & SYNC (Global Context)
  const { addReview, removeReview } = useReviewContext();

  const { data: globalReviewsData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isLoadingGlobal } = useGlobalReviews(movieId);
  const { data: ownerReview } = useOwnerReview(movieId, sharedList?.ownerId);
  const { addMutation, deleteMutation, voteMutation } = useReviewMutations(movieId, user?.id);

  // States
  const [isEditing, setIsEditing] = useState(false);
  
  // Tag Selection State (Array)
  const [selectedTags, setSelectedTags] = useState<PostCategory[]>([]);
  
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [characterInput, setCharacterInput] = useState('');
  const [watchTimeInput, setWatchTimeInput] = useState('');
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());
  
  // Character Dropdown State
  const [showCharacterDropdown, setShowCharacterDropdown] = useState(false);
  const characterInputRef = useRef<HTMLDivElement>(null);
  useClickOutside(characterInputRef, () => setShowCharacterDropdown(false));

  // Report States
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reviewToReport, setReviewToReport] = useState<UserReview | null>(null);
  const [isReporting, setIsReporting] = useState(false);

  // Optimistic UI State for Votes
  const [optimisticVotes, setOptimisticVotes] = useState<Record<string, { up: number, down: number, type: 'UP' | 'DOWN' | null }>>({});

  const myReview = useMemo(() => {
      if (!user || !globalReviewsData) return undefined;
      return globalReviewsData.pages.flatMap(p => p.data).find(r => r.user_id === user.id);
  }, [globalReviewsData, user]);

  useEffect(() => {
      if (myReview) {
          setRating(myReview.rating);
          setContent(myReview.comment);
          setHasSpoiler(myReview.hasSpoiler || false);
          setCharacterInput(myReview.character || '');
          setWatchTimeInput(myReview.watchTime || '');
          const tags = myReview.tags && myReview.tags.length > 0 
            ? myReview.tags 
            : (myReview.category ? [myReview.category] : ['REVIEW' as PostCategory]);
          setSelectedTags(tags);
      } else if (!isEditing) {
          setRating(0);
          setContent('');
          setHasSpoiler(false);
          setCharacterInput('');
          setWatchTimeInput('');
          setSelectedTags(['REVIEW']); 
      }
  }, [myReview, isEditing]);

  const handleStartReview = () => {
      if (!user || user.id.startsWith('guest-')) {
          showToast('Yorum yapmak için giriş yapmalısınız.', 'info');
          openAuthModal();
          return;
      }
      setIsEditing(true);
  };

  const handleTagToggle = (tagId: PostCategory) => {
      setSelectedTags(prev => {
          if (prev.includes(tagId)) {
              if (prev.length === 1) return prev;
              return prev.filter(t => t !== tagId);
          } else {
              if (prev.length >= 3) {
                  showToast('En fazla 3 etiket seçebilirsiniz.', 'info');
                  return prev;
              }
              return [...prev, tagId];
          }
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (rating === 0) { showToast('Lütfen bir puan verin.', 'error'); return; }
      if (!content.trim()) { showToast('Lütfen düşüncelerinizi yazın.', 'error'); return; }

      try {
          const payload = { 
              movieId, 
              rating, 
              comment: content, 
              hasSpoiler, 
              tags: selectedTags,
              character: characterInput.trim() || undefined,
              watchTime: watchTimeInput.trim() || undefined
          };
          
          await addMutation.mutateAsync(payload);
          
          // SYNC: Update Global Context for "My Reviews" instantly
          const reviewForContext: UserReview = {
              ...payload,
              createdAt: new Date().toISOString(),
              upvotes: myReview?.upvotes || 0,
              downvotes: myReview?.downvotes || 0,
              user_id: user!.id,
              username: user!.user_metadata?.username,
              avatar_url: user!.user_metadata?.avatar_url
          };
          await addReview(reviewForContext);

          showToast(myReview ? 'İncelemeniz güncellendi!' : 'Paylaşımınız yayınlandı!', 'success');
          setIsEditing(false);
      } catch (e: any) {
          showToast(e.message || 'Bir hata oluştu.', 'error');
      }
  };

  const handleDelete = async () => {
      if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
      try {
          await deleteMutation.mutateAsync();
          
          // SYNC: Remove from Global Context
          await removeReview(movieId);

          setRating(0); setContent(''); setCharacterInput(''); setWatchTimeInput(''); setIsEditing(false); setSelectedTags(['REVIEW']);
          showToast('Silindi.', 'info');
      } catch (e: any) { showToast('Hata oluştu.', 'error'); }
  };

  const handleVote = (review: UserReview, type: 'UP' | 'DOWN') => {
      if (!user || user.id.startsWith('guest-')) {
          showToast('Oy vermek için giriş yapmalısınız.', 'info');
          openAuthModal();
          return;
      }
      if (!review.id) return;

      const currentVote = optimisticVotes[review.id]?.type ?? review.currentUserVote;
      const currentUp = optimisticVotes[review.id]?.up ?? review.upvotes;
      const currentDown = optimisticVotes[review.id]?.down ?? review.downvotes;

      let newVoteType: 'UP' | 'DOWN' | null = type;
      let newUp = currentUp;
      let newDown = currentDown;

      if (currentVote === type) {
          newVoteType = null;
          if (type === 'UP') newUp = Math.max(0, newUp - 1);
          else newDown = Math.max(0, newDown - 1);
      } else {
          if (currentVote === 'UP') newUp = Math.max(0, newUp - 1);
          if (currentVote === 'DOWN') newDown = Math.max(0, newDown - 1);
          
          if (type === 'UP') newUp += 1;
          else newDown += 1;
      }

      setOptimisticVotes(prev => ({
          ...prev,
          [review.id!]: { up: newUp, down: newDown, type: newVoteType }
      }));

      voteMutation.mutate({ reviewId: review.id, voteType: type });
  };

  const handleOpenReport = (review: UserReview) => {
      setReviewToReport(review);
      setReportModalOpen(true);
  };

  const handleSubmitReport = async (reason: string, details: string) => {
      if (!reviewToReport || !reviewToReport.id) return;
      setIsReporting(true);
      try {
          await reviewService.reportReview({
              reviewId: reviewToReport.id,
              reviewContent: reviewToReport.comment,
              reviewOwnerId: reviewToReport.user_id || 'unknown',
              reporterId: user?.id,
              reason: reason,
              additionalDetails: details,
              movieTitle: movieTitle
          });
          showToast('Bildiriminiz alındı. Teşekkürler.', 'success');
          setReportModalOpen(false);
      } catch (e) {
          showToast('Bildirim gönderilemedi.', 'error');
      } finally {
          setIsReporting(false);
          setReviewToReport(null);
      }
  };

  const allReviews = globalReviewsData?.pages.flatMap(p => p.data) || [];
  const filteredReviews = ownerReview ? allReviews.filter(r => r.user_id !== ownerReview.user_id) : allReviews;

  const getDisplayReview = (r: UserReview): UserReview => {
      if (!r.id || !optimisticVotes[r.id]) return r;
      const opt = optimisticVotes[r.id];
      return { ...r, upvotes: opt.up, downvotes: opt.down, currentUserVote: opt.type };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Report Modal */}
        <ReportModal 
            isOpen={reportModalOpen} 
            onClose={() => setReportModalOpen(false)} 
            onSubmit={handleSubmitReport}
            isSubmitting={isReporting}
        />

        {/* Header */}
        <div className="flex justify-between items-end">
            <div>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
                    Topluluk Görüşleri
                    <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs px-2.5 py-1 rounded-full font-bold">
                        {allReviews.length + (ownerReview ? 1 : 0)}
                    </span>
                </h3>
            </div>
            {!isEditing && (
                <button 
                    onClick={handleStartReview} 
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:-translate-y-0.5 transition-all ${
                        myReview 
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        : 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                    }`}
                >
                    {myReview ? (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            İncelemeni Düzenle
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            FİKRİNİ PAYLAŞ
                        </>
                    )}
                </button>
            )}
        </div>

        {/* --- MODERN EDITOR --- */}
        {isEditing && (
            <div className="relative animate-slide-in-up">
                <div className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden relative z-10">
                    
                    {/* Header: User & Rating */}
                    <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center gap-6">
                        <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 to-purple-500 flex-shrink-0">
                            <img src={getAvatarUrl(user?.user_metadata?.avatar_url)} alt="User" className="w-full h-full rounded-full object-cover bg-black" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Senin Puanın</div>
                            <StarRating current={rating} onChange={setRating} size="lg" />
                        </div>
                    </div>

                    {/* Content Body */}
                    <form onSubmit={handleSubmit} className="p-6">
                        
                        {/* TAG SELECTOR */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wide">Etiketler (Max 3)</label>
                                <span className="text-[10px] text-neutral-400 font-medium">{selectedTags.length}/3 Seçildi</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {REVIEW_TAGS.map((tag) => {
                                    const isSelected = selectedTags.includes(tag.id);
                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => handleTagToggle(tag.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${
                                                isSelected 
                                                ? `${tag.bgClass} ${tag.colorClass} ${tag.borderClass} ring-1 ring-current shadow-sm`
                                                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                                            }`}
                                            title={tag.description}
                                        >
                                            {tag.icon}
                                            {tag.label}
                                            {isSelected && (
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="relative mb-6">
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder={`"${movieTitle}" hakkında düşüncelerin neler?`}
                                className="w-full min-h-[160px] bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl text-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 outline-none resize-none leading-relaxed font-medium border border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-neutral-900 transition-colors"
                            />
                            <div className="absolute bottom-2 right-2 text-[10px] font-bold text-neutral-400">
                                {content.length}
                            </div>
                        </div>

                        {/* Extra Metadata Inputs (Character & WatchTime) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="relative" ref={characterInputRef}>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    İlgili Karakter <span className="text-[10px] text-neutral-400 normal-case">(Opsiyonel)</span>
                                </label>
                                <input
                                    type="text"
                                    value={characterInput}
                                    onChange={e => {
                                        setCharacterInput(e.target.value);
                                        setShowCharacterDropdown(true);
                                    }}
                                    onFocus={() => setShowCharacterDropdown(true)}
                                    placeholder="Listeden seç veya yaz"
                                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 text-sm font-medium text-neutral-900 dark:text-white placeholder-neutral-400 border border-transparent focus:border-indigo-500/50 outline-none transition-colors"
                                />
                                {showCharacterDropdown && cast.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                                        {cast
                                            .filter(c => c.character.toLowerCase().includes(characterInput.toLowerCase()) || c.name.toLowerCase().includes(characterInput.toLowerCase()))
                                            .map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => {
                                                    setCharacterInput(c.character);
                                                    setShowCharacterDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex flex-col border-b border-neutral-100 dark:border-neutral-800/50 last:border-0"
                                            >
                                                <span className="text-sm font-bold text-neutral-900 dark:text-white">{c.character}</span>
                                                <span className="text-xs text-neutral-500">{c.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Zaman / Bölüm <span className="text-[10px] text-neutral-400 normal-case">(Opsiyonel)</span>
                                </label>
                                <input
                                    type="text"
                                    value={watchTimeInput}
                                    onChange={e => setWatchTimeInput(e.target.value)}
                                    placeholder="Örn: S1 B4 veya 45. Dakika"
                                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 text-sm font-medium text-neutral-900 dark:text-white placeholder-neutral-400 border border-transparent focus:border-indigo-500/50 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            {/* Spoiler Toggle */}
                            <label className="flex items-center gap-3 cursor-pointer group select-none">
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${hasSpoiler ? 'bg-red-500' : 'bg-neutral-200 dark:bg-neutral-800'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${hasSpoiler ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                                <span className={`text-xs font-bold transition-colors ${hasSpoiler ? 'text-red-500' : 'text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'}`}>Spoiler Uyarısı</span>
                                <input type="checkbox" checked={hasSpoiler} onChange={e => setHasSpoiler(e.target.checked)} className="hidden" />
                            </label>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">İptal</button>
                                <button type="submit" disabled={addMutation.isPending} className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95 disabled:opacity-50">
                                    {addMutation.isPending ? 'Yayınlanıyor...' : (myReview ? 'Güncelle' : 'Gönder')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                {/* Decorative Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.2rem] opacity-20 blur-lg -z-10"></div>
            </div>
        )}

        <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 pb-4">
            {ownerReview && (
                <div className="relative">
                    <div className="absolute -left-3 top-6 -bottom-6 w-1 bg-gradient-to-b from-indigo-500 to-transparent rounded-full opacity-20"></div>
                    <ReviewCard 
                        review={getDisplayReview(ownerReview)} 
                        highlighted={true} 
                        currentUserId={user?.id} 
                        onEdit={() => { setIsEditing(true); window.scrollTo({top:0, behavior:'smooth'}); }} 
                        onDelete={handleDelete} 
                        onReport={handleOpenReport}
                        onVote={handleVote}
                        revealedSpoilers={revealedSpoilers} 
                        toggleSpoiler={(id) => { const s = new Set(revealedSpoilers); s.has(id)?s.delete(id):s.add(id); setRevealedSpoilers(s); }} 
                    />
                </div>
            )}

            <div className="grid gap-6">
                {filteredReviews.length > 0 ? (
                    filteredReviews.map(review => (
                        <ReviewCard 
                            key={review.id} 
                            review={getDisplayReview(review)} 
                            currentUserId={user?.id} 
                            onEdit={() => { 
                                setIsEditing(true); 
                                setContent(review.comment); 
                                setRating(review.rating); 
                                setHasSpoiler(review.hasSpoiler || false); 
                                setCharacterInput(review.character || '');
                                setWatchTimeInput(review.watchTime || '');
                                const tags = review.tags && review.tags.length > 0 ? review.tags : (review.category ? [review.category] : ['REVIEW' as PostCategory]);
                                setSelectedTags(tags);
                                window.scrollTo({top:0, behavior:'smooth'}); 
                            }} 
                            onDelete={handleDelete} 
                            onReport={handleOpenReport}
                            onVote={handleVote}
                            revealedSpoilers={revealedSpoilers} 
                            toggleSpoiler={(id) => { const s = new Set(revealedSpoilers); s.has(id)?s.delete(id):s.add(id); setRevealedSpoilers(s); }} 
                        />
                    ))
                ) : (
                    !ownerReview && !isLoadingGlobal && !isEditing && (
                        <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
                            <p className="text-neutral-500 font-medium">Henüz bir yorum yok. İlk sen ol!</p>
                        </div>
                    )
                )}
            </div>
            
            {hasNextPage && (
                <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="w-full py-4 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors uppercase tracking-widest bg-neutral-50 dark:bg-neutral-900/50 rounded-xl mt-4 border border-neutral-100 dark:border-neutral-800">
                    {isFetchingNextPage ? 'Yükleniyor...' : 'Daha Fazla Göster'}
                </button>
            )}
        </div>
    </div>
  );
};

export default ReviewSection;