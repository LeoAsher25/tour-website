import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { mapAdminUser } from "@/lib/db/mappers";
import type { AdminRole } from "@/types/domain";

/**
 * Admin authentication + authorization (server-only).
 *
 * - Session comes from Supabase Auth cookies (managed by the SSR client).
 * - Authorization joins the Supabase Auth user to `admin_users` and checks the
 *   role. Only active admin_users rows can access the admin.
 * - No public admin registration: admin_users rows are created by the seed or
 *   by a super_admin.
 *
 * `getCurrentAdmin` is wrapped in React `cache()` so the layout + page within
 * one request share a single Supabase getUser() + DB query instead of running
 * them per component.
 */

export async function getSession() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — middleware refreshes sessions.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

/** The admin_users row for the current session, or null (cached per request). */
export const getCurrentAdmin = cache(async () => {
  const { user } = await getSession();
  if (!user) return null;

  const rows = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.authUserId, user.id))
    .limit(1);

  if (rows.length === 0 || !rows[0].isActive) return null;
  return mapAdminUser(rows[0]);
});

/** Server-side guard — redirects to /admin/login when unauthenticated. */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}

/** Server-side guard for specific roles. */
export async function requireRole(...roles: AdminRole[]) {
  const admin = await requireAdmin();
  if (!roles.includes(admin.role)) {
    redirect("/admin");
  }
  return admin;
}

export async function signOut() {
  const { supabase } = await getSession();
  await supabase.auth.signOut();
}

export async function signIn(email: string, password: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Components; proxy refreshes sessions.
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { error: error.message };
  return { user: data.user };
}
