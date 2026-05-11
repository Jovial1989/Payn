import { createSupabaseAdminClient } from "@/server/supabase/admin";
import type { CrawlStrategy, OfferDiscoverySource, OfferSourceType } from "./types";

type SourceRow = {
  id: string;
  name: string;
  url: string;
  country: string;
  categories: string[];
  source_type: OfferSourceType;
  crawl_strategy: CrawlStrategy;
  reliability_score: number;
  is_active: boolean;
  last_crawled_at: string | null;
  parser_config: Record<string, unknown> | null;
};

export async function listActiveOfferSources(filters?: {
  country?: string | null;
  category?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return [] as OfferDiscoverySource[];
  }

  let query = supabase
    .from("offer_discovery_sources")
    .select("*")
    .eq("is_active", true)
    .order("reliability_score", { ascending: false });

  const country = filters?.country?.toUpperCase();
  if (country) {
    query = query.in("country", [country, "EU", "INTERNATIONAL"]);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Could not load offer sources: ${error.message}`);
  }

  return ((data ?? []) as SourceRow[])
    .filter((row) => !filters?.category || row.categories.includes(filters.category))
    .map((row) => ({
      id: row.id,
      name: row.name,
      url: row.url,
      country: row.country,
      categories: row.categories as OfferDiscoverySource["categories"],
      sourceType: row.source_type,
      crawlStrategy: row.crawl_strategy,
      reliabilityScore: Number(row.reliability_score ?? 0),
      isActive: row.is_active,
      lastCrawledAt: row.last_crawled_at,
      parserConfig: row.parser_config ?? {},
    }));
}

export async function markSourceCrawled(sourceId: string, crawledAt: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  await supabase
    .from("offer_discovery_sources")
    .update({ last_crawled_at: crawledAt, updated_at: crawledAt })
    .eq("id", sourceId);
}

export async function appendIngestionLog(entry: {
  runId: string | null;
  sourceId: string | null;
  level: "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  await supabase.from("offer_ingestion_logs").insert({
    run_id: entry.runId,
    source_id: entry.sourceId,
    level: entry.level,
    message: entry.message,
    metadata: entry.metadata ?? {},
  });
}
