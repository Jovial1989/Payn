import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { id } = await params;
  const { data, error } = await admin.from("email_campaigns").select("*").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH — update status (cancel → draft)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };

  const allowed = ["draft"] as const;
  if (!body.status || !(allowed as readonly string[]).includes(body.status)) {
    return NextResponse.json({ error: "Only 'draft' status is allowed via PATCH" }, { status: 400 });
  }

  const { error } = await admin.from("email_campaigns").update({ status: body.status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// POST — duplicate campaign
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { id } = await params;
  const { data: orig } = await admin.from("email_campaigns").select("*").eq("id", id).single<{
    name: string; subject: string; preheader: string | null; template_id: string;
    audience: Record<string, unknown>; variables: Record<string, unknown>;
  }>();
  if (!orig) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await admin
    .from("email_campaigns")
    .insert({
      name: `${orig.name} (copy)`,
      subject: orig.subject,
      preheader: orig.preheader,
      template_id: orig.template_id,
      audience: orig.audience,
      variables: orig.variables,
      status: "draft",
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
