import { describe, expect, it } from "vitest";
import {
  type RankableCostRow,
  compareByRealCost,
  isRankedByRealCost,
} from "./ranking";

const row = (
  costValue: number,
  tieLabel: string,
  affiliatePriorityScore = 0,
  costDirection: "asc" | "desc" = "asc",
): RankableCostRow => ({ costValue, costDirection, affiliatePriorityScore, tieLabel });

describe("compareByRealCost", () => {
  it("orders ascending-cost categories cheapest first", () => {
    const sorted = [row(220, "B"), row(210, "A"), row(230, "C")]
      .sort(compareByRealCost)
      .map((r) => r.costValue);
    expect(sorted).toEqual([210, 220, 230]);
  });

  it("orders descending-outcome categories highest first (transfers/savings)", () => {
    const sorted = [
      row(980, "B", 0, "desc"),
      row(995, "A", 0, "desc"),
      row(970, "C", 0, "desc"),
    ]
      .sort(compareByRealCost)
      .map((r) => r.costValue);
    expect(sorted).toEqual([995, 980, 970]);
  });

  it("breaks an EXACT cost tie by affiliate priority, then alphabetically", () => {
    const sorted = [
      row(218.91, "SEB", 0.4),
      row(218.91, "Raiffeisen", 0.9),
      row(218.91, "Abanca", 0.4),
    ]
      .sort(compareByRealCost)
      .map((r) => r.tieLabel);
    // Raiffeisen wins on affiliate priority; SEB/Abanca tie → alphabetical.
    expect(sorted).toEqual(["Raiffeisen", "Abanca", "SEB"]);
  });

  it("affiliate priority can NEVER lift a pricier offer above a cheaper one", () => {
    // Pricier offer has max priority; cheaper has none. Cheaper must still win.
    const [first] = [row(219.33, "ING", 1), row(218.91, "SEB", 0)].sort(
      compareByRealCost,
    );
    expect(first.tieLabel).toBe("SEB");
  });
});

describe("isRankedByRealCost — the promise-A guardian", () => {
  it("flags the exact loans mis-ranking the audit found", () => {
    // Live order: SEB (218.91) sat BELOW ING (219.33) and Cetelem (219.81).
    const shipped = [
      row(219.33, "ING"),
      row(219.81, "Cetelem"),
      row(218.91, "SEB"),
    ];
    expect(isRankedByRealCost(shipped)).toBe(false);
  });

  it("passes once the list is sorted cost-first", () => {
    const fixed = [
      row(218.91, "Raiffeisen"),
      row(218.91, "SEB"),
      row(219.33, "ING"),
      row(219.81, "Cetelem"),
      row(225.0, "Ferratum"),
      row(228.19, "Creditea"),
    ].sort(compareByRealCost);
    expect(isRankedByRealCost(fixed)).toBe(true);
    expect(fixed.map((r) => r.costValue)).toEqual([
      218.91, 218.91, 219.33, 219.81, 225.0, 228.19,
    ]);
  });
});
