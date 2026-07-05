import { describe, expect, it } from "vitest";
import type { MarketplaceOffer } from "@payn/types";
import {
  STALE_REPORT_DAYS,
  STALE_WARN_DAYS,
  getStaleOffers,
  offerStaleness,
} from "./staleness";

const NOW = new Date("2026-07-05T00:00:00Z");
const daysAgo = (n: number) =>
  new Date(NOW.getTime() - n * 86_400_000).toISOString();

const offer = (over: Partial<MarketplaceOffer>): MarketplaceOffer =>
  ({ slug: "x", providerName: "P", updatedAt: daysAgo(1), ...over } as MarketplaceOffer);

describe("offerStaleness (P1.3)", () => {
  it("fresh within the warn window", () => {
    expect(offerStaleness(offer({ updatedAt: daysAgo(30) }), NOW).level).toBe("fresh");
  });

  it("aging past 60 days → amber notice on the page", () => {
    expect(offerStaleness(offer({ updatedAt: daysAgo(STALE_WARN_DAYS + 5) }), NOW).level).toBe(
      "aging",
    );
  });

  it("overdue past 120 days → build-time report", () => {
    expect(offerStaleness(offer({ updatedAt: daysAgo(STALE_REPORT_DAYS + 5) }), NOW).level).toBe(
      "overdue",
    );
  });

  it("prefers lastHumanReviewAt over updatedAt", () => {
    const o = offer({ updatedAt: daysAgo(400), lastHumanReviewAt: daysAgo(3) });
    expect(offerStaleness(o, NOW).level).toBe("fresh");
  });

  it("an offer with no parseable date is not flagged", () => {
    const o = offer({ updatedAt: "", lastHumanReviewAt: undefined });
    expect(offerStaleness(o, NOW).level).toBe("fresh");
  });
});

describe("getStaleOffers", () => {
  it("lists only offers past the report threshold, worst first", () => {
    const offers = [
      offer({ slug: "fresh", updatedAt: daysAgo(10) }),
      offer({ slug: "old", updatedAt: daysAgo(200) }),
      offer({ slug: "older", updatedAt: daysAgo(300) }),
    ];
    const stale = getStaleOffers(offers, NOW);
    expect(stale.map((s) => s.slug)).toEqual(["older", "old"]);
  });
});
