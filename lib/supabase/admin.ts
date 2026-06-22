import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Privileged service-role client. Bypasses RLS — use ONLY in server actions /
 * route handlers for trusted operations (payment-proof upload, signed URLs).
 * Never import this into a Client Component.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
