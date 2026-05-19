import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { YearBuilderView } from "@/features/year-builder/year-builder-view";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";
import { matchesOfferCountrySelection } from "@/lib/countries";
import { getDictionary } from "@/lib/i18n";
import { getRequestPreferences } from "@/lib/request-preferences";

export const metadata: Metadata = {
  title: "Build your year | Payn",
  description:
    "Tell us four things and we'll show you the 12-month picture of switching to a Payn-recommended kit — what you'd save, what you'd earn, and the three products that get you there.",
};

export default async function YearPage() {
  const prefs = await getRequestPreferences();
  const all = await listMarketplaceOffers();
  const countryMarket = all.filter((candidate) =>
    matchesOfferCountrySelection(candidate, prefs.country),
  );
  const dictionary = getDictionary(prefs.locale);
  const countryLabel =
    dictionary.homeAtlas.countryNames[prefs.country.toUpperCase()] ??
    prefs.country.toUpperCase();

  return (
    <SiteShell hideHero>
      <YearBuilderView
        countryMarket={countryMarket}
        country={prefs.country}
        locale={prefs.locale}
        countryLabel={countryLabel}
      />
    </SiteShell>
  );
}
