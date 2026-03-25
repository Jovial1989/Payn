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
    color: "bg-accent-blue text-accent-blue-text",
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
    color: "bg-accent-purple text-accent-purple-text",
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
    color: "bg-accent-green text-accent-green-text",
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
    color: "bg-accent-orange text-accent-orange-text",
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
    <div className="grid gap-24">
      {/* ══════ HERO ══════ */}
      <section className="relative">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16">
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-bg-surface px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-accent-green-text" />
              <span className="text-xs font-semibold text-ink-secondary">Trusted by 50,000+ Europeans</span>
            </div>

            <h1 className="mt-8 text-h1 tracking-tight text-ink sm:text-display">
              Your smarter way to compare financial products
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-secondary">
              {totalOffers} offers across loans, cards, transfers, and exchange — ranked transparently, not by who pays us more.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
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

            <div className="mt-10 flex items-center gap-8">
              {[
                { value: `${totalOffers}`, label: "Products" },
                { value: `${providers.length}+`, label: "Providers" },
                { value: "13", label: "EU Markets" },
              ].map((stat, i, arr) => (
                <div key={stat.label} className="flex items-center gap-8">
                  <div>
                    <p className="text-2xl font-extrabold tabular-nums tracking-tight text-ink">{stat.value}</p>
                    <p className="text-xs font-medium text-ink-tertiary">{stat.label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="h-10 w-px bg-line" />}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Floating widget cards */}
          <div className="relative hidden lg:block">
            <div className="relative h-[480px]">
              {/* Background shape */}
              <div className="absolute inset-0 rounded-[40px] bg-bg-surface" />

              {/* Floating card 1 - Top loan */}
              <div className="absolute left-6 top-8 z-10 w-[260px] rounded-3xl border border-line bg-white p-5 shadow-elevated">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue text-xs font-bold text-accent-blue-text">
                    KL
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Klarna</p>
                    <p className="text-xs text-ink-tertiary">Top Loan</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-bg-surface px-3 py-2.5">
                    <p className="text-[10px] font-medium text-ink-tertiary">APR from</p>
                    <p className="text-lg font-extrabold tracking-tight text-ink">3.9%</p>
                  </div>
                  <div className="rounded-xl bg-bg-surface px-3 py-2.5">
                    <p className="text-[10px] font-medium text-ink-tertiary">Up to</p>
                    <p className="text-lg font-extrabold tracking-tight text-ink">50k</p>
                  </div>
                </div>
              </div>

              {/* Floating card 2 - Best card */}
              <div className="absolute right-4 top-32 z-20 w-[240px] rounded-3xl border border-line bg-white p-5 shadow-elevated">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple text-xs font-bold text-accent-purple-text">
                    RV
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Revolut</p>
                    <p className="text-xs text-ink-tertiary">Best Card</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-bg-surface px-3 py-2.5">
                  <p className="text-[10px] font-medium text-ink-tertiary">Cashback</p>
                  <p className="text-lg font-extrabold tracking-tight text-ink">Up to 1%</p>
                </div>
              </div>

              {/* Floating card 3 - Transfer */}
              <div className="absolute bottom-12 left-12 z-10 w-[250px] rounded-3xl border border-line bg-white p-5 shadow-elevated">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-green text-xs font-bold text-accent-green-text">
                    WS
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Wise</p>
                    <p className="text-xs text-ink-tertiary">Best Transfer</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-bg-surface px-3 py-2.5">
                    <p className="text-[10px] font-medium text-ink-tertiary">Fee from</p>
                    <p className="text-lg font-extrabold tracking-tight text-ink">0.41%</p>
                  </div>
                  <div className="rounded-xl bg-bg-surface px-3 py-2.5">
                    <p className="text-[10px] font-medium text-ink-tertiary">Countries</p>
                    <p className="text-lg font-extrabold tracking-tight text-ink">80+</p>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute bottom-6 right-8 z-20 rounded-2xl border border-line bg-white px-4 py-3 shadow-card">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent-green-text">
                    <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-xs font-semibold text-ink">Updated today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ CATEGORY GRID ══════ */}
      <section>
        <div className="mb-10">
          <h2 className="text-h2 text-ink">Browse by category</h2>
          <p className="mt-3 text-base text-ink-secondary">Compare products across Europe&apos;s leading financial providers</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group rounded-3xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="flex items-start gap-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${cat.color}`}>
                  {cat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-ink">{cat.title}</h3>
                    <Tag tone="muted">{counts[cat.countKey]} offers</Tag>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{cat.description}</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-1 shrink-0 text-ink-tertiary transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink">
                  <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════ PROVIDERS ══════ */}
      <section className="rounded-3xl bg-white px-8 py-8 shadow-card">
        <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-ink-tertiary">
          Providers on Payn
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {providers.map((name) => (
            <span key={name} className="text-sm font-semibold text-ink-tertiary transition-colors hover:text-ink">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ══════ FEATURED OFFERS ══════ */}
      {featuredOffers.length > 0 && (
        <section>
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-h2 text-ink">Featured offers</h2>
              <p className="mt-3 text-base text-ink-secondary">Top-ranked products across categories</p>
            </div>
            <Tag tone="blue">Updated daily</Tag>
          </div>
          <div className="grid gap-4">
            {featuredOffers.map((offer, i) => (
              <OfferCard key={offer.id} offer={offer} rank={i + 1} />
            ))}
          </div>
        </section>
      )}

      {/* ══════ MOBILE APP — DARK INVERSION ══════ */}
      <section className="overflow-hidden rounded-[40px] bg-gray-900 text-white">
        <div className="grid gap-10 p-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-16 lg:p-16">
          {/* Phone visual */}
          <div className="relative mx-auto w-[220px] lg:w-[250px]">
            <div className="rounded-[2rem] border border-white/10 bg-gray-800 p-2.5 shadow-2xl">
              <div className="overflow-hidden rounded-[1.5rem] bg-gray-900">
                <div className="flex items-center justify-between px-5 py-2.5">
                  <span className="text-[10px] font-medium text-gray-500">9:41</span>
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-gray-600" />
                    <div className="h-2 w-2 rounded-full bg-gray-600" />
                    <div className="h-2 w-3.5 rounded-full bg-gray-600" />
                  </div>
                </div>
                <div className="px-4 pb-5 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white">
                      <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                        <path d="M4 12L8 4L12 12" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-white">Payn</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {["Loans", "Cards", "Transfers", "Exchange"].map((cat) => (
                      <div key={cat} className="flex items-center justify-between rounded-xl bg-gray-800 px-3 py-2">
                        <span className="text-[10px] font-medium text-gray-300">{cat}</span>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-gray-600">
                          <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl bg-white/10 p-2.5 text-center">
                    <p className="text-[10px] font-semibold text-white">New offers available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification */}
            <div className="absolute -right-4 top-10 rounded-2xl border border-white/10 bg-gray-800 px-3 py-2 shadow-2xl">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <p className="text-[9px] font-medium text-gray-300">Better rate found</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5">
              <span className="text-xs font-semibold text-white/80">Coming Soon</span>
            </div>

            <h2 className="mt-6 text-h1 tracking-tight text-white">
              Your financial marketplace, in your pocket
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-400">
              The Payn app brings the same transparent comparison experience to iOS and Android.
            </p>

            <div className="mt-8 grid gap-4">
              {[
                "Compare offers on the go",
                "Get alerts when better rates appear",
                "Save and track your favourite products",
              ].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-300">{text}</span>
                </div>
              ))}
            </div>

            {/* Store badges */}
            <div className="mt-10 flex flex-wrap gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 transition-colors hover:bg-white/10">
                <svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor" className="text-white">
                  <path d="M16.5 12.5c0-2.8 2.3-4.2 2.4-4.3-1.3-1.9-3.3-2.2-4-2.2-1.7-.2-3.3 1-4.2 1s-2.2-1-3.6-1C5 6 3 7.5 2 9.8c-2 4.5-.5 11.2 1.5 14.8 1 1.8 2.1 3.8 3.6 3.7 1.5-.1 2-1 3.8-1s2.3 1 3.8 1 2.5-1.8 3.5-3.6c1.1-1.6 1.5-3.2 1.5-3.3-.1-.1-3.2-1.3-3.2-4.9zm-3-9C14.4 2.3 15 .8 15 0c-1 0-2.3.7-3 1.5-.7.7-1.3 2-1.1 3.1 1 .1 2.1-.5 2.6-1.1z" />
                </svg>
                <div>
                  <p className="text-[9px] leading-none text-gray-500">Download on the</p>
                  <p className="text-sm font-semibold text-white">App Store</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 transition-colors hover:bg-white/10">
                <svg width="20" height="22" viewBox="0 0 20 22" fill="currentColor" className="text-white">
                  <path d="M0.5 0L15 10l4-2.5L1.5 0H0.5zM0.5 22L15 12l4 2.5L1.5 22H0.5z" />
                  <path d="M1 1.4L14.1 11 1 20.6V1.4z" />
                </svg>
                <div>
                  <p className="text-[9px] leading-none text-gray-500">Get it on</p>
                  <p className="text-sm font-semibold text-white">Google Play</p>
                </div>
              </div>
            </div>

            {/* Waitlist */}
            <div className="mt-8 flex max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter email for early access"
                className="h-12 flex-1 rounded-full border border-white/10 bg-white/5 px-5 text-sm text-white placeholder:text-gray-500 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
              />
              <button
                type="button"
                className="h-12 rounded-full bg-white px-6 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
              >
                Join waitlist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ WHY PAYN ══════ */}
      <section id="how-it-works">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-tertiary">Why Payn</p>
            <h2 className="mt-4 text-h2 text-ink">
              Financial comparison designed for transparency.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              Payn focuses on ranking clarity, visible disclosures, and product information
              you can actually use before you visit a provider site.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["KL", "RV", "WS", "N2", "ING"].map((mark) => (
                  <div
                    key={mark}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-bg-surface text-[10px] font-bold text-ink-secondary shadow-subtle"
                  >
                    {mark}
                  </div>
                ))}
              </div>
              <p className="text-sm text-ink-tertiary">{providers.length}+ regulated providers</p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              {
                title: "Independent comparison",
                description: "Rankings are built on product fit, cost, and quality — not on how much a provider pays us.",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                accent: "bg-accent-blue text-accent-blue-text",
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
                accent: "bg-accent-purple text-accent-purple-text",
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
                accent: "bg-accent-green text-accent-green-text",
              },
            ].map((point) => (
              <div
                key={point.title}
                className="flex gap-4 rounded-3xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${point.accent}`}>
                  {point.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">{point.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
