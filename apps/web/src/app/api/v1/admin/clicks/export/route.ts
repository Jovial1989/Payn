import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

export async function GET() {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { data, error } = await admin
    .from("offer_click_events")
    .select("id, offer_id, provider_id, user_id, country, language, device_type, source_page, is_monetised, created_at")
    .order("created_at", { ascending: false })
    .limit(50000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const header = "id,offer_id,provider_id,user_id,country,language,device_type,source_page,is_monetised,created_at";
  const csv = [
    header,
    ...rows.map((r) =>
      [
        r.id, r.offer_id ?? "", r.provider_id ?? "", r.user_id ?? "",
        r.country ?? "", r.language ?? "", r.device_type ?? "",
        `"${(r.source_page ?? "").replace(/"/g, '""')}"`,
        r.is_monetised ? "true" : "false",
        r.created_at,
      ].join(","),
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="clicks-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
