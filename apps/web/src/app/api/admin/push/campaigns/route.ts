import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { sendPush } from "@/lib/push/send-push";

// GET — list campaigns
export async function GET(request: Request) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data, error } = await admin
    .from("push_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — create and optionally send/schedule a campaign
export async function POST(request: Request) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = await request.json().catch(() => ({})) as {
    title?: string;
    body?: string;
    audience_countries?: string[];
    audience_languages?: string[];
    audience_last_active_days?: number;
    send_mode?: "draft" | "now" | "scheduled";
    scheduled_at?: string;
  };

  const { title, body: msgBody, audience_countries = [], audience_languages = [],
    audience_last_active_days, send_mode = "draft", scheduled_at } = body;

  if (!title || !msgBody) {
    return NextResponse.json({ error: "title and body are required" }, { status: 400 });
  }

  const status = send_mode === "scheduled" ? "scheduled" : send_mode === "now" ? "sending" : "draft";

  const { data: campaign, error: insertErr } = await admin
    .from("push_campaigns")
    .insert({
      title,
      body: msgBody,
      audience_countries,
      audience_languages,
      audience_last_active_days: audience_last_active_days ?? null,
      status,
      scheduled_at: scheduled_at ?? null,
    })
    .select()
    .single();

  if (insertErr || !campaign) {
    return NextResponse.json({ error: insertErr?.message ?? "Insert failed" }, { status: 500 });
  }

  if (send_mode === "now") {
    await dispatchCampaign(admin, campaign.id, title, msgBody, {
      audience_countries, audience_languages, audience_last_active_days,
    });
  }

  return NextResponse.json(campaign, { status: 201 });
}

export async function dispatchCampaign(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  campaignId: string,
  title: string,
  body: string,
  audience: { audience_countries: string[]; audience_languages: string[]; audience_last_active_days?: number },
) {
  let query = admin
    .from("device_tokens")
    .select("token")
    .eq("is_active", true)
    .limit(50000);

  if (audience.audience_countries.length > 0 && !audience.audience_countries.includes("All")) {
    query = query.in("country", audience.audience_countries);
  }
  if (audience.audience_languages.length > 0 && !audience.audience_languages.includes("All")) {
    query = query.in("locale", audience.audience_languages);
  }
  if (audience.audience_last_active_days) {
    const cutoff = new Date(Date.now() - audience.audience_last_active_days * 86400_000).toISOString();
    query = query.gte("last_seen_at", cutoff);
  }

  const { data: rows } = await query;
  const tokens = (rows ?? []).map((r: { token: string }) => r.token);

  await admin.from("push_campaigns").update({ audience_size: tokens.length }).eq("id", campaignId);

  let delivered = 0;
  let failed = 0;
  let invalidCount = 0;
  const batchSize = 500;

  // TODO: migrate to job queue when audience regularly exceeds 10k tokens
  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    const result = await sendPush(batch, { title, body });
    delivered += result.successCount;
    failed += result.failureCount;

    if (result.invalidTokens.length > 0) {
      invalidCount += result.invalidTokens.length;
      await admin
        .from("device_tokens")
        .update({ is_active: false })
        .in("token", result.invalidTokens);
    }
  }

  await admin.from("push_campaigns").update({
    status: "sent",
    sent_at: new Date().toISOString(),
    delivered_count: delivered,
    failed_count: failed,
    invalid_tokens_marked: invalidCount,
  }).eq("id", campaignId);

  await admin.from("admin_audit_log").insert({
    action: "push_campaign_sent",
    target_id: campaignId,
    target_type: "push_campaign",
    metadata: { title, audience_size: tokens.length, delivered, failed },
  });
}
