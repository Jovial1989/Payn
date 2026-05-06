import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "payn-admin-session";
const SESSION_MAX_AGE_MS = 28800 * 1000;

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyToken(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "dev-secret-change-me";
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return false;
  const payload = token.slice(0, dotIdx);
  const mac = token.slice(dotIdx + 1);
  if (!payload.startsWith("admin:")) return false;
  const ts = Number(payload.slice("admin:".length));
  if (isNaN(ts) || Date.now() - ts > SESSION_MAX_AGE_MS) return false;
  const expected = await hmacHex(secret, payload);
  if (expected.length !== mac.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ mac.charCodeAt(i);
  }
  return diff === 0;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminLogin = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/v1/admin/");

  const token = request.cookies.get(SESSION_COOKIE)?.value ?? "";
  const authenticated = token ? await verifyToken(token) : false;

  if (isAdminApi) {
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (!isAdminLogin && !authenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/v1/admin/:path*"],
};
