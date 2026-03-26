"use client";

import type { MarketplaceCategory, MarketplaceMarket, MarketplaceOffer } from "@payn/types";
import { MarketplaceExplorer } from "@/components/marketplace-explorer";

export function CategoryPageContent({
  category,
  offers,
  market,
}: {
  category: MarketplaceCategory;
  offers: MarketplaceOffer[];
  market: MarketplaceMarket;
}) {
  return (
    <MarketplaceExplorer
      offers={offers}
      initialMarket={market}
      initialCategory={category}
      mode="category"
    />
  );
}
