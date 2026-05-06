import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

export async function GET(request: NextRequest) {
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { searchParams } = request.nextUrl;
  const groupBy = searchParams.get("groupBy") ?? "offer"; // offer | provider | country | category | day
  const limit = Math.min(100, Number(searchParams.get("limit") ?? "20"));

  let data: unknown[] = [];

  if (groupBy === "day") {
    const { data: rows } = await admin
      .from("offer_click_events")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    const dayMap: Record<string, number> = {};
    for (const row of rows ?? []) {
      const day = row.created_at.slice(0, 10);
      dayMap[day] = (dayMap[day] ?? 0) + 1;
    }
    data = Object.entries(dayMap)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, limit)
      .map(([day, count]) => ({ day, count }));
  } else if (groupBy === "offer") {
    const { data: rows } = await admin.rpc("admin_top_clicked_offers", { limit_n: limit });
    data = rows ?? [];
  } else if (groupBy === "provider") {
    const { data: rows } = await admin.rpc("admin_top_clicked_providers", { limit_n: limit });
    data = rows ?? [];
  } else {
    const col = groupBy === "country" ? "country" : "category";
    const { data: rows } = await admin
      .from("offer_click_events")
      .select(col)
      .limit(5000);
    const counts: Record<string, number> = {};
    for (const row of rows ?? []) {
      const val = (row as Record<string, string>)[col] ?? "unknown";
      counts[val] = (counts[val] ?? 0) + 1;
    }
    data = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, count]) => ({ [col]: key, count }));
  }

  return NextResponse.json({ groupBy, data });
}
