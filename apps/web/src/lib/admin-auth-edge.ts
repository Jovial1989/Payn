// Edge-runtime-compatible subset of admin-auth — no next/headers import

export const SESSION_COOKIE = "payn-admin-session";
const SESSION_MAX_AGE_MS = 28800 * 1000; // 8 hours

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  // SEC-FIX AUTH-005: fail hard rather than silently use a public fallback.
  if (!s) throw new Error("ADMIN_SESSION_SECRET env var must be set");
  return s;
}

async function hmacHex(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyHmac(message: string, hex: string): Promise<boolean> {
  const expected = await hmacHex(message);
  if (expected.length !== hex.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ hex.charCodeAt(i);
  }
  return diff === 0;
}

export async function createAdminSession(): Promise<string> {
  const ts = Date.now().toString();
  const mac = await hmacHex(`admin:${ts}`);
  return `admin:${ts}.${mac}`;
}

export async function verifyAdminSession(token: string): Promise<boolean> {
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return false;
  const payload = token.slice(0, dotIdx);
  const mac = token.slice(dotIdx + 1);
  if (!payload.startsWith("admin:")) return false;
  const ts = Number(payload.slice("admin:".length));
  if (isNaN(ts) || Date.now() - ts > SESSION_MAX_AGE_MS) return false;
  return verifyHmac(payload, mac);
}
