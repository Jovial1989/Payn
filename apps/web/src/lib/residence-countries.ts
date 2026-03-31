import type { MarketplaceMarket } from "@payn/types";

export type UserProfileMarketScope = "local_only" | "eu_fallback" | "all_europe";

export interface ResidenceCountryOption {
  value: string;
  label: string;
  flag: string;
  code: string;
  market: MarketplaceMarket;
}

export const residenceCountryOptions: ResidenceCountryOption[] = [
  { value: "de", label: "Germany", flag: "🇩🇪", code: "DE", market: "de" },
  { value: "es", label: "Spain", flag: "🇪🇸", code: "ES", market: "es" },
  { value: "it", label: "Italy", flag: "🇮🇹", code: "IT", market: "it" },
  { value: "fr", label: "France", flag: "🇫🇷", code: "FR", market: "fr" },
  { value: "nl", label: "Netherlands", flag: "🇳🇱", code: "NL", market: "nl" },
  { value: "pl", label: "Poland", flag: "🇵🇱", code: "PL", market: "eu" },
  { value: "pt", label: "Portugal", flag: "🇵🇹", code: "PT", market: "pt" },
  { value: "be", label: "Belgium", flag: "🇧🇪", code: "BE", market: "eu" },
  { value: "at", label: "Austria", flag: "🇦🇹", code: "AT", market: "eu" },
  { value: "se", label: "Sweden", flag: "🇸🇪", code: "SE", market: "eu" },
  { value: "dk", label: "Denmark", flag: "🇩🇰", code: "DK", market: "eu" },
  { value: "fi", label: "Finland", flag: "🇫🇮", code: "FI", market: "eu" },
  { value: "no", label: "Norway", flag: "🇳🇴", code: "NO", market: "eu" },
  { value: "ie", label: "Ireland", flag: "🇮🇪", code: "IE", market: "eu" },
  { value: "cz", label: "Czech Republic", flag: "🇨🇿", code: "CZ", market: "eu" },
  { value: "ro", label: "Romania", flag: "🇷🇴", code: "RO", market: "eu" },
  { value: "hu", label: "Hungary", flag: "🇭🇺", code: "HU", market: "eu" },
  { value: "sk", label: "Slovakia", flag: "🇸🇰", code: "SK", market: "eu" },
  { value: "bg", label: "Bulgaria", flag: "🇧🇬", code: "BG", market: "eu" },
  { value: "hr", label: "Croatia", flag: "🇭🇷", code: "HR", market: "eu" },
  { value: "ee", label: "Estonia", flag: "🇪🇪", code: "EE", market: "eu" },
  { value: "lv", label: "Latvia", flag: "🇱🇻", code: "LV", market: "eu" },
  { value: "lt", label: "Lithuania", flag: "🇱🇹", code: "LT", market: "eu" },
  { value: "other_eu", label: "Other EU country", flag: "🇪🇺", code: "EU", market: "eu" },
];

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
    description: "Prefer local, then fall back to EU offers",
  },
  {
    value: "all_europe",
    label: "All Europe",
    description: "Use the broad European marketplace view",
  },
];

export function getResidenceCountryCode(value: string | null | undefined) {
  return residenceCountryOptions.find((option) => option.value === value)?.code ?? "EU";
}

export function resolveResidenceCountryMarket(value: string | null | undefined): MarketplaceMarket {
  return residenceCountryOptions.find((option) => option.value === value)?.market ?? "eu";
}

export function getResidenceCountryOption(value: string | null | undefined) {
  return residenceCountryOptions.find((option) => option.value === value) ?? null;
}
