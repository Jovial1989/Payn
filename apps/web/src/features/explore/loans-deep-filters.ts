import type { MarketplaceOffer, MarketplaceOfferAttributes } from "@payn/types";

// ─── Loans / BNPL deep filters ───────────────────────────────────────────────
//
// /explore/big-purchases shows ~13 loans/BNPL offers. The three questions
// every borrower asks are "what's the rate?", "how much can I borrow?",
// "for how long?". Backed by typed attributes (minAmount, maxAmount,
// minTermMonths, maxTermMonths) when present, with a metric-string
// fallback so older offers without enrichment still classify.

export interface LoanSubFilterOption {
  value: string;
  label: string;
  test: (offer: MarketplaceOffer) => boolean;
}

export interface LoanSubFilter {
  key: string;
  label: string;
  options: LoanSubFilterOption[];
}

const LOAN_CATEGORIES = new Set(["loans", "bnpl"]);

export function isLoanCategory(category: string): boolean {
  return LOAN_CATEGORIES.has(category);
}

const attrs = (o: MarketplaceOffer): MarketplaceOfferAttributes =>
  (o.attributes ?? {}) as MarketplaceOfferAttributes;

// Parse APR range from a metric value like "4.5% – 12.5%" / "3.9% - 8.9%".
// Returns the [min, max] bracket the offer advertises. When only one
// number is present we return [n, n] so range tests still work.
function parseAprRange(offer: MarketplaceOffer): [number, number] | null {
  const m = offer.metrics.find((x) => /\bapr\b/i.test(x.label));
  if (!m) return null;
  const nums = Array.from(m.value.matchAll(/(\d+(?:\.\d+)?)\s*%/g)).map((g) =>
    parseFloat(g[1]),
  );
  if (nums.length === 0) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return [min, max];
}

function lowestApr(offer: MarketplaceOffer): number | null {
  const range = parseAprRange(offer);
  return range ? range[0] : null;
}

// ── Filter definitions ────────────────────────────────────────────────────────
const APR_FILTER: LoanSubFilter = {
  key: "loan-apr",
  label: "Lowest APR",
  options: [
    {
      value: "under-5",
      label: "Under 5%",
      test: (o) => {
        const v = lowestApr(o);
        return v !== null && v < 5;
      },
    },
    {
      value: "5-10",
      label: "5% – 10%",
      test: (o) => {
        const v = lowestApr(o);
        return v !== null && v >= 5 && v < 10;
      },
    },
    {
      value: "over-10",
      label: "Over 10%",
      test: (o) => {
        const v = lowestApr(o);
        return v !== null && v >= 10;
      },
    },
  ],
};

// Amount filter — picks offers whose range includes the user's chosen
// bracket. "Up to €10K" returns offers that can give a €10K loan
// (minAmount <= 10K), not just offers whose ceiling is below €10K.
const AMOUNT_FILTER: LoanSubFilter = {
  key: "loan-amount",
  label: "Amount needed",
  options: [
    {
      value: "under-10k",
      label: "Up to €10K",
      test: (o) => {
        const a = attrs(o);
        if (typeof a.minAmount !== "number") return false;
        return a.minAmount <= 10_000;
      },
    },
    {
      value: "10k-50k",
      label: "€10K – €50K",
      test: (o) => {
        const a = attrs(o);
        if (typeof a.minAmount !== "number" || typeof a.maxAmount !== "number") {
          return false;
        }
        return a.minAmount <= 50_000 && a.maxAmount >= 10_000;
      },
    },
    {
      value: "over-50k",
      label: "Over €50K",
      test: (o) => {
        const a = attrs(o);
        if (typeof a.maxAmount !== "number") return false;
        return a.maxAmount >= 50_000;
      },
    },
  ],
};

const TERM_FILTER: LoanSubFilter = {
  key: "loan-term",
  label: "Term",
  options: [
    {
      value: "short",
      label: "Up to 24 months",
      test: (o) => {
        const a = attrs(o);
        if (typeof a.minTermMonths !== "number") return false;
        return a.minTermMonths <= 24;
      },
    },
    {
      value: "medium",
      label: "24 – 60 months",
      test: (o) => {
        const a = attrs(o);
        if (
          typeof a.minTermMonths !== "number" ||
          typeof a.maxTermMonths !== "number"
        ) {
          return false;
        }
        return a.minTermMonths <= 60 && a.maxTermMonths >= 24;
      },
    },
    {
      value: "long",
      label: "60+ months",
      test: (o) => {
        const a = attrs(o);
        if (typeof a.maxTermMonths !== "number") return false;
        return a.maxTermMonths >= 60;
      },
    },
  ],
};

const LOAN_FILTERS: LoanSubFilter[] = [APR_FILTER, AMOUNT_FILTER, TERM_FILTER];

export function getLoanSubFilters(): LoanSubFilter[] {
  return LOAN_FILTERS;
}

export function matchesLoanSubFilters(
  offer: MarketplaceOffer,
  active: Record<string, string>,
): boolean {
  for (const f of LOAN_FILTERS) {
    const v = active[f.key];
    if (!v) continue;
    const opt = f.options.find((o) => o.value === v);
    if (!opt) continue;
    if (!opt.test(offer)) return false;
  }
  return true;
}
