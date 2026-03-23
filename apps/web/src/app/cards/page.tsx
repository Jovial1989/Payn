import { FilterPanel } from "@/components/filter-panel";
import { OfferCard } from "@/components/offer-card";
import { SiteShell } from "@/components/site-shell";
import { listCategoryOffers } from "@/server/catalog/catalog-service";

export default async function CardsPage() {
  const offers = await listCategoryOffers("cards");

  return (
    <SiteShell
      activeHref="/cards"
      eyebrow="Credit cards marketplace"
      title="Compare cards with fee visibility and clearer provider details"
      description="The same marketplace system can be extended to cards with pricing, rewards, and key product terms surfaced more clearly."
      heroTags={["Fee visibility", "Transparent ranking", "Updated regularly"]}
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <FilterPanel category="cards" />
        <section className="grid gap-4">
          {offers.map((offer, index) => (
            <OfferCard key={offer.id} offer={offer} rank={index + 1} />
          ))}
        </section>
      </div>
    </SiteShell>
  );
}
