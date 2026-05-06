import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSession, SESSION_COOKIE } from "@/lib/admin-auth";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { username, password } = body as { username?: string; password?: string };

  if (
    !env.adminUsername ||
    !env.adminPassword ||
    username !== env.adminUsername ||
    password !== env.adminPassword
  ) {
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
