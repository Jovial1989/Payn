import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { enrichOffer } from "@/lib/gemini-enrich";

const MAX_OFFERS = 500;
const SLEEP_MS = 200;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(request: NextRequest) {
  const authError = checkAdminToken(request);
  if (authError) return authError;

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin client unavailable" }, { status: 503 });
  }

  const force = request.nextUrl.searchParams.get("force") === "true";
  const startMs = Date.now();

  let query = admin
    .from("marketplace_offers")
    .select("id, title, subtitle, category, provider_name, metrics, best_for, affiliate_link, bullets")
    .not("affiliate_link", "ilike", "%financeads.net%")
    .not("id", "ilike", "financeads-%")
    .limit(MAX_OFFERS);

  if (!force) {
    query = query.is("last_ai_enrichment_at", null);
  }

  const { data: rows, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const offers = rows ?? [];
  const totalEligible = offers.length;
  let enriched = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of offers) {
    const hasBullets = Array.isArray(row.bullets) && row.bullets.length > 0;
    const hasBestFor = Array.isArray(row.best_for) && row.best_for.length > 0;
    const hasMetrics = Array.isArray(row.metrics) && row.metrics.length > 0;

    if (!force && hasBullets && hasBestFor && hasMetrics) {
      skipped++;
      continue;
    }

    try {
      const result = await enrichOffer({
        id: row.id,
        title: row.title ?? "",
        subtitle: row.subtitle ?? "",
        category: row.category ?? "",
        providerName: row.provider_name ?? "",
        metrics: Array.isArray(row.metrics) ? row.metrics : [],
        bestFor: Array.isArray(row.best_for) ? row.best_for : [],
      });

      const update: Record<string, unknown> = {
        last_ai_enrichment_at: new Date().toISOString(),
      };

      if (result.bullets?.length && (!hasBullets || force)) {
        update.bullets = result.bullets;
      }
      if (result.bestFor?.length && (!hasBestFor || force)) {
        update.best_for = result.bestFor;
      }
      if (result.metrics?.length && (!hasMetrics || force)) {
        update.metrics = result.metrics;
      }

      const { error: updateError } = await admin
        .from("marketplace_offers")
        .update(update)
        .eq("id", row.id);

      if (updateError) {
        failed++;
      } else {
        enriched++;
      }
    } catch {
      failed++;
    }

    await sleep(SLEEP_MS);
  }

  return NextResponse.json({
    totalEligible,
    enriched,
    skipped,
    failed,
    durationMs: Date.now() - startMs,
  });
}
