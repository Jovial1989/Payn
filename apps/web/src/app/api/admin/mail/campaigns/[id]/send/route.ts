import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { renderTemplate, type TemplateId } from "@/lib/email/templates";
import { renderEmail } from "@/lib/email/render";
import { sendEmail } from "@/lib/email/resend";
import { env } from "@/lib/env";

const BATCH_SIZE = 50;
const MAX_PER_INVOCATION = 1000; // TODO: paginate across cron invocations for campaigns > 1000 recipients

type Campaign = {
  id: string;
  name: string;
  subject: string;
  template_id: string;
  audience: {
    countries?: string[];
    languages?: string[];
    marketing_opt_in?: boolean;
    last_active_days?: number | null;
  };
  variables: Record<string, unknown>;
  status: string;
};

type Pref = {
  user_id: string;
  unsubscribe_token: string;
  country: string | null;
  language: string | null;
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { id } = await params;
  const { data: campaign, error: campErr } = await admin
    .from("email_campaigns")
    .select("*")
    .eq("id", id)
    .single<Campaign>();

  if (campErr || !campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (!["draft", "scheduled"].includes(campaign.status)) {
    return NextResponse.json({ error: "Campaign is not in a sendable state" }, { status: 400 });
  }

  await admin.from("email_campaigns").update({ status: "sending" }).eq("id", id);

  // Build audience query
  let prefQ = admin
    .from("email_preferences")
    .select("user_id, unsubscribe_token, country, language")
    .eq("transactional_opt_in", true);

  if (campaign.audience.marketing_opt_in) prefQ = prefQ.eq("marketing_opt_in", true);
  if (campaign.audience.countries?.length) prefQ = prefQ.in("country", campaign.audience.countries);
  if (campaign.audience.languages?.length) prefQ = prefQ.in("language", campaign.audience.languages);

  const { data: prefs } = await prefQ;
  const allPrefs = (prefs ?? []) as Pref[];

  // Filter by last_active_days via auth.users last_sign_in_at
  let filteredPrefs = allPrefs;
  if (campaign.audience.last_active_days) {
    const cutoff = new Date(Date.now() - campaign.audience.last_active_days * 86_400_000).toISOString();
    const { data: activeUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const activeIds = new Set(
      (activeUsers?.users ?? [])
        .filter((u) => u.last_sign_in_at && u.last_sign_in_at >= cutoff)
        .map((u) => u.id)
    );
    filteredPrefs = allPrefs.filter((p) => activeIds.has(p.user_id));
  }

  const limited = filteredPrefs.slice(0, MAX_PER_INVOCATION);

  // Get emails from auth.users
  const { data: authUsersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map((authUsersData?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  let deliveredCount = 0;
  let failedCount = 0;

  // Process in batches
  for (let i = 0; i < limited.length; i += BATCH_SIZE) {
    const batch = limited.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (pref) => {
      const toAddress = emailMap.get(pref.user_id);
      if (!toAddress) return;

      const user = authUsersData?.users.find((u) => u.id === pref.user_id);
      const firstName = (user?.user_metadata as { first_name?: string } | undefined)?.first_name;
      const unsubscribeUrl = `${env.appUrl}/api/email/unsubscribe?token=${pref.unsubscribe_token}`;

      const props: Record<string, unknown> = {
        ...campaign.variables,
        firstName,
        country: pref.country,
        language: pref.language,
        unsubscribeUrl,
      };

      let html: string;
      let text: string;

      try {
        const element = renderTemplate(campaign.template_id as TemplateId, props);
        const rendered = await renderEmail(element);
        html = rendered.html;
        text = rendered.text;
      } catch {
        failedCount++;
        return;
      }

      const { data: msgRow } = await admin.from("email_messages").insert({
        user_id: pref.user_id,
        campaign_id: id,
        template_id: campaign.template_id,
        from_address: env.emailFromAddress,
        to_address: toAddress,
        reply_to: env.emailReplyTo,
        subject: campaign.subject,
        html,
        text,
        status: "queued",
      }).select("id").single<{ id: string }>();

      if (!msgRow) { failedCount++; return; }

      const { data: resendData, error: resendErr } = await sendEmail({
        to: toAddress,
        subject: campaign.subject,
        html,
        text,
        campaignId: id,
        templateId: campaign.template_id as TemplateId,
      });

      if (resendErr || !resendData) {
        await admin.from("email_messages").update({ status: "failed", error: resendErr?.message ?? "Send failed" }).eq("id", msgRow.id);
        failedCount++;
        return;
      }

      await admin.from("email_messages").update({
        status: "sent",
        resend_id: resendData.id,
        sent_at: new Date().toISOString(),
      }).eq("id", msgRow.id);

      await admin.from("email_events").insert({ message_id: msgRow.id, resend_id: resendData.id, event_type: "sent" });
      deliveredCount++;
    }));
  }

  await admin.from("email_campaigns").update({
    status: "sent",
    sent_at: new Date().toISOString(),
    audience_size: limited.length,
  }).eq("id", id);

  await admin.from("admin_audit_log").insert({
    actor: "admin",
    action: "email_campaign_sent",
    target_id: id,
    target_type: "email_campaign",
    metadata: { name: campaign.name, delivered: deliveredCount, failed: failedCount },
  });

  return NextResponse.json({ ok: true, delivered: deliveredCount, failed: failedCount });
}
