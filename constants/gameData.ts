
// --- ÜLKE LİSTESİ ---
export const COUNTRY_MAP: Record<string, string> = {
    // Kuzey Amerika
    'US': '🇺🇸 Amerika', 'CA': '🇨🇦 Kanada', 'MX': '🇲🇽 Meksika',
    // Avrupa
    'GB': '🇬🇧 Birleşik Krallık', 'FR': '🇫🇷 Fransa', 'DE': '🇩🇪 Almanya', 'IT': '🇮🇹 İtalya',
    'ES': '🇪🇸 İspanya', 'NL': '🇳🇱 Hollanda', 'BE': '🇧🇪 Belçika', 'CH': '🇨🇭 İsviçre',
    'AT': '🇦🇹 Avusturya', 'IE': '🇮🇪 İrlanda', 'SE': '🇸🇪 İsveç', 'NO': '🇳🇴 Norveç',
    'DK': '🇩🇰 Danimarka', 'FI': '🇫🇮 Finlandiya', 'IS': '🇮🇸 İzlanda', 'TR': '🇹🇷 Türkiye',
    'RU': '🇷🇺 Rusya', 'PL': '🇵🇱 Polonya', 'CZ': '🇨🇿 Çekya', 'HU': '🇭🇺 Macaristan',
    'RO': '🇷🇴 Romanya', 'GR': '🇬🇷 Yunanistan', 'PT': '🇵🇹 Portekiz', 'UA': '🇺🇦 Ukrayna',
    // Asya / Pasifik
    'KR': '🇰🇷 Güney Kore', 'JP': '🇯🇵 Japonya', 'CN': '🇨🇳 Çin', 'HK': '🇭🇰 Hong Kong',
    'TW': '🇹🇼 Tayvan', 'IN': '🇮🇳 Hindistan', 'TH': '🇹🇭 Tayland', 'ID': '🇮🇩 Endonezya',
    'PH': '🇵🇭 Filipinler', 'VN': '🇻🇳 Vietnam', 'AU': '🇦🇺 Avustralya', 'NZ': '🇳🇿 Yeni Zelanda',
    // Güney Amerika / Diğer
    'BR': '🇧🇷 Brezilya', 'AR': '🇦🇷 Arjantin', 'CO': '🇨🇴 Kolombiya', 'CL': '🇨🇱 Şili',
    'IR': '🇮🇷 İran', 'IL': '🇮🇱 İsrail', 'EG': '🇪🇬 Mısır', 'ZA': '🇿🇦 Güney Afrika', 'NG': '🇳🇬 Nijerya'
};

// --- CINE ROULETTE GÖRSELLERİ (Sadece Türkçe) ---
export const ROULETTE_GENRE_STYLES: Record<string, { bg: string, text: string, border: string }> = {
    'Aksiyon': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    'Macera': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    'Animasyon': { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
    'Komedi': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    'Suç': { bg: 'bg-zinc-500/20', text: 'text-zinc-300', border: 'border-zinc-500/30' },
    'Belgesel': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    'Dram': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    'Aile': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    'Fantastik': { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30' },
    'Korku': { bg: 'bg-green-900/40', text: 'text-green-500', border: 'border-green-700/50' },
    'Gizem': { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    'Romantik': { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
    'Bilim Kurgu': { bg: 'bg-blue-600/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    'Gerilim': { bg: 'bg-slate-600/20', text: 'text-slate-300', border: 'border-slate-500/30' },
    'Savaş': { bg: 'bg-stone-600/20', text: 'text-stone-400', border: 'border-stone-500/30' },
    'Western': { bg: 'bg-amber-700/20', text: 'text-amber-500', border: 'border-amber-600/30' },
};

// Also export as SLOT_GENRE_STYLES for CineSlotView compatibility
export const SLOT_GENRE_STYLES = ROULETTE_GENRE_STYLES;
