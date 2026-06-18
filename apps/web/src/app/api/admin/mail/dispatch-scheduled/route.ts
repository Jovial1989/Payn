import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

// Cron handler: dispatch email campaigns where scheduled_at <= now() and status = 'scheduled'.
// Cap at 1000 recipients per invocation — see send/route.ts for pagination TODO.
export async function POST(request: Request) {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data: campaigns } = await admin
    .from("email_campaigns")
    .select("id")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString());

  if (!campaigns?.length) return NextResponse.json({ dispatched: 0 });

  const origin = new URL(request.url).origin;
  const token = request.headers.get("x-admin-token") ?? "";

  const results = await Promise.allSettled(
    campaigns.map((c) =>
      fetch(`${origin}/api/admin/mail/campaigns/${c.id}/send`, {
        method: "POST",
        headers: { "x-admin-token": token },
      })
    )
  );

  const dispatched = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ dispatched });
}
