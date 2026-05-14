import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { OUTCOME_BUCKETS, type OutcomeBucket } from "./outcomes";
import { providerToSlug, getProviderLogoPath } from "./provider-logo";

export interface ProviderInfo {
  name: string;
  mark: string;
  slug: string;
  logoPath?: string;
}

export interface OutcomeBucketCount {
  bucket: OutcomeBucket;
  count: number;
  topProviders: ProviderInfo[];
}

function matchesCountry(countryCodes: string[] | undefined, country: string): boolean {
  if (!countryCodes || countryCodes.length === 0) return false;
  return (
    countryCodes.includes(country.toUpperCase()) ||
    countryCodes.includes("EU") ||
    countryCodes.includes("ALL")
  );
}

export function countOffersByOutcome(country: string): OutcomeBucketCount[] {
  return OUTCOME_BUCKETS.map((bucket) => {
    const matched = marketplaceOffers.filter(
      (o) => bucket.categories.includes(o.category) && matchesCountry(o.countryCodes as string[], country),
    );

    const seen = new Set<string>();
    const topProviders: ProviderInfo[] = [];
    for (const offer of matched) {
      if (!offer.providerName) continue;
      const slug = providerToSlug(offer.providerName);
      if (seen.has(slug)) continue;
      seen.add(slug);
      const logoPath = getProviderLogoPath(offer.providerName);
      topProviders.push({
        name: offer.providerName,
        mark: offer.providerMark ?? offer.providerName.slice(0, 2).toUpperCase(),
        slug,
        logoPath: logoPath ?? undefined,
      });
      if (topProviders.length >= 3) break;
    }

    return { bucket, count: matched.length, topProviders };
  }).sort((a, b) => a.bucket.order - b.bucket.order);
}

export function countTotalOffers(country: string): { productCount: number; providerCount: number } {
  const matched = marketplaceOffers.filter((o) =>
    matchesCountry(o.countryCodes as string[], country),
  );
  return {
    productCount: matched.length,
    providerCount: new Set(matched.map((o) => o.providerName).filter(Boolean)).size,
  };
}
