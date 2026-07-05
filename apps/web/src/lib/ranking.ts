// P0.2 — the single source of truth for default result ordering.
//
// Promise A (/how-we-rank): "We rank by real cost — lowest total cost first",
// and the disclosed affiliate score "cannot move a more expensive offer above
// a cheaper one". This module encodes exactly that: the displayed cost metric
// decides rank; the affiliate priority only breaks an *exact* tie; provider
// name is the final, deterministic tie-break. Nothing else (relevance,
// popularity, simplicity, diversity) may reorder the default list.

export interface RankableCostRow {
  /** The real-cost metric shown to the user for this row. */
  costValue: number;
  /**
   * Which direction is "better":
   *  - "asc"  → lower is better (loan monthly payment, card yearly cost, price)
   *  - "desc" → higher is better (transfer recipient-gets, savings effective rate)
   */
  costDirection: "asc" | "desc";
  /** Disclosed affiliate priority — tie-break ONLY, never a primary factor. */
  affiliatePriorityScore: number;
  /** Final deterministic tie-break (typically the provider name). */
  tieLabel: string;
}

/**
 * Strict cost-first comparator. Returns <0 if `a` should rank above `b`.
 * Order: real cost → affiliate priority (desc) → alphabetical.
 */
export function compareByRealCost(a: RankableCostRow, b: RankableCostRow): number {
  if (a.costValue !== b.costValue) {
    const ascending = a.costValue - b.costValue;
    return a.costDirection === "asc" ? ascending : -ascending;
  }
  if (a.affiliatePriorityScore !== b.affiliatePriorityScore) {
    return b.affiliatePriorityScore - a.affiliatePriorityScore;
  }
  return a.tieLabel.localeCompare(b.tieLabel);
}

/**
 * Guardian used by the CI invariant test: true iff `rows` are already in
 * strict cost-first order. A cheaper offer must never appear below a more
 * expensive one; equal-cost rows must respect the disclosed tie-break.
 */
export function isRankedByRealCost(rows: RankableCostRow[]): boolean {
  for (let i = 1; i < rows.length; i += 1) {
    if (compareByRealCost(rows[i - 1], rows[i]) > 0) {
      return false;
    }
  }
  return true;
}
