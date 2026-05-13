import type { CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { renderTemplate } from "@/lib/email/templates";
import { renderEmail } from "@/lib/email/render";
import { sendEmail } from "@/lib/email/resend";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/signup";

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return NextResponse.redirect(`${origin}/login?auth_error=true`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    });

    const { error, data: session } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Fire welcome email for brand-new users (async, non-blocking)
      if (session?.user) {
        void sendWelcomeEmailIfNew(session.user.id, session.user.email ?? "", session.user.user_metadata as Record<string, unknown>);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?auth_error=true`);
}

async function sendWelcomeEmailIfNew(userId: string, email: string, meta: Record<string, unknown>) {
  try {
    const admin = createSupabaseAdminClient();
    if (!admin || !email) return;

    // Only send once per user
    const { count } = await admin
      .from("email_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("template_id", "welcome");
    if ((count ?? 0) > 0) return;

    const { data: pref } = await admin
      .from("email_preferences")
      .select("unsubscribe_token")
      .eq("user_id", userId)
      .single<{ unsubscribe_token: string }>();
    if (!pref) return;

    const unsubscribeUrl = `${env.appUrl}/api/email/unsubscribe?token=${pref.unsubscribe_token}`;
    const element = renderTemplate("welcome", {
      firstName: meta.first_name as string | undefined,
      country: meta.country as string | undefined,
      unsubscribeUrl,
    });
    const { html, text } = await renderEmail(element);

    const { data: msgRow } = await admin.from("email_messages").insert({
      user_id: userId,
      template_id: "welcome",
      from_address: env.emailFromAddress,
      to_address: email,
      reply_to: env.emailReplyTo,
      subject: "Welcome to Payn",
      html,
      text,
      tags: [{ name: "kind", value: "welcome" }],
      status: "queued",
    }).select("id").single<{ id: string }>();

    if (!msgRow) return;

    const { data: resendData, error: resendErr } = await sendEmail({
      to: email,
      subject: "Welcome to Payn",
      html,
      text,
      templateId: "welcome",
      tags: [{ name: "kind", value: "welcome" }],
    });

    if (resendErr || !resendData) {
      await admin.from("email_messages").update({ status: "failed", error: resendErr?.message ?? "Send failed" }).eq("id", msgRow.id);
      return;
    }

    await admin.from("email_messages").update({ status: "sent", resend_id: resendData.id, sent_at: new Date().toISOString() }).eq("id", msgRow.id);
    await admin.from("email_events").insert({ message_id: msgRow.id, resend_id: resendData.id, event_type: "sent" });
  } catch {
    // Non-fatal — signup must succeed even if email fails
  }
}
