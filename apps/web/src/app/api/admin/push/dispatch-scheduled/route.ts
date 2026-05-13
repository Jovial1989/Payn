import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { dispatchCampaign } from "@/app/api/admin/push/campaigns/route";

// POST /api/admin/push/dispatch-scheduled
// Vercel cron hits this every minute. Picks up campaigns due for sending.
export async function POST(request: Request) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data: due, error } = await admin
    .from("push_campaigns")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!due || due.length === 0) return NextResponse.json({ dispatched: 0 });

  for (const campaign of due) {
    await admin.from("push_campaigns").update({ status: "sending" }).eq("id", campaign.id);
    await dispatchCampaign(admin, campaign.id, campaign.title, campaign.body, {
      audience_countries: campaign.audience_countries ?? [],
      audience_languages: campaign.audience_languages ?? [],
      audience_last_active_days: campaign.audience_last_active_days ?? undefined,
    });
  }

  return NextResponse.json({ dispatched: due.length, ids: due.map((c: { id: string }) => c.id) });
}
