import { FilterPanel } from "@/components/filter-panel";
import { OfferCard } from "@/components/offer-card";
import { SiteShell } from "@/components/site-shell";
import { listCategoryOffers } from "@/server/catalog/catalog-service";

export default async function LoansPage() {
  const offers = await listCategoryOffers("loans");

  return (
    <SiteShell
      eyebrow="Loans marketplace"
      title="Compare personal loan offers with backend-owned ranking."
      description="Loans discovery is structured around transparent ranking, future lead capture, and country-aware routing rather than client-side heuristics."
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <FilterPanel category="loan offers" />
        <section className="grid gap-4">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </section>
      </div>
    </SiteShell>
  );
}

