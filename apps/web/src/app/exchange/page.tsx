import { FilterPanel } from "@/components/filter-panel";
import { OfferCard } from "@/components/offer-card";
import { SiteShell } from "@/components/site-shell";
import { Tag } from "@/components/tag";
import { listCategoryOffers } from "@/server/catalog/catalog-service";

export default async function ExchangePage() {
  const offers = await listCategoryOffers("exchange");
  const markets = new Set(offers.flatMap((offer) => offer.countryCodes));

  return (
    <SiteShell
      activeHref="/exchange"
      eyebrow="Currency Exchange Marketplace"
      title="FX providers with visible spreads, supported pairs, and transparent pricing."
      description={`${offers.length} exchange services compared on spread, minimum amounts, and currency pair coverage across ${markets.size} markets.`}
      heroTags={["Spread visibility", "Multi-currency", "Real-time comparison"]}
    >
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <FilterPanel category="exchange" />
        <section className="grid gap-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-bg-elevated p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Ranked exchange providers</p>
              <p className="mt-0.5 text-xs text-ink-secondary">Compare spreads and supported currencies before exchanging.</p>
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
