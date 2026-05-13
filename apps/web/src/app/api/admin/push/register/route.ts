import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

type RegisterBody = {
  token: string;
  platform: "ios" | "android" | "web";
  locale?: string;
  country?: string;
  user_id?: string;
};

// POST /api/admin/push/register — called by mobile/web clients to register a FCM token.
// No admin-token auth; the caller provides their own user_id or we leave it null (anonymous).
export async function POST(request: Request) {
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as Partial<RegisterBody>;
  const { token, platform, locale, country, user_id } = body;

  if (!token || !platform) {
    return NextResponse.json({ error: "token and platform are required" }, { status: 400 });
  }

  const { error } = await admin.from("device_tokens").upsert(
    {
      token,
      platform,
      locale: locale ?? null,
      country: country ?? null,
      user_id: user_id ?? null,
      is_active: true,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "token" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/push/register — unregister a token (user opts out of push).
export async function DELETE(request: Request) {
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { token } = (await request.json().catch(() => ({}))) as { token?: string };
  if (!token) return NextResponse.json({ error: "token is required" }, { status: 400 });

  const { error } = await admin
    .from("device_tokens")
    .update({ is_active: false })
    .eq("token", token);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
