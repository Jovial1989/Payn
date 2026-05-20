import type { MarketplaceOffer } from "@payn/types";

// ─── Savings deep filters ────────────────────────────────────────────────────
//
// /explore/earn-on-cash carries the high-yield savings + cash account
// offers. Headline metric is always Interest rate, but the values are
// free-form strings ("4.0% per year", "Up to 5.1% (USD)", "Up to 3.49%
// (Metal)"). Two real decisions: how high is the rate, and how soon
// can I get to my money?

export interface SavingsSubFilterOption {
  value: string;
  label: string;
  test: (offer: MarketplaceOffer) => boolean;
}

export interface SavingsSubFilter {
  key: string;
  label: string;
  options: SavingsSubFilterOption[];
}

export function isSavingsCategory(category: string): boolean {
  return category === "savings";
}

// Pull the highest % figure out of the Interest rate metric. "Up to 5.1%
// (USD)" → 5.1. "0.5 - 1%" → 1. Returns null when no parseable
// percentage is found.
function highestRate(offer: MarketplaceOffer): number | null {
  const m = offer.metrics.find((x) => /\b(interest|rate|aer|apy)\b/i.test(x.label));
  if (!m) return null;
  const nums = Array.from(m.value.matchAll(/(\d+(?:\.\d+)?)\s*%/g)).map((g) =>
    parseFloat(g[1]),
  );
  if (nums.length === 0) return null;
  return Math.max(...nums);
}

// Pull a numeric minimum-deposit figure. "EUR 1" → 1, "EUR 100,000" →
// 100000. Falls back to null when the metric doesn't carry a clean
// number.
function minDepositValue(offer: MarketplaceOffer): number | null {
  const m = offer.metrics.find((x) =>
    /\b(min(imum)?\s*(deposit)?|min)\b/i.test(x.label),
  );
  if (!m) return null;
  const cleaned = m.value.replace(/[,\s]/g, "");
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

// Quick keyword scan of the "Access" metric value when present, with
// title + bestFor as backup signals.
function accessKind(offer: MarketplaceOffer): "instant" | "notice" | "fixed" | "unknown" {
  const accessMetric = offer.metrics.find((x) => /\baccess\b/i.test(x.label));
  const hay = `${accessMetric?.value ?? ""} ${(offer.bestFor ?? []).join(" ")} ${offer.title ?? ""}`;
  if (/\b(instant|same[- ]day|on[- ]demand|anytime|flexible)\b/i.test(hay)) return "instant";
  if (/\b(notice|withdrawal\s+notice|\d+[- ]day\s+notice)\b/i.test(hay)) return "notice";
  if (/\b(fixed|term|locked|maturity|bond)\b/i.test(hay)) return "fixed";
  return "unknown";
}

const RATE_FILTER: SavingsSubFilter = {
  key: "savings-rate",
  label: "Best rate",
  options: [
    {
      value: "over-4",
      label: "4% or more",
      test: (o) => {
        const r = highestRate(o);
        return r !== null && r >= 4;
      },
    },
    {
      value: "3-4",
      label: "3% – 4%",
      test: (o) => {
        const r = highestRate(o);
        return r !== null && r >= 3 && r < 4;
      },
    },
    {
      value: "under-3",
      label: "Under 3%",
      test: (o) => {
        const r = highestRate(o);
        return r !== null && r < 3;
      },
    },
  ],
};

const MIN_DEPOSIT_FILTER: SavingsSubFilter = {
  key: "savings-min",
  label: "Min deposit",
  options: [
    {
      value: "low",
      label: "€100 or less",
      test: (o) => {
        const v = minDepositValue(o);
        return v !== null && v <= 100;
      },
    },
    {
      value: "mid",
      label: "€100 – €10K",
      test: (o) => {
        const v = minDepositValue(o);
        return v !== null && v > 100 && v <= 10_000;
      },
    },
    {
      value: "high",
      label: "Over €10K",
      test: (o) => {
        const v = minDepositValue(o);
        return v !== null && v > 10_000;
      },
    },
  ],
};

const ACCESS_FILTER: SavingsSubFilter = {
  key: "savings-access",
  label: "Access",
  options: [
    {
      value: "instant",
      label: "Instant",
      test: (o) => accessKind(o) === "instant",
    },
    {
      value: "notice",
      label: "Notice period",
      test: (o) => accessKind(o) === "notice",
    },
    {
      value: "fixed",
      label: "Fixed term",
      test: (o) => accessKind(o) === "fixed",
    },
  ],
};

const SAVINGS_FILTERS: SavingsSubFilter[] = [
  RATE_FILTER,
  MIN_DEPOSIT_FILTER,
  ACCESS_FILTER,
];

export function getSavingsSubFilters(): SavingsSubFilter[] {
  return SAVINGS_FILTERS;
}

export function matchesSavingsSubFilters(
  offer: MarketplaceOffer,
  active: Record<string, string>,
): boolean {
  for (const f of SAVINGS_FILTERS) {
    const v = active[f.key];
    if (!v) continue;
    const opt = f.options.find((o) => o.value === v);
    if (!opt) continue;
    if (!opt.test(offer)) return false;
  }
  return true;
}
