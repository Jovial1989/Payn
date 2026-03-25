import { CategoryPageContent } from "@/components/category-page-content";
import { SiteShell } from "@/components/site-shell";
import { listCategoryOffers } from "@/server/catalog/catalog-service";

export default async function CardsPage() {
  const offers = await listCategoryOffers("cards");

  return (
    <SiteShell
      activeHref="/cards"
      eyebrow="Credit Cards Marketplace"
      title="Compare cards with fee visibility and clearer provider details."
      description={`${offers.length} card offers with transparent pricing, rewards, and fee structures ranked independently.`}
      heroTags={["Fee visibility", "Transparent ranking", "Updated regularly"]}
    >
      <CategoryPageContent category="cards" offers={offers} label="card offers" />
    </SiteShell>
  );
}
