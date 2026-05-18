import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";
import { fetchSource } from "@/server/offers/discovery/fetcher";
import {
  findMatchingCuratedOffer,
  mergeWithCuratedOffer,
  dedupeNormalizedOffers,
  normalizeRawOffer,
} from "@/server/offers/discovery/normalizer";
import { parseSource } from "@/server/offers/discovery/parsers";
import {
  createIngestionRun,
  finishIngestionRun,
  loadPublishedDiscoveredOffers,
  persistNormalizedOffers,
} from "@/server/offers/discovery/run-repository";
import {
  appendIngestionLog,
  listActiveOfferSources,
  markSourceCrawled,
} from "@/server/offers/discovery/source-repository";
import type {
  IngestionRunStats,
  NormalizedOfferRecord,
  PublishedOffer,
} from "@/server/offers/discovery/types";

export type OfferImportResult = IngestionRunStats & {
  normalizedOffers: NormalizedOfferRecord[];
  productOffers: MarketplaceOffer[];
};

export async function runDailyOfferImport({
  dryRun = true,
  country,
  category,
}: {
  dryRun?: boolean;
  country?: string | null;
  category?: MarketplaceCategory | null;
} = {}): Promise<OfferImportResult> {
  const startedAt = new Date().toISOString();
  const started = Date.now();
  const sources = await listActiveOfferSources({ country, category });
  const runId = dryRun ? null : await createIngestionRun(sources.length);
  const failures: IngestionRunStats["failures"] = [];
  const skipped: IngestionRunStats["skipped"] = [];
  const rawOffers = [];

  if (sources.length === 0) {
    skipped.push({
      sourceId: "source_registry",
      reason:
        "No active discovery sources found. Add rows to offer_discovery_sources.",
    });
  }

  for (const source of sources) {
    try {
      await appendIngestionLog({
        runId,
        sourceId: source.id,
        level: "info",
        message: "Starting source crawl",
        metadata: { url: source.url, strategy: source.crawlStrategy },
      });

      const fetched = await fetchSource(source);
      const parsed = await parseSource(source, fetched);
      rawOffers.push(...parsed.offers);

      if (parsed.errors.length > 0) {
        await appendIngestionLog({
          runId,
          sourceId: source.id,
          level: "warn",
          message: "Parser completed with fallback/errors",
          metadata: { errors: parsed.errors, parser: parsed.metadata.parser },
        });
      }

      if (!dryRun) {
        await markSourceCrawled(source.id, new Date().toISOString());
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown source error";
      failures.push({ sourceId: source.id, sourceUrl: source.url, reason });
      await appendIngestionLog({
        runId,
        sourceId: source.id,
        level: "error",
        message: reason,
      });
    }
  }

  const normalized = dedupeNormalizedOffers(
    rawOffers.map(normalizeRawOffer).filter(Boolean) as NormalizedOfferRecord[],
  );
  const marketplaceOffers = await listMarketplaceOffers();
  const productOffers = normalized.map((offer) =>
    mergeWithCuratedOffer(
      offer,
      findMatchingCuratedOffer(offer, marketplaceOffers),
    ),
  );

  let offersPublished = 0;
  if (!dryRun && normalized.length > 0) {
    offersPublished = await persistNormalizedOffers(normalized);
  }

  const stats: IngestionRunStats = {
    runId,
    dryRun,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    sourcesChecked: sources.length,
    offersDiscovered: rawOffers.length,
    offersNormalized: normalized.length,
    offersPublished,
    changesDetected: productOffers.length,
    failures,
    skipped,
  };

  if (!dryRun) {
    await finishIngestionRun(stats);
  }

  return {
    ...stats,
    normalizedOffers: normalized,
    productOffers,
  };
}

export async function listProductOffers({
  country,
  category,
}: {
  country?: string | null;
  category?: MarketplaceCategory | null;
} = {}) {
  const [discovered, marketplaceOffers] = await Promise.all([
    loadPublishedDiscoveredOffers({ country, category }),
    listMarketplaceOffers(),
  ]);
  const discoveredOffers = discovered.map((offer) =>
    mergeWithCuratedOffer(
      offer,
      findMatchingCuratedOffer(offer, marketplaceOffers),
    ),
  );

  const scope = [...marketplaceOffers, ...discoveredOffers];
  const deduped = new Map<string, PublishedOffer>();

  for (const offer of scope) {
    if (country && !offer.countryCodes.includes(country.toUpperCase()) && !offer.countryCodes.includes("EU")) {
      continue;
    }
    if (category && offer.category !== category) {
      continue;
    }

    const key = `${offer.providerName.toLowerCase()}-${offer.title.toLowerCase()}-${offer.category}`;
    const previous = deduped.get(key);
    if (!previous || offerSortScore(offer) > offerSortScore(previous)) {
      deduped.set(key, offer);
    }
  }

  return [...deduped.values()].sort((left, right) => offerSortScore(right) - offerSortScore(left));
}

function offerSortScore(offer: MarketplaceOffer) {
  return (
    Number(Boolean(offer.attributes?.monetized || offer.attributes?.affiliate)) * 1000 +
    Number(Boolean(offer.attributes?.isPartner)) * 300 +
    (offer.affiliatePriorityScore ?? 0) * 100 +
    Number(offer.attributes?.confidenceScore ?? 0) * 10
  );
}
