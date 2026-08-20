import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Proxy (Next.js 16 middleware) — composed pipeline:
 * 1. next-intl locale negotiation (redirect `/` → `/{locale}`, cookie, hreflang).
 * 2. Supabase auth session refresh + /admin route protection — works with or
 *    without a locale prefix (`/admin` or `/en/admin`).
 *
 * The proxy guard is optimistic UX only; the authoritative auth check stays in
 * src/lib/admin/auth.ts (requireAdmin) server-side.
 */
const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Step 1: locale negotiation + redirects/rewrites.
  const response = handleI18nRouting(request);

  // Step 2: admin guard (optionally prefixed by a locale).
  const adminMatch = path.match(/^\/(en|vi)?\/?admin(?:\/.*)?$/);
  if (adminMatch) {
    const isLogin = path.endsWith("/admin/login");
    const locale = adminMatch[1] ?? routing.defaultLocale;

    // Refresh Supabase auth session cookies onto the i18n response.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Do not run code between createServerClient and auth.getUser().
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log(
      `[proxy] path=${path} user=${user?.email ?? "none"} cookies=${request.cookies
        .getAll()
        .map((c) => c.name)
        .join(",") || "none"}`
    );

    if (!user && !isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/admin/login`;
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
    if (user && isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/admin`;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Run on all paths except API routes, static assets and files with dots.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
