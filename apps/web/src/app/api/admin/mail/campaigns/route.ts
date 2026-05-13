import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

type CampaignBody = {
  name: string;
  subject: string;
  preheader?: string;
  template_id: string;
  audience: Record<string, unknown>;
  variables?: Record<string, unknown>;
  send_mode?: "draft" | "now" | "scheduled";
  scheduled_at?: string;
  audience_size?: number;
};

export async function GET(request: Request) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data, error } = await admin
    .from("email_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = (await request.json().catch(() => null)) as CampaignBody | null;
  if (!body?.name || !body.subject || !body.template_id) {
    return NextResponse.json({ error: "name, subject, and template_id are required" }, { status: 400 });
  }

  const status = body.send_mode === "scheduled" ? "scheduled" : body.send_mode === "now" ? "draft" : "draft";
  const { data, error } = await admin
    .from("email_campaigns")
    .insert({
      name: body.name,
      subject: body.subject,
      preheader: body.preheader ?? null,
      template_id: body.template_id,
      audience: body.audience,
      variables: body.variables ?? {},
      scheduled_at: body.scheduled_at ?? null,
      audience_size: body.audience_size ?? 0,
      status,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });

  // Send immediately if mode is "now"
  if (body.send_mode === "now") {
    const origin = new URL(request.url).origin;
    void fetch(`${origin}/api/admin/mail/campaigns/${data.id}/send`, {
      method: "POST",
      headers: { "x-admin-token": request.headers.get("x-admin-token") ?? "" },
    });
  }

  return NextResponse.json({ id: data.id });
}
