import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { sendPush } from "@/lib/push/send-push";

// GET — list campaigns
export async function GET(request: Request) {
  const denied = await checkAdminToken(request);
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
  const denied = await checkAdminToken(request);
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
    // PR-INT-01 — Optional in-app route the push should open. Forwarded
    // to mobile as `route` in the FCM data payload. Sanitised to a
    // leading `/` because go_router on the device only resolves
    // absolute paths. Empty string treated the same as null.
    deep_link?: string;
  };

  const { title, body: msgBody, audience_countries = [], audience_languages = [],
    audience_last_active_days, send_mode = "draft", scheduled_at } = body;
  const deepLink = sanitiseDeepLink(body.deep_link);

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
      deep_link: deepLink,
    })
    .select()
    .single();

  if (insertErr || !campaign) {
    return NextResponse.json({ error: insertErr?.message ?? "Insert failed" }, { status: 500 });
  }

  if (send_mode === "now") {
    await dispatchCampaign(admin, campaign.id, title, msgBody, {
      audience_countries, audience_languages, audience_last_active_days,
      deep_link: deepLink,
    });
  }

  return NextResponse.json(campaign, { status: 201 });
}

// PR-INT-01 — Normalise admin-supplied deep links.
//   • trim whitespace
//   • require a leading slash (otherwise go_router won't navigate)
//   • return null for empty input so DB stores a real NULL
// Anything more elaborate (allow-list, regex against known routes) can
// land in a follow-up; this layer just protects against typos that
// would obviously fail on the device.
export function sanitiseDeepLink(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export async function dispatchCampaign(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  campaignId: string,
  title: string,
  body: string,
  audience: {
    audience_countries: string[];
    audience_languages: string[];
    audience_last_active_days?: number;
    // PR-INT-01 — Threaded into FCM `data.route` so the mobile app
    // can resolve the tap target. Optional.
    deep_link?: string | null;
  },
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

  // PR-INT-01 — Build the FCM `data` payload once per campaign. The
  // mobile PushService reads `data.route` on tap and feeds it to
  // go_router. We only include the key when the admin actually set a
  // deep link — otherwise FCM rejects empty-string values on iOS.
  const payloadData: Record<string, string> | undefined =
    audience.deep_link ? { route: audience.deep_link } : undefined;

  // TODO: migrate to job queue when audience regularly exceeds 10k tokens
  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    const result = await sendPush(batch, { title, body, data: payloadData });
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
