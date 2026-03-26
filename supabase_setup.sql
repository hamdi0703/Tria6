CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT DEFAULT '1',
  banner_url TEXT, -- Profil kapak fotoğrafı
  bio TEXT,
  website TEXT,
  location TEXT, -- Kullanıcı konumu (örn: "Istanbul, TR")
  social_links JSONB DEFAULT '{}'::jsonb, -- Esnek yapı: {"twitter": "...", "instagram": "...", "letterboxd": "..."}
  preferences JSONB DEFAULT '{"theme": "system", "language": "tr", "notifications": true, "adult_content": false}'::jsonb, -- Kullanıcı ayarları
  stats JSONB DEFAULT '{"xp": 0, "level": 1, "badges": [], "login_streak": 0}'::jsonb, -- Oyunlaştırma verileri
  is_public BOOLEAN DEFAULT true,
  is_blocked BOOLEAN DEFAULT false,
  tier public.subscription_tier DEFAULT 'BASIC',
  last_seen_at TIMESTAMP WITH TIME ZONE, -- Son görülme zamanı
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);