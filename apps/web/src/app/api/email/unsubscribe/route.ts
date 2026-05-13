import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

function page(title: string, body: string, token?: string, resubscribed = false) {
  const resubForm = token && !resubscribed
    ? `<form method="POST" action="/api/email/unsubscribe?token=${encodeURIComponent(token)}&action=resubscribe" style="margin-top:16px">
        <button type="submit" style="background:#f3f4f6;border:1px solid #d1d5db;border-radius:8px;padding:10px 20px;font-size:14px;font-weight:500;color:#374151;cursor:pointer">
          Subscribe again
        </button>
       </form>`
    : "";

  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Payn</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f6f6f6; font-family: Inter, -apple-system, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: white; border-radius: 16px; padding: 48px 40px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .logo { width: 48px; height: 48px; background: #ddf4e7; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    h1 { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 12px; }
    p { font-size: 15px; line-height: 1.6; color: #4b5563; }
    .back { display: inline-block; margin-top: 24px; color: #10B981; text-decoration: none; font-size: 14px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 14L10 4L16 14" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h1>${title}</h1>
    <p>${body}</p>
    ${resubForm}
    <a href="/" class="back">Back to Payn →</a>
  </div>
</body>
</html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

// GET — one-click unsubscribe (public, no auth required)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return page("Invalid link", "This unsubscribe link is missing a token. It may have been copied incorrectly.");
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return page("Error", "Something went wrong. Please try again or contact support@payn.online.");
  }

  const { data: pref } = await admin
    .from("email_preferences")
    .select("id, user_id, marketing_opt_in")
    .eq("unsubscribe_token", token)
    .single<{ id: string; user_id: string; marketing_opt_in: boolean }>();

  if (!pref) {
    return page(
      "Link expired or invalid",
      "This unsubscribe link has already been used, expired, or is invalid. If you still receive unwanted emails, contact support@payn.online.",
    );
  }

  await admin.from("email_preferences").update({ marketing_opt_in: false, updated_at: new Date().toISOString() }).eq("id", pref.id);

  // Log an unsubscribed event against the most recent campaign message for this user
  const { data: lastMsg } = await admin
    .from("email_messages")
    .select("id")
    .eq("user_id", pref.user_id)
    .not("campaign_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single<{ id: string }>();

  if (lastMsg) {
    await admin.from("email_events").insert({ message_id: lastMsg.id, event_type: "unsubscribed", metadata: {} });
  }

  return page(
    "You&apos;re unsubscribed",
    "You won&apos;t receive marketing emails from Payn anymore. Account-related emails (sign in, security) will still come through.",
    token,
  );
}

// POST — resubscribe
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  if (action !== "resubscribe" || !token) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data: pref } = await admin
    .from("email_preferences")
    .select("id")
    .eq("unsubscribe_token", token)
    .single<{ id: string }>();

  if (!pref) return page("Invalid link", "This link has expired or is invalid.");

  await admin.from("email_preferences").update({ marketing_opt_in: true, updated_at: new Date().toISOString() }).eq("id", pref.id);

  return page("You&apos;re subscribed again", "You&apos;ll receive marketing emails from Payn. You can unsubscribe at any time using the link in any email we send.", undefined, true);
}
