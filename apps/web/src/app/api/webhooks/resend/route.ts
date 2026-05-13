import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { env } from "@/lib/env";

type ResendEvent = {
  type: string;
  data: {
    email_id: string;
    to?: string[];
    [key: string]: unknown;
  };
};

const EVENT_TYPE_MAP: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delivery_delayed",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.failed": "failed",
};

export async function POST(request: Request) {
  const body = await request.text();

  // Verify Svix signature if secret is set
  if (env.resendWebhookSecret) {
    const wh = new Webhook(env.resendWebhookSecret);
    const headers: Record<string, string> = {};
    request.headers.forEach((v, k) => { headers[k] = v; });
    try {
      wh.verify(body, headers);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(body) as ResendEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = EVENT_TYPE_MAP[event.type];
  if (!eventType) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ ok: true }); // Return 200 even if not configured

  try {
    const resendId = event.data.email_id;

    const { data: msg } = await admin
      .from("email_messages")
      .select("id, user_id")
      .eq("resend_id", resendId)
      .single<{ id: string; user_id: string | null }>();

    if (!msg) {
      return NextResponse.json({ ok: true, skipped: "message not found" });
    }

    // Insert event log
    await admin.from("email_events").insert({
      message_id: msg.id,
      resend_id: resendId,
      event_type: eventType,
      metadata: event.data,
    });

    // Update email_messages based on event type
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {};

    switch (eventType) {
      case "delivered":
        updates.status = "delivered";
        updates.delivered_at = now;
        break;
      case "opened": {
        const { data: cur } = await admin.from("email_messages").select("open_count, first_opened_at").eq("id", msg.id).single<{ open_count: number; first_opened_at: string | null }>();
        updates.open_count = (cur?.open_count ?? 0) + 1;
        if (!cur?.first_opened_at) updates.first_opened_at = now;
        break;
      }
      case "clicked": {
        const { data: cur } = await admin.from("email_messages").select("click_count, first_clicked_at").eq("id", msg.id).single<{ click_count: number; first_clicked_at: string | null }>();
        updates.click_count = (cur?.click_count ?? 0) + 1;
        if (!cur?.first_clicked_at) updates.first_clicked_at = now;
        break;
      }
      case "bounced":
        updates.status = "bounced";
        updates.bounced_at = now;
        break;
      case "complained":
        updates.status = "complained";
        updates.complained_at = now;
        break;
      case "failed":
        updates.status = "failed";
        updates.error = JSON.stringify(event.data);
        break;
    }

    if (Object.keys(updates).length) {
      await admin.from("email_messages").update(updates).eq("id", msg.id);
    }

    // Auto-unsubscribe on hard bounce or complaint
    if ((eventType === "bounced" || eventType === "complained") && msg.user_id) {
      await admin
        .from("email_preferences")
        .update({ marketing_opt_in: false, updated_at: now })
        .eq("user_id", msg.user_id);

      const toAddress = (event.data.to as string[] | undefined)?.[0] ?? "";
      await admin.from("admin_audit_log").insert({
        actor: "system",
        action: "auto_unsubscribe",
        target_id: msg.user_id,
        target_type: "user",
        metadata: { reason: eventType, email: toAddress },
      });
    }

    // Update campaign counters if message belongs to a campaign
    const { data: msgFull } = await admin
      .from("email_messages")
      .select("campaign_id")
      .eq("id", msg.id)
      .single<{ campaign_id: string | null }>();

    if (msgFull?.campaign_id) {
      const campUpdate: Record<string, unknown> = {};
      if (eventType === "delivered") campUpdate.delivered_count = (await getCampaignCount(admin, msgFull.campaign_id, "delivered")) + 1;
      if (eventType === "opened") campUpdate.opened_count = (await getCampaignCount(admin, msgFull.campaign_id, "opened")) + 1;
      if (eventType === "clicked") campUpdate.clicked_count = (await getCampaignCount(admin, msgFull.campaign_id, "clicked")) + 1;
      if (eventType === "bounced") campUpdate.bounced_count = (await getCampaignCount(admin, msgFull.campaign_id, "bounced")) + 1;
      if (Object.keys(campUpdate).length) {
        await admin.from("email_campaigns").update(campUpdate).eq("id", msgFull.campaign_id);
      }
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    // Return 200 to prevent Resend from retrying endlessly
  }

  return NextResponse.json({ ok: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCampaignCount(admin: any, campaignId: string, field: "delivered" | "opened" | "clicked" | "bounced"): Promise<number> {
  const colMap = { delivered: "delivered_count", opened: "opened_count", clicked: "clicked_count", bounced: "bounced_count" } as const;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const { data } = await admin.from("email_campaigns").select(colMap[field]).eq("id", campaignId).single();
  return (data as Record<string, number> | null)?.[colMap[field]] ?? 0;
}
