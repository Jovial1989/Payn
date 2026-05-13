import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { dispatchCampaign } from "@/app/api/admin/push/campaigns/route";

type Params = { params: Promise<{ id: string }> };

// GET — campaign detail
export async function GET(request: Request, { params }: Params) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { id } = await params;
  const { data, error } = await admin.from("push_campaigns").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH — update draft/scheduled, or trigger send
export async function PATCH(request: Request, { params }: Params) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { id } = await params;
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;

  if (body.action === "send") {
    const { data: campaign } = await admin.from("push_campaigns").select("*").eq("id", id).single();
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (campaign.status === "sent") return NextResponse.json({ error: "Already sent" }, { status: 409 });

    await admin.from("push_campaigns").update({ status: "sending" }).eq("id", id);
    await dispatchCampaign(admin, id, campaign.title, campaign.body, {
      audience_countries: campaign.audience_countries ?? [],
      audience_languages: campaign.audience_languages ?? [],
      audience_last_active_days: campaign.audience_last_active_days ?? undefined,
    });
    const { data: updated } = await admin.from("push_campaigns").select("*").eq("id", id).single();
    return NextResponse.json(updated);
  }

  if (body.action === "cancel") {
    await admin.from("push_campaigns").update({ status: "cancelled" }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "duplicate") {
    const { data: src } = await admin.from("push_campaigns").select("*").eq("id", id).single();
    if (!src) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { data: copy } = await admin.from("push_campaigns").insert({
      title: `${src.title} (copy)`,
      body: src.body,
      audience_countries: src.audience_countries,
      audience_languages: src.audience_languages,
      audience_last_active_days: src.audience_last_active_days,
      status: "draft",
    }).select().single();
    return NextResponse.json(copy, { status: 201 });
  }

  // Plain field update (draft/scheduled edits)
  const allowed = ["title", "body", "audience_countries", "audience_languages",
    "audience_last_active_days", "scheduled_at", "status"];
  const patch = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  const { data, error } = await admin.from("push_campaigns").update(patch).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
