import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-auth-edge";

function isAdminUser(email: string | undefined, appMeta: Record<string, unknown> | undefined, userMeta: Record<string, unknown> | undefined): boolean {
  return (
    email === "admin@admin.com" ||
    appMeta?.role === "admin" ||
    userMeta?.role === "admin"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the admin login page and login API through without auth check
  if (pathname === "/admin/login" || pathname === "/api/v1/admin/login") {
    return NextResponse.next({ request });
  }

  // Accept the HMAC cookie from the admin-login endpoint (no Supabase needed)
  const adminCookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (adminCookie && await verifyAdminSession(adminCookie)) {
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, block all admin access
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

  // getUser() validates the JWT server-side — not spoofable from the client
  const { data: { user } } = await supabase.auth.getUser();
  const admin = isAdminUser(
    user?.email,
    user?.app_metadata as Record<string, unknown> | undefined,
    user?.user_metadata as Record<string, unknown> | undefined,
  );

  if (pathname.startsWith("/api/v1/admin/")) {
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return response;
  }

  // /admin/* pages
  if (!admin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/v1/admin/:path*"],
};
