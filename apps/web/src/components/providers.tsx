"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { ChatWidget } from "@/components/chat-widget";
import { LocaleGate } from "@/components/locale-gate";
import { MarketplacePreferencesProvider } from "@/components/marketplace-preferences";
import type { MarketplaceLocale, MarketplaceMarket } from "@payn/types";

export function Providers({
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
  return (
    <AuthProvider>
      <MarketplacePreferencesProvider
        initialLocale={initialLocale}
        initialCountry={initialCountry}
        initialMarket={initialMarket}
      >
        {children}
        <ChatWidget />
        <LocaleGate />
      </MarketplacePreferencesProvider>
    </AuthProvider>
  );
}
