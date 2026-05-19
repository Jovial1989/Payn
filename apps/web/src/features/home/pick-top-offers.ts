import type { MarketplaceOffer } from "@payn/types";
import { rankOffer } from "@/features/marketplace/offer-ranking";

// ─── pickTopOffers ────────────────────────────────────────────────────────────
//
// Category-diverse top-picks selector for the home page strip. Picks the
// highest-scoring offer from each of N "interesting" categories, then
// returns the top K of those by score. Output reads as a balanced trio
// rather than three cards in a row (which is what a flat top-3 would
// produce).
//
// Returns at most `count` offers — pads with affiliate priority when
// score data is insufficient. Always returns from the supplied
// countryMarket; never invents data.

// Priority of categories to consider — first six matter most. Order is
// also the tie-break: if two categories' top picks score identically the
// one earlier in this list wins.
const CANDIDATE_CATEGORIES = [
  "cards",
  "savings",
  "transfers",
  "loans",
  "insurance",
  "investments",
  "exchange",
  "neobanks",
];

export function pickTopOffers(
  countryMarket: MarketplaceOffer[],
  count = 3,
): MarketplaceOffer[] {
  type Candidate = { offer: MarketplaceOffer; score: number };
  const winners: Candidate[] = [];

  for (const category of CANDIDATE_CATEGORIES) {
    const pool = countryMarket.filter((o) => o.category === category);
    if (pool.length === 0) continue;
    const ranked: Candidate[] = pool.map((o) => ({
      offer: o,
      score: rankOffer(o, pool).score ?? o.affiliatePriorityScore ?? 0,
    }));
    ranked.sort((a, b) => b.score - a.score);
    if (ranked[0]) winners.push(ranked[0]);
  }

  // Sort the per-category winners by score and take the top `count`.
  winners.sort((a, b) => b.score - a.score);
  return winners.slice(0, count).map((w) => w.offer);
}
