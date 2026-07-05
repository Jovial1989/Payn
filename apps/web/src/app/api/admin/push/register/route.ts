import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { createSupabaseServerClient } from "@/server/supabase/client";

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
  const { token, platform, locale, country } = body;

  if (!token || !platform) {
    return NextResponse.json({ error: "token and platform are required" }, { status: 400 });
  }

  // SEC-FIX PAYN-A03: derive user_id from verified Supabase session, never trust client body
  const supabase = await createSupabaseServerClient();
  const { data: { user: sessionUser } } = await supabase.auth.getUser();
  const resolvedUserId = sessionUser?.id ?? null;

  const { error } = await admin.from("device_tokens").upsert(
    {
      token,
      platform,
      locale: locale ?? null,
      country: country ?? null,
      user_id: resolvedUserId,
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

  // SEC-FIX PAYN-A03: scope deactivation to the authenticated user's token only;
  // anonymous callers (no session) may only deactivate tokens with a null user_id.
  const supabase = await createSupabaseServerClient();
  const { data: { user: sessionUser } } = await supabase.auth.getUser();
  const resolvedUserId = sessionUser?.id ?? null;

  let deleteQuery = admin
    .from("device_tokens")
    .update({ is_active: false })
    .eq("token", token);

  if (resolvedUserId) {
    deleteQuery = deleteQuery.eq("user_id", resolvedUserId);
  } else {
    deleteQuery = deleteQuery.is("user_id", null);
  }

  const { error } = await deleteQuery;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
