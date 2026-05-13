import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { sendPush } from "@/lib/push/send-push";

// POST /api/admin/push/test — send a test push to a single FCM token.
// Body: { token, title, body }
export async function POST(request: Request) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const { token, title, body } = (await request.json().catch(() => ({}))) as {
    token?: string;
    title?: string;
    body?: string;
  };

  if (!token || !title || !body) {
    return NextResponse.json({ error: "token, title, and body are required" }, { status: 400 });
  }

  try {
    const result = await sendPush([token], { title, body });
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
