/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Fix: Added reference to vite/client to resolve import.meta.env error
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Supabase konfigürasyonu eksik! Lütfen .env dosyasını kontrol edin.");
}

export const supabase = createClient(
    SUPABASE_URL || '', 
    SUPABASE_ANON_KEY || ''
);
