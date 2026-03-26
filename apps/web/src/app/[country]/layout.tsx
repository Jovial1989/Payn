import type { MarketplaceMarket } from "@payn/types";
import { MarketplacePreferencesProvider } from "@/components/marketplace-preferences";
import { getRequestPreferences } from "@/lib/request-preferences";
import { isSupportedMarket } from "@/lib/marketplace";

export default async function CountryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ country: string }>;
}) {
  const preferences = await getRequestPreferences();
  const { country } = await params;
  const market = isSupportedMarket(country) ? (country as MarketplaceMarket) : preferences.market;

  return (
    <MarketplacePreferencesProvider
      initialLocale={preferences.locale}
      initialMarket={market}
    >
      {children}
    </MarketplacePreferencesProvider>
  );
}
