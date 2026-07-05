import type { MarketplaceOffer } from "@payn/types";

// P1.1 — the single source of truth for "how many offers are available".
//
// Four surfaces (homepage tiles, discover tiles, dashboard, category headers)
// used to count independently and disagree — most damagingly the homepage said
// "Borrowing: 1" while /loans ranked 13, because the tile counter used a strict
// country match instead of the eu_fallback selection the category pages use.
//
// These helpers operate on an ALREADY country-scoped offer list (produced once
// per market), so every surface that feeds them the same scoped list gets
// identical numbers. There is no second definition of "available" anywhere.

// Mirror catalog-service's canonical dedup: keep one offer per
// (provider, category). The category pages count the deduped DB catalog, so a
// tile counting the raw static list over-reports categories where a provider
// lists several plans (e.g. insurance: ~32 plans from ~5 providers). Deduping
// here keeps the tile in step with the page (both = distinct provider offers).
export function dedupeByProviderCategory(offers: MarketplaceOffer[]): MarketplaceOffer[] {
  const seen = new Set<string>();
  return offers.filter((offer) => {
    if (!offer.providerName) return true;
    const key = `${offer.providerName.toLowerCase()}::${offer.category}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Per-category counts from an already country-scoped offer list. */
export function countByCategory(scopedOffers: MarketplaceOffer[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const offer of scopedOffers) {
    counts[offer.category] = (counts[offer.category] ?? 0) + 1;
  }
  return counts;
}

/** Total products + distinct providers from an already country-scoped list. */
export function countTotals(scopedOffers: MarketplaceOffer[]): {
  productCount: number;
  providerCount: number;
} {
  return {
    productCount: scopedOffers.length,
    providerCount: new Set(
      scopedOffers.map((offer) => offer.providerName).filter(Boolean),
    ).size,
  };
}
