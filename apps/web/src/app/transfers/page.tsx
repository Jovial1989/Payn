import { CategoryPageContent } from "@/components/category-page-content";
import { SiteShell } from "@/components/site-shell";
import { listCategoryOffers } from "@/server/catalog/catalog-service";

export default async function TransfersPage() {
  const offers = await listCategoryOffers("transfers");

  return (
    <SiteShell
      activeHref="/transfers"
      eyebrow="Money Transfers Marketplace"
      title="Compare international transfer providers on fees, speed, and corridors."
      description={`${offers.length} transfer services ranked by cost, delivery speed, and corridor coverage.`}
      heroTags={["Fee transparency", "Corridor-aware", "Speed comparison"]}
    >
      <CategoryPageContent category="transfers" offers={offers} label="transfer providers" />
    </SiteShell>
  );
}
