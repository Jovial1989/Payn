import type { MarketplaceOffer } from "@payn/types";

/**
 * Generate human-readable match reasons explaining why an offer
 * ranks where it does. Based on real offer data, not fabricated.
 */
export function getMatchReasons(offer: MarketplaceOffer, rank: number): string[] {
  const reasons: string[] = [];

  // Rank-based reason
  if (rank <= 3) {
    reasons.push("Top-ranked in this category");
  }

  // APR-based reasons (loans)
  const aprMetric = offer.metrics.find((m) => m.label === "APR");
  if (aprMetric) {
    const match = aprMetric.value.match(/([\d.]+)%/);
    if (match) {
      const minApr = parseFloat(match[1]);
      if (minApr < 5) reasons.push("Competitive starting rate");
      else if (minApr < 8) reasons.push("Mid-range APR");
    }
  }

  // Fee-based reasons (transfers)
  const feeMetric = offer.metrics.find((m) => m.label === "Fee" || m.label === "Transfer fee");
  if (feeMetric) {
    if (feeMetric.value.includes("Free") || feeMetric.value.includes("0")) {
      reasons.push("Low or zero transfer fees");
    }
  }

  // Spread-based reasons (exchange)
  const spreadMetric = offer.metrics.find((m) => m.label === "Spread" || m.label === "FX markup");
  if (spreadMetric) {
    if (spreadMetric.value.includes("Mid-market") || spreadMetric.value.includes("0.0")) {
      reasons.push("Near mid-market exchange rate");
    }
  }

  // Amount range (loans)
  const amountMetric = offer.metrics.find((m) => m.label === "Amount");
  if (amountMetric) {
    if (amountMetric.value.includes("75,000") || amountMetric.value.includes("80,000") || amountMetric.value.includes("65,000")) {
      reasons.push("High borrowing limit available");
    }
  }

  // Market coverage
  if (offer.countryCodes.length >= 4) {
    reasons.push(`Available in ${offer.countryCodes.length}+ European markets`);
  }

  // Priority score indicates overall quality
  if (offer.affiliatePriorityScore >= 0.9) {
    reasons.push("High overall product score");
  }

  // Cap at 2 reasons to keep it clean
  return reasons.slice(0, 2);
}
