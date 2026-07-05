import type { MarketplaceOffer } from "@payn/types";

/**
 * Selects offers to feature in banners.
 *
 * Deduplication rule: at most one offer per provider+category pair.
 * This means "Revolut Metal Card" (cards) and "Revolut Savings" (savings)
 * can both appear — they are distinct products. Two card offers from the
 * same provider cannot appear together.
 */
export function selectFeaturedBannerOffers(
  offers: MarketplaceOffer[],
  maxCount = 6,
): MarketplaceOffer[] {
  const seenSlots = new Set<string>();
  const result: MarketplaceOffer[] = [];

  for (const offer of offers) {
    if (result.length >= maxCount) break;

    const slot = `${offer.providerName}:${offer.category}`;

    if (seenSlots.has(slot)) continue;

    seenSlots.add(slot);
    result.push(offer);
  }

  return result;
}
