import { SiteShell } from "@/components/site-shell";
import { HomePage } from "@/features/home/home-page";
import { getRequestPreferences } from "@/lib/request-preferences";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";

export default async function Page() {
  const preferences = await getRequestPreferences();
  const offers = await listMarketplaceOffers();

  return (
    <SiteShell
      activePage="marketplace"
      hideHero
    >
      <HomePage offers={offers} locale={preferences.locale} market={preferences.market} />
    </SiteShell>
  );
}
