import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { sendPush } from "@/lib/push/send-push";
import { sanitiseDeepLink } from "@/app/api/admin/push/campaigns/route";

// POST /api/admin/push/test — send a test push to a single FCM token.
// Body: { token, title, body, deep_link? }
// PR-INT-01 — optional deep_link lets admins verify tap-to-route before
// blasting a real campaign.
export async function POST(request: Request) {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const { token, title, body, deep_link } = (await request.json().catch(() => ({}))) as {
    token?: string;
    title?: string;
    body?: string;
    deep_link?: string;
  };

  if (!token || !title || !body) {
    return NextResponse.json({ error: "token, title, and body are required" }, { status: 400 });
  }

  const route = sanitiseDeepLink(deep_link);
  const data = route ? { route } : undefined;

  try {
    const result = await sendPush([token], { title, body, data });
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
