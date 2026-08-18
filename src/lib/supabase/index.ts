import "server-only";

/**
 * Supabase server utilities (server-only).
 * - getAdminClient(): service-role client (bypasses RLS) for admin/storage/auth.
 * - User-session client lives in lib/supabase/server.ts (SSR cookies).
 */

export * from "./admin";
