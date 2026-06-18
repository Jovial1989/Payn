import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-auth-edge";
import { isSupportedLocale, detectPreferencesFromAcceptLanguage } from "@/lib/marketplace";

const PUBLIC_FILE = /\.(.*)$/;
const LOCALE_SKIP = ["/_next", "/api", "/auth", "/admin", "/icon.svg", "/kyrylo.jpeg"];

// SEC-FIX AUTH-001 / AUTH-008: only app_metadata.role is trusted (server-set,
// immutable from client side). user_metadata.role is user-editable via
// supabase.auth.updateUser() — accepting it grants any registered user admin
// access. Hardcoded "admin@admin.com" is replaced by ADMIN_USERNAME env var.
function isAdminUser(
  email: string | undefined,
  appMeta: Record<string, unknown> | undefined,
): boolean {
  const adminEmail = process.env.ADMIN_USERNAME ?? "";
  return Boolean(
    (adminEmail && email === adminEmail) ||
    appMeta?.role === "admin",
  );
}

async function handleAdminAuth(request: NextRequest, pathname: string): Promise<NextResponse> {
  if (pathname === "/admin/login" || pathname === "/api/v1/admin/login") {
    return NextResponse.next({ request });
  }

  const adminCookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (adminCookie && (await verifyAdminSession(adminCookie))) {
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (pathname.startsWith("/api/v1/admin/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = isAdminUser(
    user?.email,
    user?.app_metadata as Record<string, unknown> | undefined,
  );

  if (pathname.startsWith("/api/v1/admin/")) {
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return response;
  }

  if (!admin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

function handleLocale(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (PUBLIC_FILE.test(pathname) || LOCALE_SKIP.some((p) => pathname.startsWith(p))) {
    return null;
  }

  const activeLocale = request.headers.get("x-payn-locale");
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (activeLocale && isSupportedLocale(activeLocale)) {
    return null;
  }

  if (firstSegment && isSupportedLocale(firstSegment)) {
    const locale = firstSegment;
    const restPath = "/" + segments.slice(1).join("/");
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-payn-locale", locale);
    // Preserve the query string — `new URL(restPath, …)` drops it because
    // restPath is path-only. Without this, /en/start/pack?goals=… (and every
    // ?context=/?type= deep link) loses its params on the locale rewrite, so
    // the page renders as if nothing was passed ("Nothing selected" bug).
    const rewriteUrl = new URL(restPath, request.url);
    rewriteUrl.search = request.nextUrl.search;
    const response = NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
    response.headers.set("x-payn-locale", locale);
    response.cookies.set("payn-locale", locale, { path: "/", maxAge: 31536000 });
    return response;
  }

  const cookieLocale = request.cookies.get("payn-locale")?.value;
  const detected = detectPreferencesFromAcceptLanguage(request.headers.get("accept-language"));
  const locale =
    cookieLocale && isSupportedLocale(cookieLocale) ? cookieLocale : detected.locale;

  const redirectUrl = new URL(`/${locale}${pathname}`, request.url);
  redirectUrl.search = request.nextUrl.search;
  return NextResponse.redirect(redirectUrl, 308);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // SEC-FIX PAYN-A04: extend admin auth guard to cover /api/admin/* namespace
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/v1/admin") ||
    pathname.startsWith("/api/admin")
  ) {
    return handleAdminAuth(request, pathname);
  }

  return handleLocale(request) ?? NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
