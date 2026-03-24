import { FilterPanel } from "@/components/filter-panel";
import { OfferCard } from "@/components/offer-card";
import { SiteShell } from "@/components/site-shell";
import { Tag } from "@/components/tag";
import { listCategoryOffers } from "@/server/catalog/catalog-service";

export default async function TransfersPage() {
  const offers = await listCategoryOffers("transfers");
  const markets = new Set(offers.flatMap((offer) => offer.countryCodes));

  return (
    <SiteShell
      activeHref="/transfers"
      eyebrow="Money Transfers Marketplace"
      title="Compare international transfer providers on fees, speed, and corridors."
      description={`${offers.length} transfer services ranked by cost, delivery speed, and corridor coverage across ${markets.size} markets.`}
      heroTags={["Fee transparency", "Corridor-aware", "Speed comparison"]}
    >
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <FilterPanel category="transfers" />
        <section className="grid gap-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-bg-elevated p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Ranked transfer providers</p>
              <p className="mt-0.5 text-xs text-ink-secondary">Compare fees, speed, and coverage before sending money.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tag tone="success">{offers.length} providers</Tag>
              <Tag tone="muted">{markets.size} markets</Tag>
            </div>
          </div>
          {offers.map((offer, index) => (
            <OfferCard key={offer.id} offer={offer} rank={index + 1} />
          ))}
        </section>
      </div>
    </SiteShell>
  );
}
