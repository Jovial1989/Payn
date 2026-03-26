import { SiteShell } from "@/components/site-shell";
import { ExplorePageContent } from "@/features/explore/explore-page";
import { getRequestPreferences } from "@/lib/request-preferences";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";

export default async function ExplorePage() {
  const preferences = await getRequestPreferences();
  const offers = await listMarketplaceOffers();

  return (
    <SiteShell activePage="marketplace" hideHero>
      <ExplorePageContent offers={offers} locale={preferences.locale} market={preferences.market} />
    </SiteShell>
  );
}
