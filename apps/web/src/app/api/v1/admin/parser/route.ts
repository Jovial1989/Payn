import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

export async function GET() {
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ runs: [], logs: [] });

  const [runsResult, logsResult] = await Promise.all([
    admin
      .from("offer_ingestion_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(20),
    admin
      .from("offer_ingestion_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return NextResponse.json({
    runs: runsResult.data ?? [],
    logs: logsResult.data ?? [],
  });
}
