import { describe, expect, it } from "vitest";
import type { MarketplaceOffer } from "@payn/types";
import { countByCategory, countTotals, dedupeByProviderCategory } from "./inventory";

const offer = (id: string, category: string, providerName: string): MarketplaceOffer =>
  ({ id, category, providerName } as unknown as MarketplaceOffer);

// A scoped list resembling one market: 3 loans, 1 bnpl, 2 cards.
const scoped: MarketplaceOffer[] = [
  offer("l1", "loans", "SEB"),
  offer("l2", "loans", "ING"),
  offer("l3", "loans", "Cetelem"),
  offer("b1", "bnpl", "Klarna"),
  offer("c1", "cards", "Revolut"),
  offer("c2", "cards", "N26"),
];

describe("inventory single-source counting (P1.1)", () => {
  it("counts per category so a tile can read the exact number its page shows", () => {
    const byCategory = countByCategory(scoped);
    // A 'Borrowing' tile linking to /loans reads byCategory.loans (=3),
    // matching the /loans header — not the loans+bnpl group.
    expect(byCategory.loans).toBe(3);
    expect(byCategory.bnpl).toBe(1);
    expect(byCategory.cards).toBe(2);
    expect(byCategory.savings ?? 0).toBe(0);
  });

  it("dedupes multi-plan providers per category (matches the page's dedup)", () => {
    // 3 insurance plans from Allianz + 1 from AXA → 2 distinct offers, so the
    // tile reads 2, not 4 (which is what /insurance shows after DB dedup).
    const insurance = [
      offer("a1", "insurance", "Allianz"),
      offer("a2", "insurance", "Allianz"),
      offer("a3", "insurance", "Allianz"),
      offer("x1", "insurance", "AXA"),
    ];
    const deduped = dedupeByProviderCategory(insurance);
    expect(deduped.length).toBe(2);
    expect(countByCategory(deduped).insurance).toBe(2);
  });

  it("totals count distinct providers", () => {
    expect(countTotals(scoped)).toEqual({ productCount: 6, providerCount: 6 });
    const withDupeProvider = [...scoped, offer("c3", "cards", "Revolut")];
    expect(countTotals(withDupeProvider)).toEqual({ productCount: 7, providerCount: 6 });
  });
});
