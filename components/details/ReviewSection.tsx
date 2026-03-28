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

import { Cast } from '../../types'; // Import for characters

interface ReviewSectionProps {
  movieId: number;
  movieTitle: string;
  cast?: Cast[]; // Optional cast data from parent
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
    const [isExpanded, setIsExpanded] = useState(false);
    const isRevealed = revealedSpoilers.has(review.id || 'unknown');
    
    // Normalize Tags
    const displayTags = review.tags && review.tags.length > 0 
        ? review.tags 
        : (review.category ? [review.category] : ['REVIEW']);

    const timeAgo = new Date(review.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    // Optimistic Vote Display (Simple)
    const voteStatus = review.currentUserVote; // 'UP', 'DOWN', or null

    return (
        <div className={`group relative p-6 rounded-[2rem] border transition-all duration-300 backdrop-blur-sm ${highlighted ? 'bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5' : 'bg-white/80 dark:bg-neutral-900/40 border-neutral-200/60 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-white dark:hover:bg-neutral-900/80 shadow-sm hover:shadow-md'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4 w-full">
                    {/* AVATAR */}
                    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-tr from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 p-[2px] shadow-sm relative">
                        <img src={getAvatarUrl(review.avatar_url)} alt={review.username} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-neutral-900" />
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-900 rounded-full p-[2px] shadow-sm">
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full px-1.5 py-0.5 text-[8px] font-black flex items-center gap-0.5">
                                ★ {review.rating}
                            </div>
                        </div>
                    </div>

                    {/* USER INFO & METADATA */}
                    <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 truncate">
                                <span className="font-black text-neutral-900 dark:text-white text-base truncate">{review.username}</span>
                                <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 whitespace-nowrap">• {timeAgo}</span>
                            </div>
                        </div>

                        {/* BADGES ROW */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* TAGS */}
                            {displayTags.map(tagId => {
                                const config = getTagConfig(tagId);
                                return (
                                    <span key={tagId} className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg font-bold border shadow-sm ${config.bgClass} ${config.colorClass} ${config.borderClass}`}>
                                        {config.icon}
                                        {config.label}
                                    </span>
                                );
                            })}

                            {/* EXTRA METADATA */}
                            {(review.sceneTime || review.character) && (
                                <div className="flex items-center gap-2 ml-1 border-l border-neutral-200 dark:border-neutral-800 pl-3">
                                    {review.character && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                                            <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            {review.character}
                                        </span>
                                    )}
                                    {review.sceneTime && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                                            <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {review.sceneTime}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* ACTIONS */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4 flex-shrink-0">
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

            {/* COMMENT CONTENT */}
            {review.hasSpoiler && !isRevealed && !isMe ? (
                <div className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 group/spoiler cursor-pointer" onClick={() => toggleSpoiler(review.id || 'unknown')}>
                    <div className="absolute inset-0 backdrop-blur-md bg-white/60 dark:bg-black/60 z-10 flex flex-col items-center justify-center transition-all duration-300 group-hover/spoiler:backdrop-blur-sm group-hover/spoiler:bg-white/40 dark:group-hover/spoiler:bg-black/40">
                        <span className="text-sm font-black text-red-500 tracking-widest uppercase flex items-center gap-2 drop-shadow-md">
                            <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            Spoiler İçeriyor
                        </span>
                        <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-bold mt-2 opacity-0 group-hover/spoiler:opacity-100 transition-opacity translate-y-2 group-hover/spoiler:translate-y-0 duration-300">Görüntülemek için tıkla</span>
                    </div>
                    {/* Blurred hint of content behind */}
                    <p className="text-sm leading-relaxed text-neutral-400 dark:text-neutral-600 whitespace-pre-wrap break-words font-medium p-4 blur-sm opacity-50 select-none">
                        {review.comment}
                    </p>
                </div>
            ) : (
                <div className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap break-words font-medium">
                    {review.comment && review.comment.length > 100 && !isExpanded ? (
                        <>
                            {review.comment.substring(0, 100)}...
                            <button onClick={() => setIsExpanded(true)} className="ml-2 text-indigo-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-wide">
                                Devamını Oku
                            </button>
                        </>
                    ) : (
                        review.comment
                    )}
                </div>
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
                    <svg className={`w-5 h-5 transition-transform duration-300 ${voteStatus === 'UP' ? 'fill-current scale-110 -translate-y-0.5' : 'stroke-current fill-none hover:-translate-y-0.5'}`} viewBox="0 0 24 24" strokeWidth={2}>
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
                    <svg className={`w-5 h-5 transition-transform duration-300 ${voteStatus === 'DOWN' ? 'fill-current scale-110 translate-y-0.5' : 'stroke-current fill-none hover:translate-y-0.5'}`} viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    {review.downvotes > 0 && <span>{review.downvotes}</span>}
                </button>
            </div>
        </div>
    );
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ movieId, movieTitle, cast }) => {
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
  const [sceneTime, setSceneTime] = useState('');
  const [character, setCharacter] = useState('');
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());
  
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
          setSceneTime(myReview.sceneTime || '');
          setCharacter(myReview.character || '');
          setHasSpoiler(myReview.hasSpoiler || false);
          const tags = myReview.tags && myReview.tags.length > 0 
            ? myReview.tags 
            : (myReview.category ? [myReview.category] : ['REVIEW' as PostCategory]);
          setSelectedTags(tags);
      } else if (!isEditing) {
          setRating(0);
          setContent('');
          setSceneTime('');
          setCharacter('');
          setHasSpoiler(false);
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
              sceneTime,
              character,
              hasSpoiler, 
              tags: selectedTags 
          };
          
          await addMutation.mutateAsync(payload);
          
          // SYNC: Update Global Context for "My Reviews" instantly
          const reviewForContext: UserReview = {
              ...payload,
              createdAt: new Date().toISOString(),
              upvotes: myReview?.upvotes || 0,
              downvotes: myReview?.downvotes || 0,
              user_id: user!.id,
              username: user!.user_metadata?.username
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

          setRating(0); setContent(''); setIsEditing(false); setSelectedTags(['REVIEW']);
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
            <div id="review-editor-area" className="relative animate-slide-in-up">
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

                        {/* EXTRA FIELDS: SCENE TIME AND CHARACTER */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Sahne Zamanı</label>
                                <input
                                    type="text"
                                    placeholder="Örn: 01:23"
                                    value={sceneTime}
                                    onChange={(e) => setSceneTime(e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl text-sm text-neutral-900 dark:text-white border border-transparent focus:border-indigo-500/50 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Karakter</label>
                                <select
                                    value={character}
                                    onChange={(e) => setCharacter(e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl text-sm text-neutral-900 dark:text-white border border-transparent focus:border-indigo-500/50 outline-none transition-colors appearance-none"
                                >
                                    <option value="">Seçiniz...</option>
                                    {cast && Array.isArray(cast) && cast.slice(0, 20).map(c => (
                                        <option key={c.id} value={c.name}>{c.name} ({c.character})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="relative mb-6">
                            {rating === 0 && (
                                <div className="absolute inset-0 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
                                    <span className="text-sm font-bold text-neutral-500 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        Yorum yazmadan önce lütfen bir puan verin
                                    </span>
                                </div>
                            )}
                            <textarea
                                value={content}
                                onChange={e => {
                                    if (e.target.value.length <= 1000) {
                                        setContent(e.target.value);
                                    }
                                }}
                                disabled={rating === 0}
                                placeholder={`"${movieTitle}" hakkında düşüncelerin neler?`}
                                className={`w-full min-h-[160px] bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl text-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 outline-none resize-none leading-relaxed font-medium border focus:bg-white dark:focus:bg-neutral-900 transition-colors ${rating === 0 ? 'border-transparent opacity-50 cursor-not-allowed' : 'border-transparent focus:border-indigo-500/50'}`}
                            />
                            <div className={`absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${content.length >= 950 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
                                {content.length} / 1000
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

        <div className="space-y-6">
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
                                const tags = review.tags && review.tags.length > 0 ? review.tags : (review.category ? [review.category] : ['REVIEW' as PostCategory]);
                                setSelectedTags(tags);

                                setTimeout(() => {
                                    const editor = document.getElementById('review-editor-area');
                                    if (editor) {
                                        editor.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        // Auto focus text area
                                        const textarea = editor.querySelector('textarea');
                                        if (textarea) textarea.focus();
                                    }
                                }, 100);
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
                <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="w-full py-4 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors uppercase tracking-widest">
                    {isFetchingNextPage ? 'Yükleniyor...' : 'Daha Fazla Göster'}
                </button>
            )}
        </div>
    </div>
  );
};

export default ReviewSection;