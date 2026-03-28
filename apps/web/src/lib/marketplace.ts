import type {
  MarketplaceCategory,
  MarketplaceLocale,
  MarketplaceMarket,
  MarketplaceOffer,
} from "@payn/types";

export type ExplorerCategory = MarketplaceCategory | "all";

export const supportedMarkets: MarketplaceMarket[] = [
  "eu",
  "international",
  "de",
  "es",
  "uk",
  "fr",
  "it",
  "pt",
  "nl",
];

export const supportedLocales: MarketplaceLocale[] = ["en", "de", "es", "fr", "it", "pt"];

export const marketplaceCategories: MarketplaceCategory[] = [
  "loans",
  "cards",
  "transfers",
  "exchange",
  "insurance",
  "investments",
];

export const explorerCategories: ExplorerCategory[] = ["all", ...marketplaceCategories];

export const marketDefinitions: Record<
  MarketplaceMarket,
  {
    marketCode: string;
    currency: string;
    fallbackLocale: MarketplaceLocale;
    label: string;
  }
> = {
  eu: { marketCode: "EU", currency: "EUR", fallbackLocale: "en", label: "All Europe" },
  international: {
    marketCode: "INTL",
    currency: "Multi-currency",
    fallbackLocale: "en",
    label: "International",
  },
  de: { marketCode: "DE", currency: "EUR", fallbackLocale: "de", label: "Germany" },
  es: { marketCode: "ES", currency: "EUR", fallbackLocale: "es", label: "Spain" },
  uk: { marketCode: "UK", currency: "GBP", fallbackLocale: "en", label: "United Kingdom" },
  fr: { marketCode: "FR", currency: "EUR", fallbackLocale: "fr", label: "France" },
  it: { marketCode: "IT", currency: "EUR", fallbackLocale: "it", label: "Italy" },
  pt: { marketCode: "PT", currency: "EUR", fallbackLocale: "pt", label: "Portugal" },
  nl: { marketCode: "NL", currency: "EUR", fallbackLocale: "en", label: "Netherlands" },
};

export const categoryMeta: Record<
  MarketplaceCategory,
  { label: string; shortLabel: string }
> = {
  loans: { label: "Loans", shortLabel: "loan" },
  cards: { label: "Cards", shortLabel: "card" },
  transfers: { label: "Transfers", shortLabel: "transfer" },
  exchange: { label: "Exchange", shortLabel: "exchange" },
  insurance: { label: "Insurance", shortLabel: "insurance" },
  investments: { label: "Investments", shortLabel: "investment" },
};

const globalProviderNames = new Set([
  "Wise",
  "Revolut",
  "Payoneer",
  "Remitly",
  "XE",
  "SafetyWing",
  "eToro",
  "Coinbase",
  "Bitpanda",
]);

export function normalizeDisplayText(value: string) {
  return value.replace(/[–—]/g, "-");
}

export function isMarketplaceCategory(value: string): value is MarketplaceCategory {
  return marketplaceCategories.includes(value as MarketplaceCategory);
}

export function isExplorerCategory(value: string): value is ExplorerCategory {
  return explorerCategories.includes(value as ExplorerCategory);
}

export function isSupportedMarket(value: string): value is MarketplaceMarket {
  return supportedMarkets.includes(value as MarketplaceMarket);
}

export function isSupportedLocale(value: string): value is MarketplaceLocale {
  return supportedLocales.includes(value as MarketplaceLocale);
}

export function normalizeMarket(value?: string | null): MarketplaceMarket {
  if (value && isSupportedMarket(value)) {
    return value;
  }
  return "eu";
}

export function normalizeLocale(value?: string | null): MarketplaceLocale {
  if (value && isSupportedLocale(value)) {
    return value;
  }
  return "en";
}

export function getCategoryLabel(category: MarketplaceCategory) {
  return categoryMeta[category].label;
}

export function getMarketCategoryHref(market: MarketplaceMarket, category: MarketplaceCategory) {
  return `/${market}/${category}`;
}

export function getOfferHref(offer: Pick<MarketplaceOffer, "slug">) {
  return `/offers/${offer.slug}`;
}

export function getMetricValue(offer: MarketplaceOffer, labels: string[]) {
  return offer.metrics.find((metric) => labels.includes(metric.label))?.value;
}

export function parseMetricNumbers(value?: string) {
  if (!value) {
    return [];
  }

  return [...value.matchAll(/(\d+(?:[.,]\d+)?)/g)].map((match) =>
    Number(match[1].replace(/,/g, "")),
  );
}

export function parseMetricRange(value?: string) {
  const values = parseMetricNumbers(value);
  if (values.length === 0) {
    return { min: null, max: null };
  }

  return {
    min: values[0] ?? null,
    max: values[values.length - 1] ?? values[0] ?? null,
  };
}

export function getOfferTradeoff(offer: MarketplaceOffer) {
  const apr = parseMetricRange(getMetricValue(offer, ["APR"])).min;
  const annualFee = parseMetricRange(getMetricValue(offer, ["Annual fee", "Monthly fee"])).max;
  const speed = getMetricValue(offer, ["Speed"]);
  const spread = getMetricValue(offer, ["Spread", "FX markup", "Conversion fee"]);

  if (offer.category === "loans") {
    if ((apr ?? 0) >= 8) {
      return "Pricing can move up quickly for smaller amounts or thinner credit profiles.";
    }
    return "Final approval and pricing still depend on local eligibility, income, and credit checks.";
  }

  if (offer.category === "cards") {
    if ((annualFee ?? 0) > 0) {
      return "The strongest perks usually come with a recurring plan fee.";
    }
    return "Travel or reward value only pays off when it matches how you actually spend.";
  }

  if (offer.category === "transfers") {
    if (speed?.toLowerCase().includes("day")) {
      return "The lowest-cost route can still be slower than faster payout options.";
    }
    return "Delivered amount still changes with corridor, payout method, and timing.";
  }

  if (offer.category === "exchange") {
    if (spread && !spread.includes("0")) {
      return "A clean headline rate can still sit next to markups or conversion fees.";
    }
    return "The final rate still depends on spread, fee structure, and execution timing.";
  }

  if (offer.category === "insurance") {
    return "Premiums, exclusions, and acceptance can change with age, health, vehicle profile, or trip details.";
  }

  return "Low headline fees do not remove market risk, custody terms, FX costs, or product complexity.";
}

export function getOfferSearchText(offer: MarketplaceOffer) {
  const filterTags = offer.attributes?.searchTags ?? [];
  return [
    offer.providerName,
    offer.title,
    offer.subtitle,
    offer.category,
    offer.attributes?.subtype,
    ...offer.bestFor,
    ...filterTags,
    ...offer.metrics.flatMap((metric) => [metric.label, metric.value]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesOfferMarket(offer: MarketplaceOffer, market: MarketplaceMarket) {
  const codes = new Set(offer.countryCodes.map((code) => code.toUpperCase()));
  const directCode = marketDefinitions[market].marketCode;

  if (market === "eu") {
    return codes.has("EU") || codes.size >= 4;
  }

  if (market === "international") {
    return (
      codes.has("EU") ||
      codes.size >= 4 ||
      offer.attributes?.availability === "international" ||
      globalProviderNames.has(offer.providerName)
    );
  }

  return (
    codes.has(directCode) ||
    codes.has("EU") ||
    offer.attributes?.availability === "international"
  );
}

export function detectPreferencesFromAcceptLanguage(headerValue?: string | null) {
  const value = headerValue?.toLowerCase() ?? "";

  if (value.includes("de")) {
    return { market: "de" as MarketplaceMarket, locale: "de" as MarketplaceLocale };
  }
  if (value.includes("es")) {
    return { market: "es" as MarketplaceMarket, locale: "es" as MarketplaceLocale };
  }
  if (value.includes("fr")) {
    return { market: "fr" as MarketplaceMarket, locale: "fr" as MarketplaceLocale };
  }
  if (value.includes("it")) {
    return { market: "it" as MarketplaceMarket, locale: "it" as MarketplaceLocale };
  }
  if (value.includes("pt")) {
    return { market: "pt" as MarketplaceMarket, locale: "pt" as MarketplaceLocale };
  }
  if (value.includes("en-gb") || value.includes("gb") || value.includes("uk")) {
    return { market: "uk" as MarketplaceMarket, locale: "en" as MarketplaceLocale };
  }
  if (value.includes("nl")) {
    return { market: "nl" as MarketplaceMarket, locale: "en" as MarketplaceLocale };
  }

  return { market: "eu" as MarketplaceMarket, locale: "en" as MarketplaceLocale };
}

export function roundOfferCount(value: number) {
  if (value <= 5) {
    return `${value}`;
  }
  if (value < 15) {
    return `${Math.floor(value / 5) * 5}+`;
  }
  return `${Math.floor(value / 10) * 10}+`;
}
