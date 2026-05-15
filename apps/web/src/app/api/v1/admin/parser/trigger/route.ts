import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

export async function POST(req: NextRequest) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const action = (body.action as string) ?? "resync";

  // Insert a run record so it shows up in the history immediately
  const { data: run, error: runErr } = await admin
    .from("offer_ingestion_runs")
    .insert({
      started_at: new Date().toISOString(),
      status: "running",
    })
    .select()
    .single();

  if (runErr) {
    return NextResponse.json({ error: runErr.message }, { status: 500 });
  }

  const runId = (run as Record<string, unknown>).id as string;

  try {
    if (action === "resync") {
      // Re-seed static offers into product_offers
      const staticRes = await fetch(
        new URL("/api/v1/admin/offers/seed", req.url).toString(),
        { method: "POST" },
      );
      const staticData = await staticRes.json() as { seeded?: number; error?: string };

      await admin.from("offer_ingestion_runs").update({
        finished_at: new Date().toISOString(),
        status: staticData.error ? "error" : "success",
        offers_imported: staticData.seeded ?? 0,
        error_count: staticData.error ? 1 : 0,
      }).eq("id", runId);

      await admin.from("offer_ingestion_logs").insert({
        run_id: runId,
        level: staticData.error ? "error" : "info",
        message: staticData.error
          ? `Re-sync failed: ${staticData.error}`
          : `Re-synced ${staticData.seeded} static offers into DB`,
        created_at: new Date().toISOString(),
      });

      await admin.from("admin_audit_log").insert({
        action: "trigger_parser",
        metadata: { action: "resync", result: staticData },
      });

      return NextResponse.json({ ok: true, action, seeded: staticData.seeded });
    }

    if (action === "dedupe") {
      // Delete duplicate offers (keep the one with max updated_at)
      const { data: dupes } = await admin
        .from("product_offers")
        .select("slug, id, updated_at")
        .order("slug")
        .order("updated_at", { ascending: false });

      const seen = new Set<string>();
      const toDelete: string[] = [];
      for (const o of (dupes ?? []) as { slug: string; id: string }[]) {
        if (seen.has(o.slug)) {
          toDelete.push(o.id);
        } else {
          seen.add(o.slug);
        }
      }

      if (toDelete.length > 0) {
        await admin.from("product_offers").delete().in("id", toDelete);
      }

      await admin.from("offer_ingestion_runs").update({
        finished_at: new Date().toISOString(),
        status: "success",
        offers_imported: 0,
        offers_skipped: toDelete.length,
        error_count: 0,
      }).eq("id", runId);

      await admin.from("offer_ingestion_logs").insert({
        run_id: runId,
        level: "info",
        message: `Removed ${toDelete.length} duplicate offer(s)`,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ ok: true, action, removed: toDelete.length });
    }

    // Unknown action — mark as error
    await admin.from("offer_ingestion_runs").update({
      finished_at: new Date().toISOString(),
      status: "error",
      error_count: 1,
    }).eq("id", runId);

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    await admin.from("offer_ingestion_runs").update({
      finished_at: new Date().toISOString(),
      status: "error",
      error_count: 1,
    }).eq("id", runId);

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
