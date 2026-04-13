import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";
import { matchesOfferCountrySelection } from "@/lib/countries";
import type { ExplorerCategory } from "@/lib/marketplace";
import {
  getOfferSearchText,
  parseMetricRange,
  getMetricValue,
  marketplaceCategories,
} from "@/lib/marketplace";

export type SortKey = "relevance" | "apr" | "fees" | "provider" | "updated";

export interface MarketplaceFilterState {
  query: string;
  provider: string;
  feature: string;
  subtype: string;
  amount: number;
  term: number;
  sortBy: SortKey;
}

export const defaultMarketplaceFilters: MarketplaceFilterState = {
  query: "",
  provider: "",
  feature: "",
  subtype: "",
  amount: 25000,
  term: 60,
  sortBy: "relevance",
};

export function getScopedOffers({
  offers,
  country,
  category,
}: {
  offers: MarketplaceOffer[];
  country: string;
  category: ExplorerCategory;
}) {
  return offers.filter((offer) => {
    if (!matchesOfferCountrySelection(offer, country)) {
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
  country,
  category,
  filters,
}: {
  offers: MarketplaceOffer[];
  country: string;
  category: ExplorerCategory;
  filters: MarketplaceFilterState;
}) {
  let result = getScopedOffers({ offers, country, category });
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

  return sortOffers(result, filters.sortBy, category);
}

function sortOffers(offers: MarketplaceOffer[], sortBy: SortKey, category: ExplorerCategory) {
  return [...offers].sort((left, right) => {
    switch (sortBy) {
      case "apr": {
        const leftApr = parseMetricRange(getMetricValue(left, ["APR"])).min ?? 999;
        const rightApr = parseMetricRange(getMetricValue(right, ["APR"])).min ?? 999;
        return leftApr - rightApr;
      }
      case "fees": {
        const leftFee = parseMetricRange(getMetricValue(left, ["Fee", "Fees", "Annual fee", "Monthly fee", "Spread", "FX markup", "Conversion fee"])).min ?? 999;
        const rightFee = parseMetricRange(getMetricValue(right, ["Fee", "Fees", "Annual fee", "Monthly fee", "Spread", "FX markup", "Conversion fee"])).min ?? 999;
        return leftFee - rightFee;
      }
      case "provider":
        return left.providerName.localeCompare(right.providerName);
      case "updated":
        return (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
      default: {
        if (left.category !== right.category && category === "all") {
          return marketplaceCategories.indexOf(left.category) - marketplaceCategories.indexOf(right.category);
        }
        return right.affiliatePriorityScore - left.affiliatePriorityScore;
      }
    }
  });
}

export function getProviderOptions(
  offers: MarketplaceOffer[],
  country: string,
  category: ExplorerCategory,
) {
  return Array.from(
    new Set(getScopedOffers({ offers, country, category }).map((offer) => offer.providerName)),
  ).sort();
}

export function getFeatureOptions(
  offers: MarketplaceOffer[],
  country: string,
  category: ExplorerCategory,
) {
  const scope = getScopedOffers({ offers, country, category });
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
  country: string,
  category: ExplorerCategory,
) {
  if (category !== "insurance" && category !== "investments") {
    return [];
  }

  return Array.from(
    new Set(
      getScopedOffers({ offers, country, category })
        .map((offer) => offer.attributes?.subtype)
        .filter(Boolean),
    ),
  )
    .sort() as string[];
}

export function countOffersByCategory(offers: MarketplaceOffer[], country: string) {
  const scoped = getScopedOffers({ offers, country, category: "all" });

  return marketplaceCategories.reduce(
    (acc, category) => {
      acc[category] = scoped.filter((offer) => offer.category === category).length;
      return acc;
    },
    {} as Record<MarketplaceCategory, number>,
  );
}
