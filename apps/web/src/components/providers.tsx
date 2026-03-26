"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { ChatWidget } from "@/components/chat-widget";
import { MarketplacePreferencesProvider } from "@/components/marketplace-preferences";
import type { MarketplaceLocale, MarketplaceMarket } from "@payn/types";

export function Providers({
  children,
  initialLocale,
  initialMarket,
}: {
  children: React.ReactNode;
  initialLocale: MarketplaceLocale;
  initialMarket: MarketplaceMarket;
}) {
  return (
    <AuthProvider>
      <MarketplacePreferencesProvider initialLocale={initialLocale} initialMarket={initialMarket}>
        {children}
        <ChatWidget />
      </MarketplacePreferencesProvider>
    </AuthProvider>
  );
}
