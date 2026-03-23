import { FilterPanel } from "@/components/filter-panel";
import { OfferCard } from "@/components/offer-card";
import { SiteShell } from "@/components/site-shell";
import { listCategoryOffers } from "@/server/catalog/catalog-service";

export default async function CardsPage() {
  const offers = await listCategoryOffers("cards");

  return (
    <SiteShell
      eyebrow="Credit cards marketplace"
      title="Discover credit cards with fee visibility and partner transparency."
      description="This route is ready for future comparison methodology, reward-focused ranking signals, and trusted editorial content blocks."
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <FilterPanel category="card offers" />
        <section className="grid gap-4">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </section>
      </div>
    </SiteShell>
  );
}

