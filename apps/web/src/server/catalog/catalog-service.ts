import type { MarketplaceOffer } from "@payn/types";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

export async function listCategoryOffers(category: MarketplaceOffer["category"]) {
  return marketplaceOffers
    .filter((offer) => offer.category === category)
    .sort((left, right) => right.affiliatePriorityScore - left.affiliatePriorityScore);
}

export async function listMarketplaceOffers() {
  return marketplaceOffers
    .slice()
    .sort((left, right) => right.affiliatePriorityScore - left.affiliatePriorityScore);
}

export async function listOffersForMarketCategory(
  category: MarketplaceOffer["category"],
  countryCode: string,
) {
  return marketplaceOffers
    .filter((offer) => offer.category === category)
    .filter((offer) => offer.countryCodes.includes(countryCode.toUpperCase()) || offer.countryCodes.includes("EU"))
    .sort((left, right) => right.affiliatePriorityScore - left.affiliatePriorityScore);
}

export async function getOfferBySlug(slug: string) {
  return marketplaceOffers.find((offer) => offer.slug === slug) ?? null;
}

export async function listRelatedOffers(offer: MarketplaceOffer, limit = 3) {
  return marketplaceOffers
    .filter((candidate) => candidate.category === offer.category && candidate.slug !== offer.slug)
    .sort((left, right) => right.affiliatePriorityScore - left.affiliatePriorityScore)
    .slice(0, limit);
}
