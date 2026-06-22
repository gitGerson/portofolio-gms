import { createClient } from "@supabase/supabase-js";

/**
 * Anonymous, cookie-less Supabase client for PUBLIC catalog reads
 * (products, categories, brands — all `select using (true)` under RLS).
 *
 * Because it never touches `cookies()`, pages that read through it are NOT
 * forced into dynamic rendering and can be cached / ISR-revalidated.
 * Do not use for anything user- or auth-specific.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
