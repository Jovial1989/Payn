import { createSupabaseAdminClient } from "@/server/supabase/admin";
import type { IngestionRunStats, NormalizedOfferRecord } from "./types";

export async function createIngestionRun(sourceCount: number) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("offer_ingestion_runs")
    .insert({
      status: "running",
      source_count: sourceCount,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Could not create ingestion run: ${error.message}`);
  }

  return data.id as string;
}

export async function finishIngestionRun(stats: IngestionRunStats) {
  const supabase = createSupabaseAdminClient();
  if (!supabase || !stats.runId) return;

  await supabase
    .from("offer_ingestion_runs")
    .update({
      status: stats.failures.length > 0 ? "completed_with_errors" : "completed",
      finished_at: stats.finishedAt,
      duration_ms: stats.durationMs,
      source_count: stats.sourcesChecked,
      offers_discovered: stats.offersDiscovered,
      offers_normalized: stats.offersNormalized,
      offers_published: stats.offersPublished,
      changes_detected: stats.changesDetected,
      error_count: stats.failures.length,
      summary: stats,
    })
    .eq("id", stats.runId);
}

export async function persistNormalizedOffers(offers: NormalizedOfferRecord[]) {
  const supabase = createSupabaseAdminClient();
  if (!supabase || offers.length === 0) return 0;

  const fingerprints = offers.map((offer) => offer.fingerprint);
  const { data: existingRows, error: existingError } = await supabase
    .from("discovered_offers")
    .select("id,fingerprint,payload")
    .in("fingerprint", fingerprints);

  if (existingError) {
    throw new Error(`Could not load existing discovered offers: ${existingError.message}`);
  }

  const existingByFingerprint = new Map(
    (existingRows ?? []).map((row) => [
      row.fingerprint as string,
      row as { id: string; fingerprint: string; payload: NormalizedOfferRecord },
    ]),
  );

  const rows = offers.map((offer) => ({
    fingerprint: offer.fingerprint,
    provider_name: offer.providerName,
    product_name: offer.name,
    category: offer.category,
    country: offer.country,
    apr_min: offer.aprMin,
    apr_max: offer.aprMax,
    fee: offer.fee,
    currency: offer.currency,
    amount_min: offer.amountMin,
    amount_max: offer.amountMax,
    term_min: offer.termMin,
    term_max: offer.termMax,
    features: offer.features,
    is_monetised: offer.isMonetised,
    affiliate_url: offer.affiliateUrl,
    raw_tracking_url: offer.rawTrackingUrl,
    tracking_network: offer.trackingNetwork,
    source_url: offer.sourceUrl,
    source_type: offer.sourceType,
    last_updated: offer.lastUpdated,
    confidence_score: offer.confidenceScore,
    informational: offer.informational,
    estimated: offer.estimated,
    payload: offer,
  }));

  const { error } = await supabase
    .from("discovered_offers")
    .upsert(rows, { onConflict: "fingerprint" });

  if (error) {
    throw new Error(`Could not persist normalized offers: ${error.message}`);
  }

  const versionRows = offers
    .map((offer) => {
      const previous = existingByFingerprint.get(offer.fingerprint);
      if (!previous) return null;
      const changedFields = getChangedFields(previous.payload, offer);
      if (changedFields.length === 0) return null;
      return {
        discovered_offer_id: previous.id,
        fingerprint: offer.fingerprint,
        changed_fields: changedFields,
        previous_payload: previous.payload,
        next_payload: offer,
      };
    })
    .filter(Boolean);

  if (versionRows.length > 0) {
    const { error: versionError } = await supabase
      .from("discovered_offer_versions")
      .insert(versionRows);

    if (versionError) {
      throw new Error(`Could not persist offer versions: ${versionError.message}`);
    }
  }

  return rows.length;
}

export async function loadPublishedDiscoveredOffers(filters?: {
  country?: string | null;
  category?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [] as NormalizedOfferRecord[];

  let query = supabase
    .from("discovered_offers")
    .select("payload")
    .eq("published", true)
    .order("is_monetised", { ascending: false })
    .order("confidence_score", { ascending: false });

  if (filters?.country) {
    query = query.in("country", [filters.country.toUpperCase(), "EU", "INTERNATIONAL"]);
  }

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Could not load discovered offers: ${error.message}`);
  }

  return (data ?? []).map((row) => row.payload as NormalizedOfferRecord);
}

function getChangedFields(previous: NormalizedOfferRecord, next: NormalizedOfferRecord) {
  const fields: Array<keyof NormalizedOfferRecord> = [
    "aprMin",
    "aprMax",
    "fee",
    "amountMin",
    "amountMax",
    "termMin",
    "termMax",
    "affiliateUrl",
    "rawTrackingUrl",
    "confidenceScore",
  ];

  return fields.filter((field) => JSON.stringify(previous[field]) !== JSON.stringify(next[field]));
}
