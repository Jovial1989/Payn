"use client";

import type { MarketplaceLocale, MarketplaceMarket } from "@payn/types";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  type CountryOption,
  getCountryCurrency,
  getCountryOption,
  getCountrySelectorOptions,
  normalizeCountrySelection,
  resolveCountryFromLegacyMarket,
  resolveCountryLegacyMarket,
} from "@/lib/countries";
import { useAuth } from "@/hooks/use-auth";

type MarketplacePreferencesContextValue = {
  country: string;
  locale: MarketplaceLocale;
  market: MarketplaceMarket;
  currency: string;
  language: MarketplaceLocale;
  countryLabel: string;
  audience: "personal" | "business";
  availableCountries: CountryOption[];
  setCountry: (country: string) => void;
  setLanguage: (language: MarketplaceLocale) => void;
  setLocale: (locale: MarketplaceLocale) => void;
  setMarket: (market: MarketplaceMarket) => void;
  setAudience: (audience: "personal" | "business") => void;
};

const MarketplacePreferencesContext = createContext<MarketplacePreferencesContextValue | null>(null);
const guestPreferencesStorageKey = "payn:preferences";

function persistPreference(key: string, value: string) {
  document.cookie = `${key}=${value}; path=/; max-age=31536000; samesite=lax`;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredGuestPreferences() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(guestPreferencesStorageKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      locale?: MarketplaceLocale;
      country?: string;
      audience?: "personal" | "business";
    };
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredGuestPreferences(preferences: {
  locale: MarketplaceLocale;
  country: string;
  audience: "personal" | "business";
}) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(guestPreferencesStorageKey, JSON.stringify(preferences));
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
  const { user, profile, updateProfile } = useAuth();
  const normalizedInitialCountry = normalizeCountrySelection(
    initialCountry ?? resolveCountryFromLegacyMarket(initialMarket, initialLocale),
    initialLocale,
  );
  const [locale, setLocaleState] = useState(initialLocale);
  const [country, setCountryState] = useState(normalizedInitialCountry);
  const [audience, setAudienceState] = useState<"personal" | "business">("personal");
  const hydratedRef = useRef(false);
  const market = resolveCountryLegacyMarket(country);
  const currency = getCountryCurrency(country);
  const countryLabel = getCountryOption(country, locale)?.label ?? country.toUpperCase();
  const availableCountries = getCountrySelectorOptions({ locale });

  useEffect(() => {
    if (hydratedRef.current) {
      return;
    }

    hydratedRef.current = true;
    const stored = readStoredGuestPreferences();
    if (!stored) {
      writeStoredGuestPreferences({ locale: initialLocale, country: normalizedInitialCountry, audience: "personal" });
      return;
    }

    if (!initialCountry && stored.country) {
      setCountryState(normalizeCountrySelection(stored.country, initialLocale));
    }
    if (stored.audience === "personal" || stored.audience === "business") {
      setAudienceState(stored.audience);
    }
  }, [initialCountry, initialLocale, normalizedInitialCountry]);

  useEffect(() => {
    persistPreference("payn-locale", locale);
    persistPreference("payn-country", country);
    persistPreference("payn-market", market);
    persistPreference("payn-audience", audience);
    writeStoredGuestPreferences({ locale, country, audience });
    document.documentElement.lang = locale;
  }, [country, locale, market, audience]);

  useEffect(() => {
    if (!user || !profile) {
      return;
    }

    const nextLocale = profile.preferred_locale ?? locale;
    const nextCountry = profile.home_country
      ? normalizeCountrySelection(profile.home_country, nextLocale)
      : country;

    if (nextLocale !== locale) {
      setLocaleState(nextLocale);
    }

    if (profile.home_country && nextCountry !== country && !initialCountry) {
      setCountryState(nextCountry);
    }
  }, [country, initialCountry, locale, profile, user]);

  const syncProfile = useMemo(
    () => async (next: { locale?: MarketplaceLocale; home_country?: string | null }) => {
      if (!user) {
        return;
      }

      await updateProfile({
        preferred_locale: next.locale,
        home_country: next.home_country,
      });
    },
    [updateProfile, user],
  );

  const value = {
    country,
    locale,
    market,
    currency,
    language: locale,
    countryLabel,
    audience,
    availableCountries,
    setCountry: (nextCountry: string) => {
      const normalizedCountry = normalizeCountrySelection(nextCountry, locale);
      setCountryState(normalizedCountry);
      void syncProfile({ home_country: normalizedCountry });
    },
    setLanguage: (nextLocale: MarketplaceLocale) => {
      setLocaleState(nextLocale);
      void syncProfile({ locale: nextLocale });
    },
    setLocale: (nextLocale: MarketplaceLocale) => {
      setLocaleState(nextLocale);
      void syncProfile({ locale: nextLocale });
    },
    setMarket: (nextMarket: MarketplaceMarket) => {
      const normalizedCountry = normalizeCountrySelection(
        resolveCountryFromLegacyMarket(nextMarket, locale),
        locale,
      );
      setCountryState(normalizedCountry);
      void syncProfile({ home_country: normalizedCountry });
    },
    setAudience: (nextAudience: "personal" | "business") => {
      setAudienceState(nextAudience);
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
