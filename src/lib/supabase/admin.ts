import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client with the SECRET key (service role).
 * This bypasses RLS and must ONLY be used server-side (never in client
 * components). Used for admin operations, storage, and auth admin APIs.
 *
 * For user-scoped operations (session-aware), use `createClient()` from
 * `lib/supabase/server.ts` (publishable key + cookies).
 */
const globalForSupabase = globalThis as unknown as { __sbAdmin?: SupabaseClient };

export function getAdminClient(): SupabaseClient {
  if (globalForSupabase.__sbAdmin) return globalForSupabase.__sbAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env"
    );
  }

  globalForSupabase.__sbAdmin = createSupabaseClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return globalForSupabase.__sbAdmin;
}
