import { CategoryPageContent } from "@/components/category-page-content";
import { SiteShell } from "@/components/site-shell";
import { listCategoryOffers } from "@/server/catalog/catalog-service";

export default async function ExchangePage() {
  const offers = await listCategoryOffers("exchange");

  return (
    <SiteShell
      activeHref="/exchange"
      eyebrow="Currency Exchange Marketplace"
      title="FX providers with visible spreads, supported pairs, and transparent pricing."
      description="Exchange services compared on spread, supported currencies, and pricing transparency."
      heroTags={["Spread visibility", "Multi-currency", "Real-time comparison"]}
    >
      <CategoryPageContent category="exchange" offers={offers} label="exchange providers" />
    </SiteShell>
  );
}
