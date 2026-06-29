import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchWithTimeout } from "@/lib/supabase/fetch";

/** Cookie-less Supabase client for public cached/server reads. */
export function createPublicSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    global: { fetch: fetchWithTimeout },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
