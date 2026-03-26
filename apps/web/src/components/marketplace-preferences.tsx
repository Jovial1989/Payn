"use client";

import type { MarketplaceLocale, MarketplaceMarket } from "@payn/types";
import { createContext, useContext, useState } from "react";

type MarketplacePreferencesContextValue = {
  locale: MarketplaceLocale;
  market: MarketplaceMarket;
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
  initialMarket,
}: {
  children: React.ReactNode;
  initialLocale: MarketplaceLocale;
  initialMarket: MarketplaceMarket;
}) {
  const [locale, setLocaleState] = useState(initialLocale);
  const [market, setMarketState] = useState(initialMarket);

  const value = {
    locale,
    market,
    setLocale: (nextLocale: MarketplaceLocale) => {
      setLocaleState(nextLocale);
      persistPreference("payn-locale", nextLocale);
    },
    setMarket: (nextMarket: MarketplaceMarket) => {
      setMarketState(nextMarket);
      persistPreference("payn-market", nextMarket);
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
