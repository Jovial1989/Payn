import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { renderTemplate, type TemplateId } from "@/lib/email/templates";
import { renderEmail } from "@/lib/email/render";
import { sendEmail } from "@/lib/email/resend";
import { env } from "@/lib/env";

const MAX_RECIPIENTS = 100;

type SendBody = {
  to: string[];
  subject: string;
  templateId?: TemplateId;
  templateProps?: Record<string, unknown>;
  html?: string;
  text?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
  campaignId?: string;
};

export async function POST(request: Request) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = (await request.json().catch(() => null)) as SendBody | null;
  if (!body?.to?.length || !body.subject) {
    return NextResponse.json({ error: "to and subject are required" }, { status: 400 });
  }
  if (body.to.length > MAX_RECIPIENTS) {
    return NextResponse.json({ error: `Max ${MAX_RECIPIENTS} recipients per send. Use Campaigns for larger sends.` }, { status: 400 });
  }
  if (!body.templateId && !body.html) {
    return NextResponse.json({ error: "Either templateId or html is required" }, { status: 400 });
  }

  const messages: Array<{ id: string; to: string; status: string; error?: string }> = [];

  for (const toAddress of body.to) {
    // Look up user and unsubscribe token
    const { data: users } = await admin.auth.admin.listUsers({ perPage: 1 });
    // Get user by email via user_profiles or auth.users
    let userId: string | null = null;
    let unsubscribeToken: string | null = null;

    const { data: profileRows } = await admin
      .from("email_preferences")
      .select("user_id, unsubscribe_token")
      .limit(1);

    // Find by matching email in auth.users
    const authUserRes = await admin.auth.admin.listUsers({ perPage: 1000 });
    const authUser = (authUserRes.data?.users ?? []).find((u) => u.email === toAddress);
    if (authUser) {
      userId = authUser.id;
      const prefRes = await admin
        .from("email_preferences")
        .select("unsubscribe_token")
        .eq("user_id", authUser.id)
        .single<{ unsubscribe_token: string }>();
      unsubscribeToken = prefRes.data?.unsubscribe_token ?? null;
    }
    void profileRows; void users;

    const unsubscribeUrl = unsubscribeToken
      ? `${env.appUrl}/api/email/unsubscribe?token=${unsubscribeToken}`
      : `${env.appUrl}/api/email/unsubscribe?token=unknown`;

    // Build props with resolved unsubscribeUrl
    let props: Record<string, unknown> = { ...(body.templateProps ?? {}), unsubscribeUrl };

    // Render
    let html: string;
    let text: string | undefined;

    if (body.templateId) {
      const element = renderTemplate(body.templateId, props);
      const rendered = await renderEmail(element);
      html = rendered.html;
      text = rendered.text;
    } else {
      html = body.html!;
      text = body.text;
      props = {};
    }

    // Insert queued row
    const { data: msgRow, error: insertErr } = await admin
      .from("email_messages")
      .insert({
        user_id: userId,
        campaign_id: body.campaignId ?? null,
        template_id: body.templateId ?? null,
        from_address: env.emailFromAddress,
        to_address: toAddress,
        reply_to: body.replyTo ?? env.emailReplyTo,
        subject: body.subject,
        html,
        text: text ?? null,
        tags: body.tags ?? [],
        status: "queued",
      })
      .select("id")
      .single<{ id: string }>();

    if (insertErr || !msgRow) {
      messages.push({ id: "unknown", to: toAddress, status: "failed", error: insertErr?.message });
      continue;
    }

    const msgId = msgRow.id;

    // Send via Resend
    const { data: resendData, error: resendError } = await sendEmail({
      to: toAddress,
      subject: body.subject,
      html,
      text,
      replyTo: body.replyTo ?? env.emailReplyTo,
      tags: body.tags,
      templateId: body.templateId,
      campaignId: body.campaignId,
    });

    if (resendError || !resendData) {
      await admin.from("email_messages").update({ status: "failed", error: resendError?.message ?? "Unknown error" }).eq("id", msgId);
      messages.push({ id: msgId, to: toAddress, status: "failed", error: resendError?.message });
      continue;
    }

    await admin.from("email_messages").update({
      status: "sent",
      resend_id: resendData.id,
      sent_at: new Date().toISOString(),
    }).eq("id", msgId);

    await admin.from("email_events").insert({
      message_id: msgId,
      resend_id: resendData.id,
      event_type: "sent",
      metadata: {},
    });

    messages.push({ id: msgId, to: toAddress, status: "sent" });
  }

  return NextResponse.json({ messages });
}
