import type {
  MarketplaceCategory,
  MarketplaceLocale,
  MarketplaceMarket,
  MarketplaceOffer,
} from "@payn/types";
import { canonicalCountryLabels, canonicalCountryOptions } from "@payn/config";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { fallbackMarketplaceOffers } from "@/features/catalog/marketplace-fallback-offers";

export type UserProfileMarketScope = "local_only" | "eu_fallback" | "all_europe";

export type CountryOptionKind = "group" | "country";

export interface CountryOption {
  value: string;
  label: string;
  flag: string;
  code: string;
  legacyMarket: MarketplaceMarket;
  currency: string;
  kind: CountryOptionKind;
}

const localizedCountryLabels = canonicalCountryLabels;

const configuredCountryOptions: CountryOption[] = canonicalCountryOptions.map((option) => ({
  ...option,
  legacyMarket: option.value,
}));

const countryOptionMap = new Map(configuredCountryOptions.map((option) => [option.value, option]));

const localeCountryDefaults: Record<MarketplaceLocale, string> = {
  en: "uk",
  de: "de",
  es: "es",
  fr: "fr",
  it: "it",
  pt: "pt",
};

const minimumOfferCounts: Record<MarketplaceCategory, number> = {
  loans: 3,
  cards: 3,
  transfers: 3,
  exchange: 3,
  insurance: 1,
  investments: 1,
};

const providerNamesWithBroadCoverage = new Set([
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
  "eToro",
  "Coinbase",
  "Bitpanda",
  "SafetyWing",
]);

export const marketScopeOptions: Array<{
  value: UserProfileMarketScope;
  label: string;
  description: string;
}> = [
  {
    value: "local_only",
    label: "Local only",
    description: "Only country-specific routes",
  },
  {
    value: "eu_fallback",
    label: "Local + EU fallback",
    description: "Prefer local, then fall back to broader European offers",
  },
  {
    value: "all_europe",
    label: "All Europe",
    description: "Use the broadest European comparison view",
  },
];

const localizedMarketScopeOptions: Record<
  MarketplaceLocale,
  Partial<Record<UserProfileMarketScope, { label: string; description: string }>>
> = {
  en: {},
  de: {
    local_only: {
      label: "Nur lokal",
      description: "Nur länderspezifische Wege",
    },
    eu_fallback: {
      label: "Lokal + EU-Fallback",
      description: "Bevorzuge lokale Angebote, danach breitere EU-Optionen",
    },
    all_europe: {
      label: "Ganz Europa",
      description: "Nutze die breiteste europäische Vergleichsansicht",
    },
  },
  es: {},
  fr: {},
  it: {},
  pt: {},
};

function localizeCountryOption(option: CountryOption, locale: MarketplaceLocale): CountryOption {
  return {
    ...option,
    label: localizedCountryLabels[locale][option.value] ?? option.label,
    currency:
      locale === "de" && option.currency === "Multi-currency"
        ? "Mehrere Währungen"
        : option.currency,
  };
}

function getOfferCountryCodes(offer: MarketplaceOffer) {
  return new Set(offer.countryCodes.map((code) => code.toUpperCase()));
}

function isEuWideOffer(offer: MarketplaceOffer) {
  const codes = getOfferCountryCodes(offer);
  return (
    codes.has("EU") ||
    codes.has("ALL_EU") ||
    offer.attributes?.availability === "eu_wide"
  );
}

function isInternationalOffer(offer: MarketplaceOffer) {
  return (
    offer.attributes?.availability === "international" ||
    isEuWideOffer(offer) ||
    providerNamesWithBroadCoverage.has(offer.providerName)
  );
}

export function getDefaultCountryForLocale(locale: MarketplaceLocale) {
  return localeCountryDefaults[locale] ?? "uk";
}

export function getCountryOption(
  value: string | null | undefined,
  locale: MarketplaceLocale = "en",
) {
  const option = countryOptionMap.get(value?.toLowerCase() ?? "");
  return option ? localizeCountryOption(option, locale) : null;
}

export function getCountryCode(value: string | null | undefined) {
  return getCountryOption(value)?.code ?? "EU";
}

export function getCountryCurrency(value: string | null | undefined) {
  return getCountryOption(value)?.currency ?? "EUR";
}

export function getCountryLabel(
  value: string | null | undefined,
  locale: MarketplaceLocale = "en",
) {
  return getCountryOption(value, locale)?.label ?? (locale === "de" ? "Ganz Europa" : "All Europe");
}

export function resolveCountryLegacyMarket(
  value: string | null | undefined,
): MarketplaceMarket {
  return getCountryOption(value)?.legacyMarket ?? "eu";
}

export function resolveCountryFromLegacyMarket(
  value: string | null | undefined,
  locale: MarketplaceLocale = "en",
) {
  return normalizeConfiguredCountrySelection(value, locale);
}

function normalizeConfiguredCountrySelection(
  value: string | null | undefined,
  locale: MarketplaceLocale = "en",
) {
  const normalizedValue = value?.toLowerCase() ?? "";

  if (countryOptionMap.has(normalizedValue)) {
    return normalizedValue;
  }

  return getDefaultCountryForLocale(locale);
}

export function getCountrySelectorOptions({
  includeGroups = true,
  locale = "en",
}: {
  includeGroups?: boolean;
  locale?: MarketplaceLocale;
} = {}) {
  return supportedCountryOptions
    .filter((option) => (includeGroups ? true : option.kind === "country"))
    .map((option) => localizeCountryOption(option, locale));
}

export function getLocalizedMarketScopeOptions(locale: MarketplaceLocale = "en") {
  return marketScopeOptions.map((option) => ({
    ...option,
    label: localizedMarketScopeOptions[locale][option.value]?.label ?? option.label,
    description:
      localizedMarketScopeOptions[locale][option.value]?.description ?? option.description,
  }));
}

export function matchesOfferCountrySelection(
  offer: MarketplaceOffer,
  countrySelection: string,
  scope: UserProfileMarketScope = "eu_fallback",
) {
  const normalizedCountry = normalizeConfiguredCountrySelection(countrySelection);
  const option = getCountryOption(normalizedCountry);

  if (!option) {
    return false;
  }

  const codes = getOfferCountryCodes(offer);
  const directMatch = codes.has(option.code);
  const euWideMatch = isEuWideOffer(offer);
  const internationalMatch = offer.attributes?.availability === "international";

  if (normalizedCountry === "international") {
    return isInternationalOffer(offer);
  }

  if (normalizedCountry === "eu") {
    return euWideMatch || internationalMatch || codes.size >= 4;
  }

  if (scope === "local_only") {
    return directMatch;
  }

  return directMatch || euWideMatch || internationalMatch;
}

function getCategoryBaseOffers(
  countrySelection: string,
  category: MarketplaceCategory,
  scope: UserProfileMarketScope,
) {
  return marketplaceOffers.filter(
    (offer) =>
      offer.category === category &&
      matchesOfferCountrySelection(offer, countrySelection, scope),
  );
}

function getCategoryFallbackOffers(
  countrySelection: string,
  category: MarketplaceCategory,
  scope: UserProfileMarketScope,
) {
  const baseOffers = getCategoryBaseOffers(countrySelection, category, scope);
  const minimumCount = minimumOfferCounts[category];

  if (baseOffers.length >= minimumCount) {
    return [] as MarketplaceOffer[];
  }

  const seenProviders = new Set(baseOffers.map((offer) => offer.providerName));

  return fallbackMarketplaceOffers
    .filter(
      (offer) =>
        offer.category === category &&
        matchesOfferCountrySelection(offer, countrySelection, scope) &&
        !seenProviders.has(offer.providerName),
    )
    .slice(0, minimumCount - baseOffers.length);
}

function dedupeOffers(offers: MarketplaceOffer[]) {
  const seen = new Set<string>();
  return offers.filter((offer) => {
    if (seen.has(offer.id)) {
      return false;
    }
    seen.add(offer.id);
    return true;
  });
}

export function getOffersForCountrySelection(
  countrySelection: string,
  scope: UserProfileMarketScope = "eu_fallback",
) {
  const baseOffers = marketplaceOffers.filter((offer) =>
    matchesOfferCountrySelection(offer, countrySelection, scope),
  );
  const fallbackTopUps = (
    ["loans", "cards", "transfers", "exchange", "insurance", "investments"] as MarketplaceCategory[]
  ).flatMap((category) =>
    getCategoryFallbackOffers(countrySelection, category, scope),
  );

  return dedupeOffers([...baseOffers, ...fallbackTopUps]);
}

export function getCategoryOffersForCountrySelection(
  countrySelection: string,
  category: MarketplaceCategory,
  scope: UserProfileMarketScope = "eu_fallback",
) {
  return getOffersForCountrySelection(countrySelection, scope).filter(
    (offer) => offer.category === category,
  );
}

function getCoverageSnapshot(countrySelection: string) {
  const offers = getOffersForCountrySelection(countrySelection);

  return (
    ["loans", "cards", "transfers", "exchange", "insurance", "investments"] as MarketplaceCategory[]
  ).reduce(
    (acc, category) => {
      acc[category] = offers.filter((offer) => offer.category === category).length;
      return acc;
    },
    {} as Record<MarketplaceCategory, number>,
  );
}

function shouldExposeCountry(option: CountryOption) {
  if (option.kind === "group") {
    return true;
  }

  const coverage = getCoverageSnapshot(option.value);

  return (
    coverage.loans >= minimumOfferCounts.loans &&
    coverage.cards >= minimumOfferCounts.cards &&
    coverage.transfers >= minimumOfferCounts.transfers &&
    coverage.exchange >= minimumOfferCounts.exchange &&
    coverage.insurance >= minimumOfferCounts.insurance &&
    coverage.investments >= minimumOfferCounts.investments
  );
}

export const supportedCountryOptions = configuredCountryOptions.filter((option) =>
  shouldExposeCountry(option),
);

export const individualCountryOptions = supportedCountryOptions.filter(
  (option) => option.kind === "country",
);

const supportedCountryValueSet = new Set(
  supportedCountryOptions.map((option) => option.value),
);

export function normalizeCountrySelection(
  value: string | null | undefined,
  locale: MarketplaceLocale = "en",
) {
  const normalizedValue = normalizeConfiguredCountrySelection(value, locale);

  if (supportedCountryValueSet.has(normalizedValue)) {
    return normalizedValue;
  }

  const fallbackCountry = getDefaultCountryForLocale(locale);

  if (supportedCountryValueSet.has(fallbackCountry)) {
    return fallbackCountry;
  }

  return supportedCountryOptions[0]?.value ?? "eu";
}

export function isSupportedCountrySelection(value: string | null | undefined) {
  return supportedCountryValueSet.has(value?.toLowerCase() ?? "");
}
