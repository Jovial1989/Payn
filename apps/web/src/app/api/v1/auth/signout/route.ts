import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { SESSION_COOKIE } from "@/lib/admin-auth-edge";
import { createSupabaseServerClient } from "@/server/supabase/client";

export async function POST() {
  const res = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );

  // Always clear the admin session cookie
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });

  if (env.supabaseUrl && env.supabaseAnonKey) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  return res;
}

