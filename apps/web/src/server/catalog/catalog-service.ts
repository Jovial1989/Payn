import type { MarketplaceOffer } from "@payn/types";
import { featuredOffers } from "@/features/catalog/mock-data";

export async function listCategoryOffers(category: MarketplaceOffer["category"]) {
  return featuredOffers.filter((offer) => offer.category === category);
}

