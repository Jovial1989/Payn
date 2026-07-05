import type {
  MarketplaceCategory,
  MarketplaceLocale,
  MarketplaceMarket,
  MarketplaceOffer,
} from "@payn/types";
import {
  matchesOfferCountrySelection,
  resolveCountryLegacyMarket,
} from "@/lib/countries";

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

export const supportedLocales: MarketplaceLocale[] = ["en", "de", "es", "fr"];

export const marketplaceCategories: MarketplaceCategory[] = [
  // Consumer banking & cards
  "banking",
  "neobanks",
  "savings",
  "debit",
  "cards",
  "wallets",
  // Send & exchange
  "transfers",
  "remittance",
  "exchange",
  "travel",
  // Borrow & pay later
  "loans",
  "bnpl",
  // Invest & trade
  "investments",
  "trading",
  "crypto",
  // Protect & insure
  "insurance",
  // Rewards
  "cashback",
  // Lifestyle & family
  "budgeting",
  "kids",
  // Business
  "business",
  "payroll",
  "tax",
  "expense",
];

export const explorerCategories: ExplorerCategory[] = ["all", ...marketplaceCategories];

export type SidebarNavGroupKey =
  | "groupBankingCards"
  | "groupSendExchange"
  | "groupBorrowPayLater"
  | "groupInvestTrade"
  | "groupProtectLifestyle"
  | "groupBusiness";

export type CategoryGroup = {
  id: string;
  labelKey: SidebarNavGroupKey;
  categories: MarketplaceCategory[];
};

// 5 + 1 canonical pillars. Same hierarchy applies in sidebar, footer and
// breadcrumbs — the spec's "5-6 core FinTech pillars" mandate.
//
// Reusing existing `groupX` keys so we don't break the i18n contract; the
// LABELS in i18n.ts have been rewritten to match the new pillar names.
//
//   Spend    → cards, debit, travel, cashback  (everyday outflow)
//   Save     → savings, banking, neobanks, investments, trading, crypto
//   Move     → transfers, exchange, remittance, wallets  (cross-border + p2p)
//   Borrow   → loans, bnpl
//   Protect  → insurance, kids, budgeting  (risk + control)
//   Business → business, payroll, tax, expense  (separate vertical)
export const categoryGroups: CategoryGroup[] = [
  { id: "spend",    labelKey: "groupBankingCards",     categories: ["cards", "debit", "travel", "cashback"] },
  { id: "save",     labelKey: "groupInvestTrade",      categories: ["savings", "banking", "neobanks", "investments", "trading", "crypto"] },
  { id: "move",     labelKey: "groupSendExchange",     categories: ["transfers", "exchange", "remittance", "wallets"] },
  { id: "borrow",   labelKey: "groupBorrowPayLater",   categories: ["loans", "bnpl"] },
  { id: "protect",  labelKey: "groupProtectLifestyle", categories: ["insurance", "kids", "budgeting"] },
  { id: "business", labelKey: "groupBusiness",         categories: ["business", "payroll", "tax", "expense"] },
];

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
  it: { marketCode: "IT", currency: "EUR", fallbackLocale: "en", label: "Italy" },
  pt: { marketCode: "PT", currency: "EUR", fallbackLocale: "en", label: "Portugal" },
  nl: { marketCode: "NL", currency: "EUR", fallbackLocale: "en", label: "Netherlands" },
};

export const categoryMeta: Record<
  MarketplaceCategory,
  { label: string; shortLabel: string; icon: string }
> = {
  // Consumer
  banking:    { label: "Banking",              shortLabel: "account",    icon: "🏦" },
  neobanks:   { label: "Neobanks",             shortLabel: "neobank",    icon: "📱" },
  savings:    { label: "Savings Accounts",     shortLabel: "savings",    icon: "🏛️" },
  debit:      { label: "Debit Cards",          shortLabel: "debit",      icon: "💳" },
  cards:      { label: "Credit Cards",         shortLabel: "card",       icon: "🪪" },
  wallets:    { label: "Digital Wallets",      shortLabel: "wallet",     icon: "👜" },
  // Send & exchange
  transfers:  { label: "Money Transfers",      shortLabel: "transfer",   icon: "↔️" },
  remittance: { label: "Remittance",           shortLabel: "remittance", icon: "🌍" },
  exchange:   { label: "Exchange",             shortLabel: "exchange",   icon: "🔄" },
  travel:     { label: "Travel Cards",         shortLabel: "travel",     icon: "✈️" },
  // Borrow
  loans:      { label: "Loans",               shortLabel: "loan",       icon: "🏧" },
  bnpl:       { label: "Buy Now Pay Later",    shortLabel: "BNPL",       icon: "🛒" },
  // Invest
  investments:{ label: "Investments",          shortLabel: "investment", icon: "📈" },
  trading:    { label: "Trading Platforms",    shortLabel: "trading",    icon: "📊" },
  crypto:     { label: "Crypto",               shortLabel: "crypto",     icon: "₿" },
  // Protect
  insurance:  { label: "Insurance",            shortLabel: "insurance",  icon: "🛡️" },
  // Rewards
  cashback:   { label: "Cashback & Rewards",   shortLabel: "cashback",   icon: "💰" },
  // Lifestyle
  budgeting:  { label: "Budgeting & Finance",  shortLabel: "budgeting",  icon: "🗂️" },
  kids:       { label: "Kids & Family",        shortLabel: "kids",       icon: "👶" },
  // Business
  business:   { label: "Business Banking",     shortLabel: "business",   icon: "🏢" },
  payroll:    { label: "Payroll & Invoicing",  shortLabel: "payroll",    icon: "🧾" },
  tax:        { label: "Tax & Accounting",     shortLabel: "tax",        icon: "🧮" },
  expense:    { label: "Expense Tracking",     shortLabel: "expense",    icon: "📋" },
};

const globalProviderNames = new Set([
  "Wise",
  "Revolut",
  "Paysera",
  "Payoneer",
  "Remitly",
  "XE",
  "Skrill",
  "Neteller",
  "CurrencyFair",
  "OFX",
  "N26",
  "SafetyWing",
  "eToro",
  "Coinbase",
  "Bitpanda",
]);

export function normalizeDisplayText(value: string) {
  return value
    .replace(/[–—]/g, "-")
    .replace(/\bEUR\s+/g, "€");
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
  // P2.8 — Replaced the template-string version that returned the same
  // generic sentence for every offer in a category. Where the offer
  // exposes numeric metrics (APR, annual fee, transfer speed, spread)
  // we now compose a sentence that quotes those exact values back to
  // the user. Falls back to the category-default text only when the
  // metrics aren't present, so older offers without rich metric data
  // still produce a readable line.
  const aprRaw = getMetricValue(offer, ["APR"]);
  const aprRange = parseMetricRange(aprRaw);
  const apr = aprRange.min;
  const aprMax = aprRange.max;
  const annualFeeRaw = getMetricValue(offer, ["Annual fee", "Monthly fee"]);
  const annualFee = parseMetricRange(annualFeeRaw).max;
  const speed = getMetricValue(offer, ["Speed"]);
  const spread = getMetricValue(offer, ["Spread", "FX markup", "Conversion fee"]);
  const rate = getMetricValue(offer, ["Rate", "AER", "Yield"]);

  if (offer.category === "loans") {
    if (apr != null && aprMax != null && aprMax > apr) {
      return `APR ${apr}%–${aprMax}% — your final rate depends on credit profile, term, and amount, so the upper band can apply to thinner files.`;
    }
    if (apr != null) {
      return `Headline APR ${apr}% — eligibility, income, and credit checks can move that figure up before signing.`;
    }
    return "Final approval and pricing still depend on local eligibility, income, and credit checks.";
  }

  if (offer.category === "cards") {
    if ((annualFee ?? 0) > 0 && annualFeeRaw) {
      return `${annualFeeRaw} recurring fee — perks only pay off if your spending matches the bonus categories on the card.`;
    }
    return "Travel or reward value only pays off when it matches how you actually spend — no fee, no floor.";
  }

  if (offer.category === "transfers") {
    if (speed && speed.toLowerCase().includes("day")) {
      return `${speed} delivery — same-day routes cost more, this lane trades speed for the lower fee.`;
    }
    if (speed) {
      return `${speed} delivery — final amount still moves with corridor, payout method, and currency timing.`;
    }
    return "Delivered amount still changes with corridor, payout method, and timing.";
  }

  if (offer.category === "exchange") {
    if (spread && !spread.includes("0")) {
      return `${spread} spread — a clean headline rate can still hide markups inside the conversion.`;
    }
    return "The final rate still depends on spread, fee structure, and execution timing.";
  }

  if (offer.category === "savings") {
    if (rate) {
      return `${rate} headline rate — typically variable and tracked to base rate, so the figure can drop without notice.`;
    }
    return "Interest rates are subject to change. Deposit protection limits and eligibility vary by country.";
  }

  if (offer.category === "insurance") {
    return "Premiums, exclusions, and acceptance can change with age, health, vehicle profile, or trip details.";
  }

  if (offer.category === "banking") {
    return "Features and fee waivers depend on your monthly activity and account plan tier.";
  }

  if (offer.category === "crypto") {
    return "Crypto assets carry high volatility risk. Regulatory status varies by country.";
  }

  if (offer.category === "business") {
    return "Business account eligibility and pricing depend on company size, turnover, and country of registration.";
  }

  if (offer.category === "budgeting") {
    return "Savings and cashback outcomes depend on your spending habits and linked accounts.";
  }

  if (offer.category === "kids") {
    return "Parental controls and age restrictions apply. Features vary by country.";
  }

  if (offer.category === "trading") {
    return "Investing involves risk of loss. Past performance does not guarantee future results.";
  }

  if (offer.category === "bnpl") {
    return "Late payments may incur fees or interest. Credit checks and eligibility vary by provider.";
  }

  if (offer.category === "debit") {
    return "ATM and foreign transaction fees may apply depending on your account tier.";
  }

  if (offer.category === "remittance") {
    return "Delivered amount varies by corridor, exchange rate, and payout method at time of transfer.";
  }

  if (offer.category === "travel") {
    return "Card benefits and fee waivers depend on your spending level and destination country.";
  }

  if (offer.category === "cashback") {
    return "Cashback rates and caps depend on your spending category and account tier.";
  }

  if (offer.category === "wallets") {
    return "Fund availability and withdrawal fees depend on your wallet plan and verification level.";
  }

  if (offer.category === "payroll") {
    return "Pricing scales with headcount. Local payroll compliance obligations remain with the employer.";
  }

  if (offer.category === "tax") {
    return "Tax software assists with filing but does not constitute professional tax advice.";
  }

  if (offer.category === "expense") {
    return "Integrations and automation features depend on your subscription tier and accounting software.";
  }

  if (offer.category === "neobanks") {
    return "Neobanks may hold an e-money licence rather than a full banking licence. Check deposit protection.";
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
  const euWideMatch =
    codes.has("EU") ||
    codes.has("ALL_EU") ||
    offer.attributes?.availability === "eu_wide";

  if (market === "eu") {
    return euWideMatch || codes.size >= 4;
  }

  if (market === "international") {
    return (
      euWideMatch ||
      codes.size >= 4 ||
      offer.attributes?.availability === "international" ||
      globalProviderNames.has(offer.providerName)
    );
  }

  return (
    codes.has(directCode) ||
    euWideMatch ||
    offer.attributes?.availability === "international"
  );
}

export function matchesOfferMarketWithScope(
  offer: MarketplaceOffer,
  market: MarketplaceMarket,
  scope: "local_only" | "eu_fallback" | "all_europe" = "eu_fallback",
) {
  return matchesOfferCountrySelection(offer, resolveCountryFromMarket(market), scope);
}

function resolveCountryFromMarket(market: MarketplaceMarket) {
  if (market === "eu" || market === "international") {
    return market;
  }

  return resolveCountryLegacyMarket(market);
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
    return { market: "it" as MarketplaceMarket, locale: "en" as MarketplaceLocale };
  }
  if (value.includes("pt")) {
    return { market: "pt" as MarketplaceMarket, locale: "en" as MarketplaceLocale };
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
  return `${value}`;
}
