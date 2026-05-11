import type { MarketplaceCategory, MarketplaceLocale, MarketplaceMarket } from "@payn/types";

export const platformConfig = {
  productName: "Payn",
  categories: ["loans", "cards", "transfers", "exchange", "insurance", "investments"] as const,
};

export interface CanonicalLanguageOption {
  code: MarketplaceLocale;
  native: string;
}

export interface CanonicalCountryOption {
  value: MarketplaceMarket;
  label: string;
  flag: string;
  code: string;
  currency: string;
  kind: "group" | "country";
}

export const canonicalLanguages: CanonicalLanguageOption[] = [
  { code: "en", native: "English" },
  { code: "de", native: "Deutsch" },
  { code: "es", native: "Espanol" },
  { code: "fr", native: "Francais" },
];

export const canonicalCategories: MarketplaceCategory[] = [
  "loans",
  "cards",
  "transfers",
  "exchange",
  "insurance",
  "investments",
];

export const canonicalCountryOptions: CanonicalCountryOption[] = [
  {
    value: "eu",
    label: "All Europe",
    flag: "EU",
    code: "EU",
    currency: "EUR",
    kind: "group",
  },
  {
    value: "international",
    label: "International",
    flag: "INTL",
    code: "INTL",
    currency: "Multi-currency",
    kind: "group",
  },
  { value: "de", label: "Germany", flag: "DE", code: "DE", currency: "EUR", kind: "country" },
  { value: "es", label: "Spain", flag: "ES", code: "ES", currency: "EUR", kind: "country" },
  { value: "it", label: "Italy", flag: "IT", code: "IT", currency: "EUR", kind: "country" },
  { value: "fr", label: "France", flag: "FR", code: "FR", currency: "EUR", kind: "country" },
  { value: "uk", label: "United Kingdom", flag: "UK", code: "UK", currency: "GBP", kind: "country" },
  { value: "nl", label: "Netherlands", flag: "NL", code: "NL", currency: "EUR", kind: "country" },
  { value: "pt", label: "Portugal", flag: "PT", code: "PT", currency: "EUR", kind: "country" },
];

export const canonicalCountryLabels: Record<MarketplaceLocale, Partial<Record<MarketplaceMarket, string>>> = {
  en: {},
  de: {
    eu: "Ganz Europa",
    international: "International",
    de: "Deutschland",
    es: "Spanien",
    it: "Italien",
    fr: "Frankreich",
    uk: "Vereinigtes Konigreich",
    nl: "Niederlande",
    pt: "Portugal",
  },
  es: {
    eu: "Toda Europa",
    international: "Internacional",
    de: "Alemania",
    es: "Espana",
    it: "Italia",
    fr: "Francia",
    uk: "Reino Unido",
    nl: "Paises Bajos",
    pt: "Portugal",
  },
  fr: {
    eu: "Toute l'Europe",
    international: "International",
    de: "Allemagne",
    es: "Espagne",
    it: "Italie",
    fr: "France",
    uk: "Royaume-Uni",
    nl: "Pays-Bas",
    pt: "Portugal",
  },
  it: {},
  pt: {},
};
