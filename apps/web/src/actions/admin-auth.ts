"use server";

import { cookies } from "next/headers";
import { createAdminSession, SESSION_COOKIE } from "@/lib/admin-auth-edge";

export async function adminSignIn(
  email: string,
  password: string,
): Promise<{ ok: boolean }> {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const validEmail = Boolean(adminUsername) && email === adminUsername;
  const validPassword = adminPassword && password === adminPassword;

  if (!validEmail || !validPassword) {
    return { ok: false };
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

  return { ok: true };
}
