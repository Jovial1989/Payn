import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, SESSION_COOKIE } from "@/lib/admin-auth-edge";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (
    !adminUsername ||
    !adminPassword ||
    email !== adminUsername ||
    password !== adminPassword
  ) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createAdminSession();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 28800,
    path: "/",
  });
  return res;
}
