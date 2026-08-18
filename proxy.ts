import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (Next.js 16 middleware) — refreshes Supabase auth session cookies and
 * protects /admin routes. Unauthenticated admin requests redirect to
 * /admin/login. The final role check still happens server-side in
 * src/lib/admin/auth.ts (requireAdmin) — the proxy only does the optimistic
 * session refresh + redirect.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  console.log(
    `[proxy] path=${path} user=${user?.email ?? "none"} cookies=${request.cookies
      .getAll()
      .map((c) => c.name)
      .join(",") || "none"}`
  );

  if (path.startsWith("/admin")) {
    const isLogin = path === "/admin/login";
    if (!user && !isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
    if (user && isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Run on admin routes only. Static assets, API routes and the public site
     * are untouched.
     */
    "/admin/:path*",
  ],
};
