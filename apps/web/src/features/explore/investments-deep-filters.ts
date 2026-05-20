import type { MarketplaceOffer, MarketplaceOfferAttributes } from "@payn/types";

// ─── Investments / Trading / Crypto deep filters ─────────────────────────────
//
// /explore/invest-and-grow shows ~19 platforms. They split on the type of
// access (crypto wallet vs ETF dealing vs multi-asset brokerage) and on
// whether the platform's UX is built for a first-time buyer — those are
// the two real decisions before fees come into play.

export interface InvestmentSubFilterOption {
  value: string;
  label: string;
  test: (offer: MarketplaceOffer) => boolean;
}

export interface InvestmentSubFilter {
  key: string;
  label: string;
  options: InvestmentSubFilterOption[];
}

const INVESTMENT_CATEGORIES = new Set(["investments", "trading", "crypto"]);

export function isInvestmentCategory(category: string): boolean {
  return INVESTMENT_CATEGORIES.has(category);
}

const attrs = (o: MarketplaceOffer): MarketplaceOfferAttributes =>
  (o.attributes ?? {}) as MarketplaceOfferAttributes;

// ── Platform type ────────────────────────────────────────────────────────────
//
// Reads `attributes.accessType` (typed enum on every enriched offer) and
// falls back to scanning the subtitle / bestFor for the rare offer that
// hasn't been classified yet. Bundles spot_crypto + crypto category into
// "Crypto", and pools commodity / FX / multi-asset under "Mixed brokerage"
// so the UI doesn't list 6 single-offer pills.
const PLATFORM_FILTER: InvestmentSubFilter = {
  key: "investment-platform",
  label: "Platform",
  options: [
    {
      value: "crypto",
      label: "Crypto",
      test: (o) => {
        if (o.category === "crypto") return true;
        if (attrs(o).accessType === "spot_crypto") return true;
        const hay = `${o.subtitle ?? ""} ${(o.bestFor ?? []).join(" ")}`;
        return /\bcrypto|bitcoin|ethereum\b/i.test(hay);
      },
    },
    {
      value: "etf",
      label: "ETFs",
      test: (o) => {
        if (attrs(o).accessType === "etf_dealing") return true;
        const hay = `${o.title ?? ""} ${o.subtitle ?? ""} ${(o.bestFor ?? []).join(" ")}`;
        return /\betf\b/i.test(hay);
      },
    },
    {
      value: "stocks",
      label: "Stocks",
      test: (o) => {
        if (attrs(o).accessType === "multi_asset_brokerage") return true;
        const hay = `${o.title ?? ""} ${o.subtitle ?? ""} ${(o.bestFor ?? []).join(" ")}`;
        return /\bstocks?|shares|equities\b/i.test(hay);
      },
    },
    {
      value: "robo",
      label: "Robo-advisor",
      test: (o) => {
        const hay = `${o.title ?? ""} ${o.subtitle ?? ""} ${(o.bestFor ?? []).join(" ")}`;
        return /\brobo[- ]?advisor|automated\s+invest|managed\s+portfolio\b/i.test(hay);
      },
    },
    {
      value: "recurring",
      label: "Recurring buys",
      test: (o) => {
        if (attrs(o).accessType === "recurring_buy") return true;
        return attrs(o).recurringSupported === true;
      },
    },
  ],
};

// ── Beginner-friendly ─────────────────────────────────────────────────────────
const SKILL_FILTER: InvestmentSubFilter = {
  key: "investment-skill",
  label: "Best for",
  options: [
    {
      value: "beginner",
      label: "First-time investors",
      test: (o) => {
        const a = attrs(o);
        if (a.beginnerFriendly === true) return true;
        if (a.platformUxLevel === "beginner") return true;
        const hay = `${(o.bestFor ?? []).join(" ")}`;
        return /\bbeginner|first[- ]time|simple\b/i.test(hay);
      },
    },
    {
      value: "advanced",
      label: "Advanced / Pro tools",
      test: (o) => {
        const a = attrs(o);
        if (a.platformUxLevel === "advanced" || a.platformUxLevel === "pro") return true;
        const hay = `${(o.bestFor ?? []).join(" ")}`;
        return /\badvanced|professional|active\s+traders?\b/i.test(hay);
      },
    },
  ],
};

const INVESTMENT_FILTERS: InvestmentSubFilter[] = [
  PLATFORM_FILTER,
  SKILL_FILTER,
];

export function getInvestmentSubFilters(): InvestmentSubFilter[] {
  return INVESTMENT_FILTERS;
}

export function matchesInvestmentSubFilters(
  offer: MarketplaceOffer,
  active: Record<string, string>,
): boolean {
  for (const f of INVESTMENT_FILTERS) {
    const v = active[f.key];
    if (!v) continue;
    const opt = f.options.find((o) => o.value === v);
    if (!opt) continue;
    if (!opt.test(offer)) return false;
  }
  return true;
}
