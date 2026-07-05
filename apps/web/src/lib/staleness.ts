import type { MarketplaceOffer } from "@payn/types";

// P1.3 — the freshness guard. Promise B says catalogue terms are verified at
// least monthly; this surfaces offers that have drifted past that so the page
// tells the truth ("confirm current terms") instead of implying fresh data.
// Uses the dates the offers already carry — no schema change.

export const STALE_WARN_DAYS = 60; // amber "confirm with provider" on the offer page
export const STALE_REPORT_DAYS = 120; // flagged in the build-time re-verify report

export type StalenessLevel = "fresh" | "aging" | "overdue";

/** Best available verification date: human review → last-checked → updated. */
export function offerVerifiedAt(offer: MarketplaceOffer): Date | null {
  const raw =
    offer.lastHumanReviewAt ??
    (offer.attributes as { lastCheckedAt?: string } | undefined)?.lastCheckedAt ??
    offer.updatedAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}

export interface OfferStaleness {
  verifiedAt: Date | null;
  days: number | null;
  level: StalenessLevel;
}

/**
 * `now` is injected so this stays pure and testable. An offer with no parseable
 * date is treated as "fresh" (we don't flag what we can't measure) rather than
 * crying wolf on every row.
 */
export function offerStaleness(offer: MarketplaceOffer, now: Date): OfferStaleness {
  const verifiedAt = offerVerifiedAt(offer);
  if (!verifiedAt) return { verifiedAt: null, days: null, level: "fresh" };
  const days = daysBetween(verifiedAt, now);
  const level: StalenessLevel =
    days > STALE_REPORT_DAYS ? "overdue" : days > STALE_WARN_DAYS ? "aging" : "fresh";
  return { verifiedAt, days, level };
}

/** Offers past the report threshold — fed to the build-time re-verify report. */
export function getStaleOffers(
  offers: MarketplaceOffer[],
  now: Date,
  thresholdDays: number = STALE_REPORT_DAYS,
): Array<{ slug: string; providerName: string; days: number }> {
  return offers
    .map((offer) => {
      const { verifiedAt } = offerStaleness(offer, now);
      return verifiedAt
        ? { slug: offer.slug, providerName: offer.providerName, days: daysBetween(verifiedAt, now) }
        : null;
    })
    .filter((row): row is { slug: string; providerName: string; days: number } =>
      Boolean(row && row.days > thresholdDays),
    )
    .sort((a, b) => b.days - a.days);
}
