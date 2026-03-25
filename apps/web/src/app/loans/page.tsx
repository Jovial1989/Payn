import { CategoryPageContent } from "@/components/category-page-content";
import { SiteShell } from "@/components/site-shell";
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
      eyebrow="Loans Marketplace"
      title="Find the right loan with transparent, data-driven comparison."
      description={`${offers.length} loan offers ranked by borrowing cost, product fit, and provider quality across ${markets.size} markets.`}
      heroTags={["Updated regularly", "Independent comparison", "Methodology disclosed"]}
    >
      {/* Trust strip */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex items-start gap-3 rounded-xl border border-line bg-bg-elevated p-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
              <path d="M8 3v10M5 6l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">How we rank</p>
            <p className="mt-1 text-xs leading-5 text-ink-secondary">
              Borrowing cost, product fit, application quality, and provider reliability.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-line bg-bg-elevated p-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
              <circle cx="8" cy="8" r="5" />
              <path d="M8 6v4M10 8H6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Commission disclosed</p>
            <p className="mt-1 text-xs leading-5 text-ink-secondary">
              Some providers pay us, but compensation alone does not determine order.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-line bg-bg-elevated p-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
              <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Updated recently</p>
            <p className="mt-1 text-xs leading-5 text-ink-secondary">
              Rates and provider details last reviewed {lastUpdated}.
            </p>
          </div>
        </div>
      </div>

      <CategoryPageContent category="loans" offers={offers} label="loan offers" />
    </SiteShell>
  );
}
