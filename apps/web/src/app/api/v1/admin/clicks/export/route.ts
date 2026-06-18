import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

// SEC-FIX PAYN-A10: quote all columns and neutralise formula injection (CWE-1236)
const csvSafe = (v: unknown): string => {
  const s = String(v ?? "").replace(/"/g, '""');
  // Prefix formula-triggering chars with single quote
  const safe = s.replace(/^([=+\-@\t\r])/, "'$1");
  return `"${safe}"`;
};

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
        csvSafe(r.id),
        csvSafe(r.offer_id),
        csvSafe(r.provider_id),
        csvSafe(r.user_id),
        csvSafe(r.country),
        csvSafe(r.language),
        csvSafe(r.device_type),
        csvSafe(r.source_page),
        csvSafe(r.is_monetised ? "true" : "false"),
        csvSafe(r.created_at),
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
