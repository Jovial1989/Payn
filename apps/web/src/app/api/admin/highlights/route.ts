import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

export async function GET(request: Request) {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data, error } = await admin
    .from("home_highlights")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = (await request.json().catch(() => null)) as {
    title?: string;
    body?: string;
    kind?: string;
    country?: string | null;
    offer_id?: string | null;
    cta_text?: string;
    cta_url?: string | null;
    is_active?: boolean;
    published_at?: string;
    expires_at?: string | null;
    created_by?: string | null;
  } | null;

  if (!body?.title || !body.body || !body.kind) {
    return NextResponse.json({ error: "title, body and kind are required" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("home_highlights")
    .insert({
      title: body.title,
      body: body.body,
      kind: body.kind,
      country: body.country ?? null,
      offer_id: body.offer_id ?? null,
      cta_text: body.cta_text ?? "See offer",
      cta_url: body.cta_url ?? null,
      is_active: body.is_active ?? true,
      published_at: body.published_at ?? new Date().toISOString(),
      expires_at: body.expires_at ?? null,
      created_by: body.created_by ?? null,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
  revalidateTag("highlights", {});
  return NextResponse.json({ id: data.id });
}
