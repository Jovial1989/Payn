import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { MarketplaceOffer, MarketplaceOfferAttributes } from "@payn/types";
import { marketplaceOffers as marketplaceOffersStatic } from "@/features/catalog/marketplace-offers";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

type ProductOfferRow = {
  id: string;
  slug: string;
  provider_name: string;
  provider_mark: string;
  provider_website_url: string;
  title: string;
  subtitle: string;
  category: string;
  country_codes: string[] | null;
  affiliate_link: string;
  link_type: string;
  affiliate_priority_score: number | string;
  best_for: string[] | null;
  metrics: unknown;
  attributes: Record<string, unknown> | null;
  bullets: string[] | null;
  last_ai_enrichment_at: string | null;
  last_human_review_at: string | null;
  status: string;
  updated_at: string;
};

function rowToOffer(row: ProductOfferRow): MarketplaceOffer {
  const attrs = (row.attributes ?? {}) as Record<string, unknown> & {
    providerUrls?: Record<string, string> | null;
  };
  const { providerUrls, ...restAttributes } = attrs;
  return {
    id: row.id,
    slug: row.slug,
    category: row.category as MarketplaceOffer["category"],
    countryCodes: row.country_codes ?? [],
    providerMark: row.provider_mark ?? "",
    providerName: row.provider_name,
    title: row.title,
    subtitle: row.subtitle ?? "",
    bullets: row.bullets && row.bullets.length > 0 ? row.bullets : undefined,
    metrics: Array.isArray(row.metrics) ? (row.metrics as MarketplaceOffer["metrics"]) : [],
    bestFor: row.best_for ?? [],
    providerWebsiteUrl: row.provider_website_url ?? "",
    affiliateLink: row.affiliate_link ?? "",
    providerUrls: providerUrls ?? undefined,
    linkType: row.link_type as MarketplaceOffer["linkType"],
    affiliatePriorityScore: Number(row.affiliate_priority_score) || 0,
    updatedAt: row.updated_at,
    lastAiEnrichmentAt: row.last_ai_enrichment_at,
    lastHumanReviewAt: row.last_human_review_at,
    attributes: restAttributes as MarketplaceOfferAttributes,
  };
}

// Cross-request DB cache: the product_offers table changes at most once a day
// (admin enrichment runs daily). Cache for 1 hour so Supabase is hit once
// per hour across all SSR requests instead of once per visitor.
// Tagged 'catalog' so admin routes can revalidateTag('catalog') on publish.
const getCachedDbOffers = unstable_cache(
  async (): Promise<ProductOfferRow[]> => {
    const admin = createSupabaseAdminClient();
    if (!admin) return [];
    const { data, error } = await admin
      .from("product_offers")
      .select("*")
      .eq("status", "active");
    if (error) {
      console.warn("[catalog-service] Supabase read failed, cache miss:", error.message);
      return [];
    }
    return (data ?? []) as ProductOfferRow[];
  },
  ["catalog-db-offers"],
  { revalidate: 3600, tags: ["catalog"] },
);

// Request-level memo: one DB query per server request, no matter how many
// catalog functions get called downstream. ALWAYS merges the static catalog
// over the Supabase rows — static entries (e.g. financeads-monetized.ts)
// are part of the codebase and must surface even when the DB has its own
// entry for the same provider. Static wins on slug collisions so the
// repo's affiliate-link / monetisation flags override stale DB values.
const getAllOffers = cache(async (): Promise<MarketplaceOffer[]> => {
  // Use the cross-request unstable_cache layer — warm path is <10ms.
  const rawRows = await getCachedDbOffers();
  if (rawRows.length === 0) return marketplaceOffersStatic;
  const dbOffers = rawRows.map((row) => rowToOffer(row));
  if (dbOffers.length === 0) return marketplaceOffersStatic;

  // Merge keyed by slug. The static list seeds the map, then DB rows are
  // layered on top with one exception to the old "static always wins" rule:
  // a DB row that has been *live-synced from the FinanceAds API*
  // (attributes.financeads present) overrides its static twin, so the catalog
  // always serves the affiliate link FinanceAds currently returns. DB-only
  // rows are appended as before. (Decision: "live API wins".)
  const merged = new Map<string, MarketplaceOffer>();
  for (const offer of marketplaceOffersStatic) {
    merged.set(offer.slug, offer);
  }
  for (const offer of dbOffers) {
    const liveSynced = Boolean(offer.attributes?.financeads);
    if (!merged.has(offer.slug) || liveSynced) merged.set(offer.slug, offer);
  }
  // CAT.1 — Belt-and-suspenders filter: even if a stale Supabase row
  // slipped past the `status='active'` query, block placeholder rows
  // by provider name + best-for text. These should never reach the
  // catalog UI.
  const cleaned = [...merged.values()].filter((offer) => {
    if (offer.providerName === "Unknown Provider") return false;
    if (offer.providerName?.toLowerCase().includes("unknown provider")) {
      return false;
    }
    const bestFor = offer.bestFor ?? [];
    if (bestFor.some((tag) => tag?.toLowerCase().includes("needs review"))) {
      return false;
    }
    if (offer.title?.toLowerCase() === "financeads partner offer") return false;
    return true;
  });

  // CAT.7 — Provider-level dedup. The review flagged 4 separate XE
  // listings, 4 separate Kraken listings, 2 Wise (Transfers + Remit),
  // 2 GoHenry, 2 Binance — same underlying product wearing different
  // wrappers. Per-(provider, category) we keep:
  //   1. The monetised entry first (attributes.monetized === true).
  //   2. Otherwise the highest affiliatePriorityScore — that's the
  //      catalog-curator's own ranking of which wrapper is canonical.
  // This preserves every financeads-monetized offer (Hilton, Krak,
  // Currensea, Airwallex, SumUp, Wallester, Waltio, YouHodler,
  // Coinhouse, ActivTrades, Enky, Deblock) while collapsing the
  // "Provider name in category X" duplicates the user explicitly
  // called out as count-inflation.
  const byProviderCategory = new Map<string, MarketplaceOffer>();
  for (const offer of cleaned) {
    if (!offer.providerName || !offer.category) continue;
    const key = `${offer.providerName.toLowerCase()}::${offer.category}`;
    const existing = byProviderCategory.get(key);
    if (!existing) {
      byProviderCategory.set(key, offer);
      continue;
    }
    const offerMonetised = Boolean(offer.attributes?.monetized);
    const existingMonetised = Boolean(existing.attributes?.monetized);
    if (offerMonetised && !existingMonetised) {
      byProviderCategory.set(key, offer);
      continue;
    }
    if (!offerMonetised && existingMonetised) continue;
    const offerScore = offer.affiliatePriorityScore ?? 0;
    const existingScore = existing.affiliatePriorityScore ?? 0;
    if (offerScore > existingScore) byProviderCategory.set(key, offer);
  }
  return [...byProviderCategory.values()];
});

export async function listCategoryOffers(category: MarketplaceOffer["category"]) {
  const all = await getAllOffers();
  return all
    .filter((offer) => offer.category === category)
    .sort((left, right) => right.affiliatePriorityScore - left.affiliatePriorityScore);
}

export async function listMarketplaceOffers() {
  const all = await getAllOffers();
  return all
    .slice()
    .sort((left, right) => right.affiliatePriorityScore - left.affiliatePriorityScore);
}

export async function listOffersForMarketCategory(
  category: MarketplaceOffer["category"],
  countryCode: string,
) {
  const all = await getAllOffers();
  return all
    .filter((offer) => offer.category === category)
    .filter(
      (offer) =>
        offer.countryCodes.includes(countryCode.toUpperCase()) ||
        offer.countryCodes.includes("EU"),
    )
    .sort((left, right) => right.affiliatePriorityScore - left.affiliatePriorityScore);
}

export async function getOfferBySlug(slug: string) {
  const all = await getAllOffers();
  return all.find((offer) => offer.slug === slug) ?? null;
}

export async function listRelatedOffers(offer: MarketplaceOffer, limit = 3) {
  const all = await getAllOffers();
  return all
    .filter((candidate) => candidate.category === offer.category && candidate.slug !== offer.slug)
    .sort((left, right) => right.affiliatePriorityScore - left.affiliatePriorityScore)
    .slice(0, limit);
}
