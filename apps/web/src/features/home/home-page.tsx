import type { Route } from "next";
import type { MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
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
  "Revolut", "Wise", "N26", "Klarna", "bunq", "Curve", "Zopa", "Monese",
  "ING", "Santander", "BBVA", "Deutsche Bank", "BNP Paribas", "Barclaycard",
  "ABN AMRO", "UniCredit", "Rabobank", "XE", "Remitly", "Payoneer",
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
      {/* ══════ PREMIUM HERO ══════ */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-bg-elevated">
        {/* Background effects */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary opacity-[0.06] blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-secondary opacity-[0.04] blur-[100px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(16,185,129,0.08),transparent_60%)]" />

        <div className="relative grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:p-12 xl:p-16">
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-bg-surface px-4 py-1.5">
              <div className="h-2 w-2 animate-pulse-slow rounded-full bg-primary" />
              <span className="text-xs font-medium text-ink-secondary">Trusted by 50,000+ Europeans</span>
            </div>

            <h1 className="mt-6 text-h1 text-ink sm:text-display">
              Your smarter way to compare financial products
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-secondary">
              {totalOffers} offers across loans, cards, transfers, and exchange — ranked transparently by cost, quality, and fit. Not by who pays us more.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/loans" className={buttonStyles({ variant: "primary", size: "lg" })}>
                Compare offers
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-2">
                  <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="#how-it-works" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                How it works
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-line pt-6">
              {[
                { value: `${totalOffers}`, label: "Products" },
                { value: `${providers.length}+`, label: "Providers" },
                { value: "13", label: "EU Markets" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl font-bold tabular-nums text-ink">{stat.value}</p>
                  <p className="text-xs font-medium text-ink-tertiary">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Device Visual */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto w-[320px]">
              {/* Phone frame */}
              <div className="rounded-[2.5rem] border border-line-strong bg-bg-deep p-3 shadow-elevated">
                <div className="overflow-hidden rounded-[2rem] bg-bg-elevated">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-6 py-3">
                    <span className="text-xs font-medium text-ink-secondary">9:41</span>
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-ink-tertiary" />
                      <div className="h-2.5 w-2.5 rounded-full bg-ink-tertiary" />
                      <div className="h-2.5 w-4 rounded-full bg-ink-tertiary" />
                    </div>
                  </div>

                  {/* App header */}
                  <div className="px-5 pb-4 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                          <path d="M4 12L8 4L12 12" stroke="#040907" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-ink">Payn</span>
                    </div>
                    <p className="mt-3 text-xs font-medium text-ink-secondary">Your offers today</p>
                  </div>

                  {/* Mini offer cards */}
                  <div className="space-y-2.5 px-4 pb-6">
                    {[
                      { provider: "KL", name: "Klarna", metric: "3.9% APR", tag: "Top Loan" },
                      { provider: "RV", name: "Revolut", metric: "1% cashback", tag: "Best Card" },
                      { provider: "WS", name: "Wise", metric: "0.41% fee", tag: "Top Transfer" },
                    ].map((item) => (
                      <div key={item.name} className="rounded-xl border border-line bg-bg-surface p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-overlay text-[9px] font-bold text-ink">
                              {item.provider}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-ink">{item.name}</p>
                              <p className="text-[10px] text-ink-tertiary">{item.metric}</p>
                            </div>
                          </div>
                          <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[9px] font-semibold text-primary">
                            {item.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -left-10 top-24 animate-fade-in rounded-xl border border-line bg-bg-elevated px-4 py-3 shadow-elevated">
                <p className="text-[10px] font-medium text-ink-secondary">Best rate found</p>
                <p className="text-lg font-bold text-primary">3.5% APR</p>
              </div>
              <div className="absolute -right-8 bottom-32 animate-fade-in rounded-xl border border-line bg-bg-elevated px-4 py-3 shadow-elevated">
                <p className="text-[10px] font-medium text-ink-secondary">Transfer fee</p>
                <p className="text-lg font-bold text-secondary-400">EUR 0.41</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ CATEGORY GRID ══════ */}
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

      {/* ══════ PROVIDER LOGOS ══════ */}
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

      {/* ══════ FEATURED OFFERS ══════ */}
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

      {/* ══════ MOBILE APP PROMO ══════ */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-bg-elevated">
        <div className="pointer-events-none absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-secondary opacity-[0.05] blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-primary opacity-[0.04] blur-[80px]" />

        <div className="relative grid gap-8 p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-12 lg:p-12">
          {/* Phone visual */}
          <div className="relative mx-auto w-[240px] lg:w-[260px]">
            <div className="rounded-[2rem] border border-line-strong bg-bg-deep p-2.5 shadow-elevated">
              <div className="overflow-hidden rounded-[1.5rem] bg-bg-elevated">
                <div className="flex items-center justify-between px-5 py-2.5">
                  <span className="text-[10px] font-medium text-ink-secondary">9:41</span>
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-ink-tertiary" />
                    <div className="h-2 w-2 rounded-full bg-ink-tertiary" />
                    <div className="h-2 w-3.5 rounded-full bg-ink-tertiary" />
                  </div>
                </div>
                <div className="px-4 pb-5 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md gradient-primary">
                      <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                        <path d="M4 12L8 4L12 12" stroke="#040907" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-ink">Payn</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {["Loans", "Cards", "Transfers", "Exchange"].map((cat) => (
                      <div key={cat} className="flex items-center justify-between rounded-lg bg-bg-surface px-3 py-2">
                        <span className="text-[10px] font-medium text-ink">{cat}</span>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-ink-tertiary">
                          <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-lg bg-primary-soft p-2.5 text-center">
                    <p className="text-[10px] font-semibold text-primary">New offers available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification float */}
            <div className="absolute -right-6 top-12 rounded-lg border border-line bg-bg-elevated px-3 py-2 shadow-elevated">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <p className="text-[9px] font-medium text-ink">Better rate found</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1">
              <span className="text-xs font-semibold text-secondary-400">Coming Soon</span>
            </div>

            <h2 className="mt-4 text-h2 text-ink lg:text-h1">
              Your financial marketplace, in your pocket
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              The Payn app brings the same transparent comparison experience to iOS and Android.
            </p>

            <div className="mt-6 grid gap-3">
              {[
                { text: "Compare offers on the go", icon: "M5 12l5 5L20 7" },
                { text: "Get alerts when better rates appear", icon: "M5 12l5 5L20 7" },
                { text: "Save and track your favourite products", icon: "M5 12l5 5L20 7" },
              ].map((benefit) => (
                <div key={benefit.text} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                      <path d={benefit.icon} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-ink">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Store badges */}
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-line-strong bg-bg-surface px-5 py-3 transition-colors hover:border-line-active">
                <svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor" className="text-ink">
                  <path d="M16.5 12.5c0-2.8 2.3-4.2 2.4-4.3-1.3-1.9-3.3-2.2-4-2.2-1.7-.2-3.3 1-4.2 1s-2.2-1-3.6-1C5 6 3 7.5 2 9.8c-2 4.5-.5 11.2 1.5 14.8 1 1.8 2.1 3.8 3.6 3.7 1.5-.1 2-1 3.8-1s2.3 1 3.8 1 2.5-1.8 3.5-3.6c1.1-1.6 1.5-3.2 1.5-3.3-.1-.1-3.2-1.3-3.2-4.9zm-3-9C14.4 2.3 15 .8 15 0c-1 0-2.3.7-3 1.5-.7.7-1.3 2-1.1 3.1 1 .1 2.1-.5 2.6-1.1z" />
                </svg>
                <div>
                  <p className="text-[9px] leading-none text-ink-secondary">Download on the</p>
                  <p className="text-sm font-semibold text-ink">App Store</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-line-strong bg-bg-surface px-5 py-3 transition-colors hover:border-line-active">
                <svg width="20" height="22" viewBox="0 0 20 22" fill="currentColor" className="text-ink">
                  <path d="M1 1.4L14.1 11 1 20.6V1.4zm1.5 0L15.8 11 2.5 20.6V1.4zM15.8 11L18 12.4 15.8 11zm0 0l2.2-1.4L15.8 11z" />
                  <path d="M0.5 0L15 10l4-2.5L1.5 0H0.5zM0.5 22L15 12l4 2.5L1.5 22H0.5z" />
                </svg>
                <div>
                  <p className="text-[9px] leading-none text-ink-secondary">Get it on</p>
                  <p className="text-sm font-semibold text-ink">Google Play</p>
                </div>
              </div>
            </div>

            {/* Waitlist */}
            <div className="mt-6 flex max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter your email for early access"
                className="h-11 flex-1 rounded-xl border border-line bg-bg-surface px-4 text-sm text-ink placeholder:text-ink-tertiary focus:border-line-active focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                className={buttonStyles({ variant: "primary", size: "md" })}
              >
                Join waitlist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ TRUST / WHY PAYN ══════ */}
      <section id="how-it-works" className="relative overflow-hidden rounded-3xl border border-line bg-bg-elevated">
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
              <p className="text-xs text-ink-tertiary">{providers.length}+ regulated providers</p>
            </div>
          </div>

          <div className="grid gap-4">
            {trustPoints.map((point) => (
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
