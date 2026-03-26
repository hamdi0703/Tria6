
// Prodüksiyon URL'i (Canlı Site - Zorunlu)
export const PRODUCTION_URL = 'https://izlemelistem.vercel.app';

/**
 * Paylaşım bağlantılarını oluştururken kullanılacak kök adresi belirler.
 * Localhost'ta geliştirme yaparken yerel adresi kullanır (Test kolaylığı için), 
 * aksi takdirde zorunlu olarak Production URL'ini kullanır.
 */
const getBaseUrl = (): string => {
    // Tarayıcı ortamında değilsek (SSR vs.) güvenli dönüş
    if (typeof window === 'undefined') return PRODUCTION_URL;

    const hostname = window.location.hostname;
    // Sadece localhost veya yerel IP ise yerel adresi kullan
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');

    // Sondaki slash'ı temizle (varsa)
    const base = isLocal ? window.location.origin : PRODUCTION_URL;
    return base.replace(/\/$/, '');
};

/**
 * Koleksiyon paylaşım linki oluşturur.
 * Örnek: https://izlemelistem.vercel.app/?collection=xyz123
 */
export const getCollectionShareUrl = (token: string): string => {
    if (!token) return '';
    const baseUrl = getBaseUrl();
    return `${baseUrl}/?collection=${encodeURIComponent(token)}`;
};

/**
 * Profil paylaşım linki oluşturur.
 * Örnek: https://izlemelistem.vercel.app/?u=username
 */
export const getProfileShareUrl = (username: string): string => {
    if (!username) return '';
    const baseUrl = getBaseUrl();
    return `${baseUrl}/?u=${encodeURIComponent(username)}`;
};
