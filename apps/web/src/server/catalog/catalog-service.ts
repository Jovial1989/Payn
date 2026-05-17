import { cache } from "react";
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

// Request-level memo: one DB query per server request, no matter how many
// catalog functions get called downstream. Falls back to the static catalog
// if Supabase is unreachable, misconfigured, or empty.
const getAllOffers = cache(async (): Promise<MarketplaceOffer[]> => {
  const admin = createSupabaseAdminClient();
  if (!admin) return marketplaceOffersStatic;

  const { data, error } = await admin
    .from("product_offers")
    .select("*")
    .eq("status", "active");

  if (error) {
    console.warn("[catalog-service] Supabase read failed, using static fallback:", error.message);
    return marketplaceOffersStatic;
  }
  if (!data || data.length === 0) {
    return marketplaceOffersStatic;
  }

  return (data as ProductOfferRow[]).map(rowToOffer);
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
