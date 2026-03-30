import type { MarketplaceOffer } from "@payn/types";

export type OfferDecisionBadge = "bestValue" | "fastest" | "noFees";

export function getOfferDecisionBadge(
  offer: MarketplaceOffer,
  rank: number,
): OfferDecisionBadge {
  if (rank === 1) {
    return "bestValue";
  }

  const metricValues = offer.metrics.map((metric) => metric.value.toLowerCase());
  const showsZeroFee = metricValues.some(
    (value) =>
      value.includes("eur 0") ||
      value.includes("€0") ||
      value.includes("0.00") ||
      value.includes("0%") ||
      value.includes("free") ||
      value.includes("no fee"),
  );

  if (offer.attributes?.feeProfile === "low" || showsZeroFee) {
    return "noFees";
  }

  if (offer.category === "transfers" || offer.category === "exchange") {
    return "fastest";
  }

  return "bestValue";
}
