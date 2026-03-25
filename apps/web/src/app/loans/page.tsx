import { CategoryPageContent } from "@/components/category-page-content";
import { SiteShell } from "@/components/site-shell";
import { listCategoryOffers } from "@/server/catalog/catalog-service";

export default async function LoansPage() {
  const offers = await listCategoryOffers("loans");

  return (
    <SiteShell
      activeHref="/loans"
      eyebrow="Loans Marketplace"
      title="Find the right loan with transparent, data-driven comparison."
      description="Loan offers ranked by borrowing cost, product fit, and provider quality across multiple European markets."
      heroTags={["Updated regularly", "Independent comparison", "Methodology disclosed"]}
    >
      {/* Trust strip */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "How we rank",
            text: "Borrowing cost, product fit, application quality, and provider reliability.",
            icon: <path d="M8 3v10M5 6l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />,
          },
          {
            title: "Commission disclosed",
            text: "Some providers pay us, but compensation alone does not determine order.",
            icon: <><circle cx="8" cy="8" r="5" /><path d="M8 6v4M10 8H6" strokeLinecap="round" /></>,
          },
          {
            title: "Updated recently",
            text: "Rates and provider details reviewed and updated regularly.",
            icon: <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />,
          },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-blue">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-blue-text">
                {item.icon}
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-ink">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-ink-secondary">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <CategoryPageContent category="loans" offers={offers} label="loan offers" />
    </SiteShell>
  );
}
