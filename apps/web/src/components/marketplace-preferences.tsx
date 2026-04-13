"use client";

import type { MarketplaceLocale, MarketplaceMarket } from "@payn/types";
import { createContext, useContext, useState } from "react";
import {
  type CountryOption,
  getCountryCurrency,
  getCountryOption,
  getCountrySelectorOptions,
  normalizeCountrySelection,
  resolveCountryFromLegacyMarket,
  resolveCountryLegacyMarket,
} from "@/lib/countries";

type MarketplacePreferencesContextValue = {
  country: string;
  locale: MarketplaceLocale;
  market: MarketplaceMarket;
  currency: string;
  language: MarketplaceLocale;
  countryLabel: string;
  availableCountries: CountryOption[];
  setCountry: (country: string) => void;
  setLanguage: (language: MarketplaceLocale) => void;
  setLocale: (locale: MarketplaceLocale) => void;
  setMarket: (market: MarketplaceMarket) => void;
};

const MarketplacePreferencesContext = createContext<MarketplacePreferencesContextValue | null>(null);

function persistPreference(key: string, value: string) {
  document.cookie = `${key}=${value}; path=/; max-age=31536000; samesite=lax`;
}

export function MarketplacePreferencesProvider({
  children,
  initialLocale,
  initialCountry,
  initialMarket,
}: {
  children: React.ReactNode;
  initialLocale: MarketplaceLocale;
  initialCountry?: string;
  initialMarket?: MarketplaceMarket;
}) {
  const normalizedInitialCountry = normalizeCountrySelection(
    initialCountry ?? resolveCountryFromLegacyMarket(initialMarket, initialLocale),
    initialLocale,
  );
  const [locale, setLocaleState] = useState(initialLocale);
  const [country, setCountryState] = useState(normalizedInitialCountry);
  const market = resolveCountryLegacyMarket(country);
  const currency = getCountryCurrency(country);
  const countryLabel = getCountryOption(country, locale)?.label ?? country.toUpperCase();
  const availableCountries = getCountrySelectorOptions({ locale });

  const value = {
    country,
    locale,
    market,
    currency,
    language: locale,
    countryLabel,
    availableCountries,
    setCountry: (nextCountry: string) => {
      const normalizedCountry = normalizeCountrySelection(nextCountry, locale);
      setCountryState(normalizedCountry);
      persistPreference("payn-country", normalizedCountry);
      persistPreference("payn-market", resolveCountryLegacyMarket(normalizedCountry));
    },
    setLanguage: (nextLocale: MarketplaceLocale) => {
      setLocaleState(nextLocale);
      persistPreference("payn-locale", nextLocale);
    },
    setLocale: (nextLocale: MarketplaceLocale) => {
      setLocaleState(nextLocale);
      persistPreference("payn-locale", nextLocale);
    },
    setMarket: (nextMarket: MarketplaceMarket) => {
      const normalizedCountry = normalizeCountrySelection(
        resolveCountryFromLegacyMarket(nextMarket, locale),
        locale,
      );
      setCountryState(normalizedCountry);
      persistPreference("payn-country", normalizedCountry);
      persistPreference("payn-market", resolveCountryLegacyMarket(normalizedCountry));
    },
  };

  return (
    <MarketplacePreferencesContext.Provider value={value}>
      {children}
    </MarketplacePreferencesContext.Provider>
  );
}

export function useMarketplacePreferences() {
  const context = useContext(MarketplacePreferencesContext);

  if (!context) {
    throw new Error("useMarketplacePreferences must be used within MarketplacePreferencesProvider");
  }

  return context;
}
