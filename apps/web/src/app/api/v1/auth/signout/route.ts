import type { CookieOptions } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { SESSION_COOKIE } from "@/lib/admin-auth-edge";

// Extract Supabase project ref from the URL, e.g.
// "https://xxyawuovvaklpsafzcqc.supabase.co" → "xxyawuovvaklpsafzcqc"
function getProjectRef(supabaseUrl: string): string {
  try {
    return new URL(supabaseUrl).hostname.split(".")[0];
  } catch {
    return "";
  }
}

async function clearAllAuthCookies(res: NextResponse) {
  // Always clear the admin session cookie
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });

  if (!env.supabaseUrl || !env.supabaseAnonKey) return;

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const projectRef = getProjectRef(env.supabaseUrl);

  // Explicitly clear every Supabase auth-token cookie (including chunked variants
  // like sb-{ref}-auth-token.0, .1, etc.) regardless of whether signOut() calls
  // setAll — which it does NOT always do if the session is already gone.
  for (const cookie of allCookies) {
    if (
      cookie.name.startsWith(`sb-${projectRef}-auth-token`) ||
      cookie.name === `sb-${projectRef}-auth-token`
    ) {
      res.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
    }
  }

  // Also call signOut() server-side to invalidate the refresh token in Supabase.
  try {
    const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Belt-and-suspenders: if Supabase does call setAll, apply those too.
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    });
    await supabase.auth.signOut();
  } catch {
    // Ignore — cookies are already being cleared explicitly above.
  }
}

// GET /api/v1/auth/signout
// The browser navigates here via window.location.replace(). The server clears
// all auth cookies explicitly (by name) and issues a 302 redirect. Because the
// Set-Cookie clear headers are on the redirect response itself, the browser
// applies them before loading the destination page — guaranteed.
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const locale = request.cookies.get("payn-locale")?.value ?? "en";

  const res = NextResponse.redirect(`${origin}/${locale}/`, {
    status: 302,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });

  await clearAllAuthCookies(res);
  return res;
}

// POST /api/v1/auth/signout — kept for backward compatibility (admin sidebar).
export async function POST() {
  const res = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );

  await clearAllAuthCookies(res);
  return res;
}
