import { FilterPanel } from "@/components/filter-panel";
import { OfferCard } from "@/components/offer-card";
import { SectionContainer } from "@/components/section-container";
import { SiteShell } from "@/components/site-shell";
import { Tag } from "@/components/tag";
import { listCategoryOffers } from "@/server/catalog/catalog-service";

export default async function LoansPage() {
  const offers = await listCategoryOffers("loans");
  const markets = new Set(offers.flatMap((offer) => offer.countryCodes));
  const latestTimestamp = Math.max(...offers.map((offer) => new Date(offer.updatedAt).getTime()));
  const lastUpdated = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(latestTimestamp));

  return (
    <SiteShell
      activeHref="/loans"
      eyebrow="Loans marketplace"
      title="Find the right loan with transparent, data-driven comparison"
      description="Offers are ranked using borrowing cost, product fit, provider quality, and disclosure standards so you can compare lending options with more context."
      heroTags={["Updated regularly", "Independent comparison", "Ranking methodology disclosed"]}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <SectionContainer>
          <p className="text-sm font-semibold text-ink">How we rank offers</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Ranking balances estimated borrowing cost, product fit, application quality, and provider reliability.
          </p>
        </SectionContainer>
        <SectionContainer>
          <p className="text-sm font-semibold text-ink">We may earn commission</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Some providers pay us when you apply, but compensation does not independently determine the order.
          </p>
        </SectionContainer>
        <SectionContainer>
          <p className="text-sm font-semibold text-ink">Updated recently</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Loan ranges, rates, and provider details were last reviewed on {lastUpdated}.
          </p>
        </SectionContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <FilterPanel category="loans" />
        <section className="grid gap-4">
          <SectionContainer className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Ranked loan offers</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Compare products using transparent inputs before you visit a provider site.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tag tone="accent">{offers.length} offers</Tag>
              <Tag tone="muted">{markets.size} markets</Tag>
              <Tag tone="muted">Updated {lastUpdated}</Tag>
            </div>
          </SectionContainer>

          {offers.map((offer, index) => (
            <OfferCard key={offer.id} offer={offer} rank={index + 1} />
          ))}
        </section>
      </div>
    </SiteShell>
  );
}
