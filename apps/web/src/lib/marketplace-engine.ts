import type { MarketplaceCategory, MarketplaceMarket, MarketplaceOffer } from "@payn/types";
import type { ExplorerCategory } from "@/lib/marketplace";
import {
  getOfferSearchText,
  matchesOfferMarket,
  parseMetricRange,
  getMetricValue,
  marketplaceCategories,
} from "@/lib/marketplace";

export interface MarketplaceFilterState {
  query: string;
  provider: string;
  feature: string;
  subtype: string;
  amount: number;
  term: number;
}

export const defaultMarketplaceFilters: MarketplaceFilterState = {
  query: "",
  provider: "",
  feature: "",
  subtype: "",
  amount: 25000,
  term: 60,
};

export function getScopedOffers({
  offers,
  market,
  category,
}: {
  offers: MarketplaceOffer[];
  market: MarketplaceMarket;
  category: ExplorerCategory;
}) {
  return offers.filter((offer) => {
    if (!matchesOfferMarket(offer, market)) {
      return false;
    }

    if (category !== "all" && offer.category !== category) {
      return false;
    }

    return true;
  });
}

export function filterMarketplaceOffers({
  offers,
  market,
  category,
  filters,
}: {
  offers: MarketplaceOffer[];
  market: MarketplaceMarket;
  category: ExplorerCategory;
  filters: MarketplaceFilterState;
}) {
  let result = getScopedOffers({ offers, market, category });
  const query = filters.query.trim().toLowerCase();

  if (query) {
    result = result.filter((offer) => getOfferSearchText(offer).includes(query));
  }

  if (filters.provider) {
    result = result.filter((offer) => offer.providerName === filters.provider);
  }

  if (filters.feature) {
    const normalizedFeature = filters.feature.toLowerCase();
    result = result.filter((offer) => {
      const tags = offer.attributes?.searchTags ?? [];
      return (
        offer.bestFor.some((item) => item.toLowerCase().includes(normalizedFeature)) ||
        tags.some((item) => item.toLowerCase().includes(normalizedFeature))
      );
    });
  }

  if (filters.subtype) {
    result = result.filter((offer) => offer.attributes?.subtype === filters.subtype);
  }

  if (category === "loans") {
    result = result.filter((offer) => {
      const amountRange =
        offer.attributes?.maxAmount !== undefined
          ? { min: offer.attributes.minAmount ?? null, max: offer.attributes.maxAmount }
          : parseMetricRange(getMetricValue(offer, ["Amount"]));
      const termRange =
        offer.attributes?.maxTermMonths !== undefined
          ? {
              min: offer.attributes.minTermMonths ?? null,
              max: offer.attributes.maxTermMonths,
            }
          : parseMetricRange(getMetricValue(offer, ["Term"]));

      const amountOkay = amountRange.max === null || amountRange.max >= filters.amount;
      const termOkay = termRange.max === null || termRange.max >= filters.term;

      return amountOkay && termOkay;
    });
  }

  return result.sort((left, right) => {
    if (left.category !== right.category && category === "all") {
      return marketplaceCategories.indexOf(left.category) - marketplaceCategories.indexOf(right.category);
    }

    return right.affiliatePriorityScore - left.affiliatePriorityScore;
  });
}

export function getProviderOptions(
  offers: MarketplaceOffer[],
  market: MarketplaceMarket,
  category: ExplorerCategory,
) {
  return Array.from(
    new Set(getScopedOffers({ offers, market, category }).map((offer) => offer.providerName)),
  ).sort();
}

export function getFeatureOptions(
  offers: MarketplaceOffer[],
  market: MarketplaceMarket,
  category: ExplorerCategory,
) {
  const scope = getScopedOffers({ offers, market, category });
  return Array.from(
    new Set(
      scope.flatMap((offer) => [...offer.bestFor, ...(offer.attributes?.searchTags ?? [])]),
    ),
  )
    .filter(Boolean)
    .sort()
    .slice(0, 12);
}

export function getSubtypeOptions(
  offers: MarketplaceOffer[],
  market: MarketplaceMarket,
  category: ExplorerCategory,
) {
  if (category !== "insurance" && category !== "investments") {
    return [];
  }

  return Array.from(
    new Set(
      getScopedOffers({ offers, market, category })
        .map((offer) => offer.attributes?.subtype)
        .filter(Boolean),
    ),
  )
    .sort() as string[];
}

export function countOffersByCategory(offers: MarketplaceOffer[], market: MarketplaceMarket) {
  const scoped = getScopedOffers({ offers, market, category: "all" });

  return marketplaceCategories.reduce(
    (acc, category) => {
      acc[category] = scoped.filter((offer) => offer.category === category).length;
      return acc;
    },
    {} as Record<MarketplaceCategory, number>,
  );
}
