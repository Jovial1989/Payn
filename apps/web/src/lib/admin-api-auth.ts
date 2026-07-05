import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-auth-edge";
import { createSupabaseServerClient } from "@/server/supabase/client";

// Admin API auth — accepts ANY of three credentials:
//   1. `x-admin-token` header == env.adminApiToken (scripts, external)
//   2. `payn-admin-session` cookie (the in-app /admin/login flow)
//   3. A Supabase user whose app_metadata.role === "admin" (server-set only).
//      NOTE: user_metadata is user-editable via supabase.auth.updateUser()
//      and MUST NOT be trusted for privilege checks. Only app_metadata is
//      immutable from the client side.
//
// SEC-FIX AUTH-001: removed userMeta?.role check (user-editable → privilege
//   escalation for any registered user).
// SEC-FIX AUTH-008: removed hardcoded "admin@admin.com" fallback (permanent
//   backdoor — use ADMIN_USERNAME env var instead).
function isAdminUser(
  email: string | undefined,
  appMeta: Record<string, unknown> | undefined | null,
): boolean {
  const adminEmail = process.env.ADMIN_USERNAME ?? "";
  return Boolean(
    (adminEmail && email === adminEmail) ||
    appMeta?.role === "admin",
  );
}

export async function checkAdminToken(
  request: Request,
): Promise<NextResponse | null> {
  const token = request.headers.get("x-admin-token");
  if (env.adminApiToken && token === env.adminApiToken) return null;

  // Cookie value parser must handle JWTs — they end with base64 padding
  // (`=` characters), so naive `.split("=")` truncates the token at the
  // first padding char and verification fails with a misleading 401.
  // Use indexOf to split on the FIRST `=` only.
  const cookieHeader = request.headers.get("cookie") ?? "";
  let sessionCookie: string | undefined;
  for (const raw of cookieHeader.split(/;\s*/)) {
    const eq = raw.indexOf("=");
    if (eq < 0) continue;
    const name = raw.slice(0, eq);
    if (name === SESSION_COOKIE) {
      sessionCookie = raw.slice(eq + 1);
      break;
    }
  }
  if (sessionCookie) {
    // Next.js serialises cookie values with encodeURIComponent (the `cookie`
    // npm package default), so the raw Cookie header contains the encoded
    // form — e.g. "admin%3A<ts>.<mac>" instead of "admin:<ts>.<mac>".
    // request.cookies.get() in middleware decodes automatically; this manual
    // parser does not, causing verifyAdminSession to fail on the raw value.
    let decoded = sessionCookie;
    try { decoded = decodeURIComponent(sessionCookie); } catch { /* keep raw */ }
    if (await verifyAdminSession(decoded)) return null;
  }

  // Supabase fallback — same admin-role test middleware uses to gate
  // /admin/* page routes. Lets the in-panel API calls (mail compose,
  // user picker, parser, push, etc.) inherit the user's Supabase admin
  // session without requiring a separate /admin/login pass.
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (
      user &&
      isAdminUser(
        user.email,
        user.app_metadata as Record<string, unknown> | null,
      )
    ) {
      return null;
    }
  } catch {
    /* fall through to 401 */
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
