
import React from 'react';

// 'report' tipi eklendi
export type FeedbackType = 'bug' | 'idea' | 'contact' | 'other' | 'report';

export const FEEDBACK_CATEGORIES: { id: FeedbackType; label: string; sub: string; color: string; bg: string; icon: React.ReactNode }[] = [
    { 
        id: 'idea', 
        label: 'Öneri', 
        sub: 'Yeni özellik fikri',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    },
    { 
        id: 'bug', 
        label: 'Hata', 
        sub: 'Bir sorun var',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    },
    { 
        id: 'contact', 
        label: 'İletişim', 
        sub: 'Bize ulaşın',
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-100 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
    },
    { 
        id: 'other', 
        label: 'Diğer', 
        sub: 'Genel görüş',
        color: 'text-teal-600 dark:text-teal-400',
        bg: 'bg-teal-100 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    },
    // UI'da göstermiyoruz ama type olarak tanımlı kalmalı
    {
        id: 'report',
        label: 'Şikayet',
        sub: 'İçerik Bildirimi',
        color: 'text-gray-600',
        bg: 'bg-gray-100',
        icon: null
    }
];
