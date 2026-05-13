import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { env } from "@/lib/env";
import type { CookieOptions } from "@supabase/ssr";

type PrefsBody = {
  marketing_opt_in?: boolean;
  transactional_opt_in?: boolean;
  digest_frequency?: "weekly" | "monthly" | "off";
};

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items: { name: string; value: string; options: CookieOptions }[]) => items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data } = await admin.from("email_preferences").select("marketing_opt_in, transactional_opt_in, digest_frequency").eq("user_id", user.id).single();
  return NextResponse.json(data ?? { marketing_opt_in: false, transactional_opt_in: true, digest_frequency: "monthly" });
  void request;
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items: { name: string; value: string; options: CookieOptions }[]) => items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as PrefsBody;
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.marketing_opt_in === "boolean") update.marketing_opt_in = body.marketing_opt_in;
  if (typeof body.transactional_opt_in === "boolean") update.transactional_opt_in = body.transactional_opt_in;
  if (body.digest_frequency && ["weekly", "monthly", "off"].includes(body.digest_frequency)) {
    update.digest_frequency = body.digest_frequency;
  }

  const { error } = await admin
    .from("email_preferences")
    .upsert({ user_id: user.id, ...update }, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
