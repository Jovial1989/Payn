import type { Route } from "next";
import type { MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { OfferCard } from "@/components/offer-card";
import { Tag } from "@/components/tag";

const categories = [
  {
    href: "/loans" as Route,
    title: "Loans",
    description: "Personal loans, credit lines, and financing from Europe's top lenders.",
    countKey: "loans" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M9 9c0-1 1-2 3-2s3 1 3 2-1 2-3 2-3 1-3 2 1 2 3 2 3-1 3-2" />
      </svg>
    ),
  },
  {
    href: "/cards" as Route,
    title: "Credit Cards",
    description: "Travel, cashback, and everyday cards with transparent fee structures.",
    countKey: "cards" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    href: "/transfers" as Route,
    title: "Transfers",
    description: "International money transfers with real-time fee and speed comparison.",
    countKey: "transfers" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17L17 7M17 7H7M17 7v10" />
      </svg>
    ),
  },
  {
    href: "/exchange" as Route,
    title: "Exchange",
    description: "Currency exchange with spread visibility and multi-currency accounts.",
    countKey: "exchange" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18M3 12l4-4M3 12l4 4M21 6H3M21 6l-4-4M21 6l-4 4" />
      </svg>
    ),
  },
];

const providers = [
  "Revolut", "Wise", "N26", "Klarna", "bunq", "Curve", "Zopa", "Monese", "ING", "Santander",
  "BBVA", "Deutsche Bank", "BNP Paribas", "Barclaycard",
];

const trustPoints = [
  {
    title: "Independent comparison",
    description: "Rankings are built on product fit, cost, and quality — not on how much a provider pays us.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Transparent methodology",
    description: "Every ranking factor is disclosed. You can see why an offer appears where it does.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  },
  {
    title: "Commission disclosed",
    description: "When we earn commission, we say so. Compensation alone never determines ranking order.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

type CategoryCounts = {
  loans: number;
  cards: number;
  transfers: number;
  exchange: number;
};

export function HomePage({
  counts,
  featuredOffers,
}: {
  counts: CategoryCounts;
  featuredOffers: MarketplaceOffer[];
}) {
  const totalOffers = counts.loans + counts.cards + counts.transfers + counts.exchange;

  return (
    <div className="grid gap-10">
      {/* Stats bar */}
      <section className="flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-line bg-bg-elevated px-6 py-5 sm:gap-12 lg:gap-16">
        {[
          { value: `${totalOffers}`, label: "Products" },
          { value: "40+", label: "Providers" },
          { value: "13", label: "EU Markets" },
          { value: "4.9", label: "User Rating" },
        ].map((stat, i, arr) => (
          <div key={stat.label} className="flex items-center gap-8 sm:gap-12 lg:gap-16">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-ink">{stat.value}</p>
              <p className="mt-0.5 text-xs font-medium text-ink-tertiary">{stat.label}</p>
            </div>
            {i < arr.length - 1 && <div className="hidden h-8 w-px bg-line sm:block" />}
          </div>
        ))}
      </section>

      {/* Category grid */}
      <section>
        <div className="mb-6">
          <h2 className="text-h2 text-ink">Browse by category</h2>
          <p className="mt-2 text-sm text-ink-secondary">Compare products across Europe&apos;s leading financial providers</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative overflow-hidden rounded-2xl border border-line bg-bg-elevated transition-all duration-300 hover:-translate-y-0.5 hover:border-line-active hover:shadow-glow"
            >
              <div className="flex items-start gap-5 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-bg-deep">
                  {cat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-ink">{cat.title}</h3>
                    <Tag tone="accent">{counts[cat.countKey]} offers</Tag>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{cat.description}</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-1 shrink-0 text-ink-tertiary transition-colors group-hover:text-primary">
                  <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Provider logos */}
      <section className="rounded-2xl border border-line bg-bg-elevated px-6 py-5">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-ink-tertiary">
          Providers on Payn
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {providers.map((name) => (
            <span key={name} className="text-sm font-semibold text-ink-secondary/60 transition-colors hover:text-ink-secondary">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* Featured offers */}
      {featuredOffers.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-h2 text-ink">Featured offers</h2>
              <p className="mt-2 text-sm text-ink-secondary">Top-ranked products across categories</p>
            </div>
            <Tag tone="muted">Updated daily</Tag>
          </div>
          <div className="grid gap-4">
            {featuredOffers.map((offer, i) => (
              <OfferCard key={offer.id} offer={offer} rank={i + 1} />
            ))}
          </div>
        </section>
      )}

      {/* Trust section */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-bg-elevated">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full bg-secondary opacity-[0.03] blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-[200px] w-[200px] rounded-full bg-primary opacity-[0.04] blur-[60px]" />

        <div className="relative grid gap-8 p-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12 lg:p-12">
          <div>
            <p className="text-caption uppercase tracking-widest text-secondary">Why Payn</p>
            <h2 className="mt-3 text-h2 text-ink">
              Financial comparison designed to be transparent and trustworthy.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
              Payn focuses on ranking clarity, visible disclosures, and product information
              you can actually use before you visit a provider site.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["KL", "RV", "WS", "N2", "ING"].map((mark) => (
                  <div
                    key={mark}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg-elevated bg-bg-surface text-[10px] font-bold text-ink-secondary"
                  >
                    {mark}
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-tertiary">40+ regulated providers</p>
            </div>
          </div>

          <div className="grid gap-4">
            {trustPoints.map((point, i) => (
              <div
                key={point.title}
                className="flex gap-4 rounded-xl border border-line bg-bg-surface p-5 transition-colors hover:border-line-strong"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  {point.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{point.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
