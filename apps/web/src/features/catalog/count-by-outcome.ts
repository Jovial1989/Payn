import type { MarketplaceCategory } from "@payn/types";
import { getProviderBrand } from "@/lib/provider-brands";
import { matchesOfferCountrySelection } from "@/lib/countries";
import { countByCategory, countTotals, dedupeByProviderCategory } from "@/lib/inventory";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { OUTCOME_BUCKETS, flatCategoryForBucket, type OutcomeBucket } from "./outcomes";
import { providerToSlug, getProviderLogoPath } from "./provider-logo";

export interface ProviderInfo {
  name: string;
  mark: string;
  slug: string;
  logoPath?: string;
  // P1.1b — When the provider lacks a curated logo we fall back to the
  // Google favicon proxy keyed on the provider's homepage. Threaded
  // through here so the AtlasGrid bucket-card avatars get real brand
  // marks too (not just the OfferRow ProviderLogo).
  websiteUrl?: string;
}

export interface OutcomeBucketCount {
  bucket: OutcomeBucket;
  count: number;
  topProviders: ProviderInfo[];
}

// The country-scoped market set, filtered the SAME way category pages filter
// (base eu_fallback via matchesOfferCountrySelection, no fallback top-ups —
// which the DB-backed category pages don't add). This is the shared basis that
// keeps a tile's number in step with the category header it links to.
function scopedMarket(country: string) {
  return dedupeByProviderCategory(
    marketplaceOffers.filter((offer) =>
      matchesOfferCountrySelection(offer, country, "eu_fallback"),
    ),
  );
}

// P1.1 — a tile shows the count of the category it LINKS to (its destination
// page), so the number equals the header the user lands on: "Borrowing" reads
// the /loans count, not the loans+bnpl group. Previously this used a strict
// country match over the whole bucket group, so the homepage said
// "Borrowing: 1" while /loans ranked 13.
export function countOffersByOutcome(country: string): OutcomeBucketCount[] {
  const scoped = scopedMarket(country);
  const byCategory = countByCategory(scoped);
  return OUTCOME_BUCKETS.map((bucket) => {
    const linked = (flatCategoryForBucket(bucket.slug) ??
      bucket.categories[0]) as MarketplaceCategory;
    const seen = new Set<string>();
    const topProviders: ProviderInfo[] = [];
    for (const offer of scoped) {
      if (offer.category !== linked || !offer.providerName) continue;
      const slug = providerToSlug(offer.providerName);
      if (seen.has(slug)) continue;
      seen.add(slug);
      const logoPath = getProviderLogoPath(offer.providerName);
      const brand = getProviderBrand(offer.providerName);
      topProviders.push({
        name: offer.providerName,
        mark: offer.providerMark ?? offer.providerName.slice(0, 2).toUpperCase(),
        slug,
        logoPath: logoPath ?? undefined,
        websiteUrl: brand.websiteUrl,
      });
      if (topProviders.length >= 3) break;
    }
    return { bucket, count: byCategory[linked] ?? 0, topProviders };
  }).sort((a, b) => a.bucket.order - b.bucket.order);
}

export function countTotalOffers(country: string): { productCount: number; providerCount: number } {
  return countTotals(scopedMarket(country));
}
