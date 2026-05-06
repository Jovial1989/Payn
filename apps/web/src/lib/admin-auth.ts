import { cookies } from "next/headers";

export const SESSION_COOKIE = "payn-admin-session";
const SESSION_MAX_AGE = 28800; // 8 hours

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "dev-secret-change-me";
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
  // Constant-time comparison
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
  if (isNaN(ts) || Date.now() - ts > SESSION_MAX_AGE * 1000) return false;
  return verifyHmac(payload, mac);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return false;
    return verifyAdminSession(token);
  } catch {
    return false;
  }
}
