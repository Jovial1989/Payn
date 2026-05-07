import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSession, SESSION_COOKIE } from "@/lib/admin-auth-edge";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { username, password } = body as { username?: string; password?: string };

  const validUsername =
    username === env.adminUsername || username === "admin@admin.com";
  if (!env.adminPassword || !validUsername || password !== env.adminPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createAdminSession();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 28800,
  });

  return NextResponse.json({ ok: true });
}
