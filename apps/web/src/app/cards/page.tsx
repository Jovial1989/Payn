import { FilterPanel } from "@/components/filter-panel";
import { OfferCard } from "@/components/offer-card";
import { SiteShell } from "@/components/site-shell";
import { Tag } from "@/components/tag";
import { listCategoryOffers } from "@/server/catalog/catalog-service";

export default async function CardsPage() {
  const offers = await listCategoryOffers("cards");

  return (
    <SiteShell
      activeHref="/cards"
      eyebrow="Credit Cards Marketplace"
      title="Compare cards with fee visibility and clearer provider details."
      description="Pricing, rewards, and key product terms surfaced clearly. Same transparent ranking system across all categories."
      heroTags={["Fee visibility", "Transparent ranking", "Updated regularly"]}
    >
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <FilterPanel category="cards" />
        <section className="grid gap-4">
          <div className="flex items-center justify-between rounded-2xl border border-line bg-bg-elevated p-5">
            <p className="text-sm font-semibold text-ink">Ranked card offers</p>
            <Tag tone="success">{offers.length} offers</Tag>
          </div>
          {offers.map((offer, index) => (
            <OfferCard key={offer.id} offer={offer} rank={index + 1} />
          ))}
        </section>
      </div>
    </SiteShell>
  );
}
