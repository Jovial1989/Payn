import { SiteShell } from "@/components/site-shell";
import { HomePage } from "@/features/home/home-page";
import { getActiveHighlights } from "@/features/highlights/get-active-highlights";
import { pickTopOffers } from "@/features/home/pick-top-offers";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";
import { matchesOfferCountrySelection } from "@/lib/countries";
import { getRequestPreferences } from "@/lib/request-preferences";

export default async function Page() {
  const prefs = await getRequestPreferences();
  const [highlights, allOffers] = await Promise.all([
    getActiveHighlights(prefs.country),
    listMarketplaceOffers(),
  ]);
  const countryMarket = allOffers.filter((candidate) =>
    matchesOfferCountrySelection(candidate, prefs.country),
  );
  const topPicks = pickTopOffers(countryMarket, 3);

  return (
    <SiteShell hideHero>
      <HomePage
        highlights={highlights}
        topPicks={topPicks}
        countryMarket={countryMarket}
      />
    </SiteShell>
  );
}
