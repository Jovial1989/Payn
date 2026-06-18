import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";
import { matchesOfferCountrySelection } from "@/lib/countries";
import type { ExplorerCategory } from "@/lib/marketplace";
import {
  getOfferSearchText,
  parseMetricRange,
  getMetricValue,
  marketplaceCategories,
} from "@/lib/marketplace";

export type SortKey = "realCost" | "relevance" | "fees" | "speed" | "recommended";

// Labels we treat as a "real cost" signal. Lower is better. Mirrors the set
// the existing `fees` case parsed, so both sorts read the same metrics.
const COST_METRIC_LABELS = [
  "Fee",
  "Fees",
  "Annual fee",
  "Monthly fee",
  "Spread",
  "FX markup",
  "Conversion fee",
] as const;

/**
 * Normalised true-cost signal for an offer. Returns the lowest parseable cost
 * metric (in whatever unit the metric is quoted), or `null` when the offer
 * exposes no parseable cost — those must sort to the BOTTOM, never the top, so
 * "no data" can never win a cost-first ranking.
 */
export function getRealCostSignal(offer: MarketplaceOffer): number | null {
  return parseMetricRange(getMetricValue(offer, [...COST_METRIC_LABELS])).min;
}

/**
 * Cost-first comparator. Cheapest first; offers without a parseable cost sink
 * to the bottom; ties (equal or both-unparseable costs) fall back to the
 * disclosed affiliate-priority tie-breaker.
 */
function compareByRealCost(left: MarketplaceOffer, right: MarketplaceOffer) {
  const leftCost = getRealCostSignal(left);
  const rightCost = getRealCostSignal(right);

  if (leftCost === null && rightCost === null) {
    return right.affiliatePriorityScore - left.affiliatePriorityScore;
  }
  if (leftCost === null) {
    return 1;
  }
  if (rightCost === null) {
    return -1;
  }
  if (leftCost !== rightCost) {
    return leftCost - rightCost;
  }

  return right.affiliatePriorityScore - left.affiliatePriorityScore;
}

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
  // Brand promise: ranked by real cost, not commission. The default order
  // leads with the lowest true cost; affiliate priority is only a tie-breaker.
  sortBy: "realCost",
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

export function sortOffers(offers: MarketplaceOffer[], sortBy: SortKey, category: ExplorerCategory) {
  return [...offers].sort((left, right) => {
    switch (sortBy) {
      case "realCost": {
        // Preserve the cross-category grouping the "all" view relies on, then
        // order by real cost (cheapest first) within each category.
        if (left.category !== right.category && category === "all") {
          return marketplaceCategories.indexOf(left.category) - marketplaceCategories.indexOf(right.category);
        }
        return compareByRealCost(left, right);
      }
      case "fees": {
        const leftFee = getRealCostSignal(left) ?? 999;
        const rightFee = getRealCostSignal(right) ?? 999;
        return leftFee - rightFee;
      }
      case "speed": {
        const order = { instant: 0, same_day: 1, next_day: 2, standard: 3 } as const;
        const leftSpeed = order[left.attributes?.speed ?? "standard"];
        const rightSpeed = order[right.attributes?.speed ?? "standard"];
        return leftSpeed - rightSpeed || right.affiliatePriorityScore - left.affiliatePriorityScore;
      }
      case "recommended":
        return Number(Boolean(right.attributes?.isPartner)) - Number(Boolean(left.attributes?.isPartner)) ||
          (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "") ||
          right.affiliatePriorityScore - left.affiliatePriorityScore;
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
