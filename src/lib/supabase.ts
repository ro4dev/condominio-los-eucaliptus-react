import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Cliente Supabase opcional. Las credenciales se leen de variables de entorno
// (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Sin ellas, el modo demo funciona
// igual y la app no toca Supabase. Nunca hardcodear credenciales aquí.

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseClient: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
