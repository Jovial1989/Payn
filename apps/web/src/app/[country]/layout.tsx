import type { MarketplaceMarket } from "@payn/types";
import { MarketplacePreferencesProvider } from "@/components/marketplace-preferences";
import {
  normalizeCountrySelection,
  resolveCountryLegacyMarket,
} from "@/lib/countries";
import { getRequestPreferences } from "@/lib/request-preferences";

export default async function CountryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ country: string }>;
}) {
  const preferences = await getRequestPreferences();
  const { country } = await params;
  const initialCountry = normalizeCountrySelection(country, preferences.locale);
  const market = resolveCountryLegacyMarket(initialCountry) as MarketplaceMarket;

  return (
    <MarketplacePreferencesProvider
      initialLocale={preferences.locale}
      initialCountry={initialCountry}
      initialMarket={market}
    >
      {children}
    </MarketplacePreferencesProvider>
  );
}
