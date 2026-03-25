import type { Route } from "next";
import type { MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { OfferCard } from "@/components/offer-card";
import { Tag } from "@/components/tag";
import { getProviderBrand } from "@/lib/provider-brands";

const categories = [
  {
    href: "/loans" as Route,
    title: "Loans",
    description: "Personal loans and credit lines from European lenders with visible rates and terms.",
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
    description: "Travel, cashback, and everyday cards with transparent fees and rewards.",
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
    description: "International money transfers compared by fee, speed, and corridor coverage.",
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
    color: "bg-accent-orange text-accent-orange-text",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18M3 12l4-4M3 12l4 4M21 6H3M21 6l-4-4M21 6l-4 4" />
      </svg>
    ),
  },
];

/* Provider names displayed in the trust strip */
const providerNames = [
  "Revolut", "Wise", "N26", "Klarna", "bunq", "Curve",
  "Zopa", "Monese", "ING", "Santander", "BBVA",
  "Deutsche Bank", "BNP Paribas", "Barclaycard", "ABN AMRO",
  "UniCredit", "XE", "Remitly", "Payoneer", "Rabobank",
];

function roundCount(n: number): string {
  if (n <= 5) return `${n}`;
  if (n < 15) return `${Math.floor(n / 5) * 5}+`;
  return `${Math.floor(n / 10) * 10}+`;
}

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
            <h1 className="text-h1 tracking-tight text-ink sm:text-display">
              Compare financial products across Europe
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-secondary">
              Loans, cards, transfers, and exchange from regulated providers. Every offer ranked by cost, product fit, and provider quality - not by who pays us.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/loans" className={buttonStyles({ variant: "primary", size: "lg" })}>
                Browse offers
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-2">
                  <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="#how-it-works" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                How it works
              </Link>
            </div>

            {/* Value props */}
            <div className="mt-10 flex flex-wrap gap-3">
              {[
                "Transparent ranking",
                "Commission disclosed",
                `${roundCount(totalOffers)} offers compared`,
              ].map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-2 rounded-full bg-bg-surface px-4 py-2"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-accent-green-text">
                    <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-xs font-semibold text-ink-secondary">{tag}</span>
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
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                    style={{ backgroundColor: getProviderBrand("Klarna").bg, color: getProviderBrand("Klarna").text }}
                  >
                    {getProviderBrand("Klarna").mark}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Klarna</p>
                    <p className="text-xs text-ink-tertiary">Personal Loan</p>
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

              {/* Floating card 2 - Card */}
              <div className="absolute right-4 top-32 z-20 w-[240px] rounded-3xl border border-line bg-white p-5 shadow-elevated">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                    style={{ backgroundColor: getProviderBrand("Revolut").bg, color: getProviderBrand("Revolut").text }}
                  >
                    {getProviderBrand("Revolut").mark}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Revolut</p>
                    <p className="text-xs text-ink-tertiary">Metal Card</p>
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
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                    style={{ backgroundColor: getProviderBrand("Wise").bg, color: getProviderBrand("Wise").text }}
                  >
                    {getProviderBrand("Wise").mark}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Wise</p>
                    <p className="text-xs text-ink-tertiary">Money Transfer</p>
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
                  <span className="text-xs font-semibold text-ink">Updated regularly</span>
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
          <p className="mt-3 text-base text-ink-secondary">Compare products across regulated European providers</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => {
            const catKey = cat.title === "Credit Cards" ? "cards" : cat.title.toLowerCase() as keyof CategoryCounts;
            return (
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
                      <Tag tone="muted">{roundCount(counts[catKey])} offers</Tag>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{cat.description}</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-1 shrink-0 text-ink-tertiary transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink">
                    <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ══════ PROVIDERS - BRAND MARKS ══════ */}
      <section className="rounded-3xl bg-white px-8 py-10 shadow-card">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-ink-tertiary">
          Providers on Payn
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {providerNames.map((name) => {
            const brand = getProviderBrand(name);
            return (
              <div
                key={name}
                className="group flex items-center gap-2.5 rounded-full border border-line px-4 py-2 transition-all duration-200 hover:border-line-strong hover:shadow-subtle"
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold opacity-80 grayscale transition-all duration-200 group-hover:opacity-100 group-hover:grayscale-0"
                  style={{ backgroundColor: brand.bg, color: brand.text }}
                >
                  {brand.mark}
                </div>
                <span className="text-xs font-semibold text-ink-tertiary transition-colors group-hover:text-ink">
                  {name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════ FEATURED OFFERS ══════ */}
      {featuredOffers.length > 0 && (
        <section>
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-h2 text-ink">Top-ranked offers</h2>
              <p className="mt-3 text-base text-ink-secondary">Highest-scoring products across categories</p>
            </div>
            <Tag tone="blue">Updated regularly</Tag>
          </div>
          <div className="grid gap-4">
            {featuredOffers.map((offer, i) => (
              <OfferCard key={offer.id} offer={offer} rank={i + 1} />
            ))}
          </div>
        </section>
      )}

      {/* ══════ MOBILE APP - PREMIUM DEVICE MOCKUP ══════ */}
      <section className="overflow-hidden rounded-[40px] bg-gray-950 text-white">
        <div className="grid gap-10 p-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-center lg:gap-16 lg:p-16">
          {/* Premium iPhone mockup */}
          <div className="relative mx-auto w-[260px] lg:w-[280px]">
            {/* Device frame */}
            <div className="rounded-[3rem] border-[3px] border-gray-700/50 bg-gradient-to-b from-gray-800 to-gray-900 p-3 shadow-[0_0_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]">
              {/* Dynamic Island */}
              <div className="relative">
                <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[90px] -translate-x-1/2 rounded-full bg-black" />
              </div>
              {/* Screen */}
              <div className="overflow-hidden rounded-[2.25rem] bg-black">
                {/* Status bar */}
                <div className="flex items-center justify-between px-7 pb-1 pt-4">
                  <span className="text-[11px] font-semibold text-white">9:41</span>
                  <div className="flex items-center gap-1">
                    <svg width="16" height="10" viewBox="0 0 16 10" fill="white">
                      <rect x="0" y="4" width="3" height="6" rx="0.5" opacity="0.4" />
                      <rect x="4" y="2.5" width="3" height="7.5" rx="0.5" opacity="0.6" />
                      <rect x="8" y="1" width="3" height="9" rx="0.5" opacity="0.8" />
                      <rect x="12" y="0" width="3" height="10" rx="0.5" />
                    </svg>
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="white" opacity="0.9">
                      <path d="M1 7.5C3.5 3 10.5 3 13 7.5" stroke="white" fill="none" strokeWidth="1.2" />
                      <circle cx="7" cy="8" r="1.5" />
                    </svg>
                    <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
                      <rect x="0" y="1" width="18" height="8" rx="2" stroke="white" strokeWidth="1" opacity="0.5" />
                      <rect x="1.5" y="2.5" width="12" height="5" rx="1" fill="#34D399" />
                      <rect x="19" y="3.5" width="2" height="3" rx="0.5" fill="white" opacity="0.5" />
                    </svg>
                  </div>
                </div>

                {/* App content */}
                <div className="px-5 pb-6 pt-3">
                  {/* App header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M4 12L8 4L12 12" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-white">Payn</span>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                      </svg>
                    </div>
                  </div>

                  {/* Notification banner */}
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <p className="text-[10px] font-medium text-emerald-300">New offers added this week</p>
                  </div>

                  {/* Category cards */}
                  <div className="mt-4 space-y-2">
                    {[
                      { name: "Loans", accent: "bg-blue-500/20 text-blue-300" },
                      { name: "Cards", accent: "bg-purple-500/20 text-purple-300" },
                      { name: "Transfers", accent: "bg-emerald-500/20 text-emerald-300" },
                      { name: "Exchange", accent: "bg-orange-500/20 text-orange-300" },
                    ].map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 backdrop-blur">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${cat.accent} text-[9px] font-bold`}>
                            {cat.name.charAt(0)}
                          </div>
                          <span className="text-xs font-semibold text-white">{cat.name}</span>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-500">
                          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ))}
                  </div>

                  {/* Quick action */}
                  <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-center">
                    <p className="text-[11px] font-bold text-gray-900">Compare all offers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect behind phone */}
            <div className="absolute -inset-8 -z-10 rounded-full bg-emerald-500/5 blur-3xl" />
          </div>

          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5">
              <span className="text-xs font-semibold text-white/80">Coming soon</span>
            </div>

            <h2 className="mt-6 text-h1 tracking-tight text-white">
              Payn in your pocket
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-400">
              The same transparent comparison experience, built for mobile. Browse offers, compare rates, and track your favourite products on the go.
            </p>

            <div className="mt-8 grid gap-4">
              {[
                "Browse and filter offers anywhere",
                "Get notified when better rates appear",
                "Save products and compare side by side",
              ].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-300">{text}</span>
                </div>
              ))}
            </div>

            {/* Waitlist CTA */}
            <div className="mt-10">
              <p className="mb-3 text-xs font-medium text-gray-500">
                Join the waitlist for early access to the Payn mobile app
              </p>
              <div className="flex max-w-md gap-2">
                <a
                  href="mailto:petrov.cpay@gmail.com?subject=Payn%20mobile%20app%20waitlist&body=I%27d%20like%20to%20join%20the%20waitlist%20for%20the%20Payn%20mobile%20app."
                  className="h-12 rounded-full bg-white px-6 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 inline-flex items-center"
                >
                  Join waitlist
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-2">
                    <path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
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
              Financial comparison built on transparency
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              Clear rankings, visible terms, and disclosed commissions. See exactly how offers are scored before visiting a provider.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {providerNames.slice(0, 5).map((name) => {
                  const brand = getProviderBrand(name);
                  return (
                    <div
                      key={name}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold shadow-subtle"
                      style={{ backgroundColor: brand.bg, color: brand.text }}
                    >
                      {brand.mark}
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-ink-tertiary">20+ regulated providers</p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              {
                title: "Independent comparison",
                description: "Rankings are based on product fit, cost, and quality. Compensation does not determine order.",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                accent: "bg-accent-blue text-accent-blue-text",
              },
              {
                title: "Transparent methodology",
                description: "Every ranking factor is disclosed. See why an offer scores higher or lower.",
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
                description: "When we earn commission from a provider, we say so. Always visible, never hidden.",
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
