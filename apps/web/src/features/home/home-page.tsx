"use client";

import Link from "next/link";
import { buttonStyles } from "@/components/button";
import {
  HeroPhoneMockup,
  AppStoreButton,
  GooglePlayButton,
  WaitlistBadge,
} from "@/components/hero-phone-mockup";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { ProviderStrip } from "@/components/provider-strip";
import { localePath } from "@/lib/locale";

const featuredProviders = [
  "Revolut",
  "Wise",
  "Klarna",
  "N26",
  "Santander",
  "BNP Paribas",
];

const valuePoints = [
  "Transparent ranking",
  "Real filters, not ads",
  "One place for all financial decisions",
];

const steps = [
  "Choose country",
  "Select category",
  "Apply filters",
  "Get ranked offers",
];

const categories = [
  { label: "Loans", count: "45+", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M2 10h20" />
    </svg>
  )},
  { label: "Cards", count: "30+", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )},
  { label: "Transfers", count: "25+", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  )},
  { label: "Exchange", count: "20+", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" />
    </svg>
  )},
  { label: "Insurance", count: "15+", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )},
  { label: "Investments", count: "35+", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )},
];

const topResults = [
  { rank: 1, provider: "Wise", title: "Wise Transfer", metric: "EUR 2.10 fee", tag: "Fastest" },
  { rank: 2, provider: "Revolut", title: "Revolut Standard", metric: "Free transfer", tag: "No fees" },
  { rank: 3, provider: "N26", title: "N26 You", metric: "EUR 1.50 fee", tag: "Best value" },
];

export function HomePage() {
  const { locale } = useMarketplacePreferences();
  return (
    <div className="grid gap-10">
      {/* ─── Hero: Discovery ─── */}
      <section className="overflow-hidden rounded-[40px] border border-line bg-white shadow-card">
        <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:px-10 lg:py-12">
          {/* Left: headline + search intent */}
          <div className="flex flex-col justify-center">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
              European financial marketplace
            </p>
            <h1 className="mt-4 max-w-xl text-display text-ink">
              Compare and choose with confidence
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-secondary sm:text-lg">
              Loans, cards, transfers, exchange, insurance, and investments across Europe — ranked transparently with real filters.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={localePath(locale, "/explore")} className={buttonStyles({ variant: "primary", size: "lg" })}>
                Explore offers
              </Link>
              <Link href={localePath(locale, "/signup")} className={buttonStyles({ variant: "secondary", size: "lg" })}>
                Get started
              </Link>
            </div>

            <div className="mt-8 grid gap-3">
              {valuePoints.map((point) => (
                <div key={point} className="flex items-center gap-3 text-sm font-medium text-ink-secondary">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-green text-accent-green-text">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: categories + live preview */}
          <div className="grid gap-4">
            {/* Category grid */}
            <div className="rounded-[28px] bg-bg-surface p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Browse by category</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {categories.map((cat) => (
                  <Link
                    key={cat.label}
                    href={localePath(locale, "/explore")}
                    className="flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-3 text-ink-secondary shadow-subtle transition-all hover:shadow-card hover:text-ink"
                  >
                    <span className="shrink-0 text-ink-tertiary">{cat.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{cat.label}</p>
                      <p className="text-[11px] text-ink-tertiary">{cat.count} products</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Live ranked preview */}
            <div className="rounded-[28px] border border-line bg-white p-5 shadow-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Top ranked</p>
                  <p className="mt-1 text-sm font-bold text-ink">Transfers in Europe</p>
                </div>
                <Link href={localePath(locale, "/explore")} className="text-xs font-semibold text-ink-tertiary transition-colors hover:text-ink">
                  See all
                </Link>
              </div>
              <div className="mt-4 grid gap-2">
                {topResults.map((item) => (
                  <div key={item.rank} className="flex items-center justify-between rounded-xl bg-bg-surface px-3.5 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-blue text-[11px] font-bold text-accent-blue-text">
                        #{item.rank}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-ink">{item.title}</p>
                        <p className="text-[11px] text-ink-tertiary">{item.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-medium tabular-nums text-ink-secondary shadow-subtle">
                        {item.metric}
                      </span>
                      <span className="rounded-md bg-accent-green px-2 py-0.5 text-[10px] font-semibold text-accent-green-text">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Payn ─── */}
      <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Why Payn</p>
            <h2 className="mt-3 text-h2 text-ink">A calmer way to compare financial products</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {valuePoints.map((point) => (
              <div key={point} className="rounded-[24px] bg-bg-surface px-5 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="mt-4 text-sm font-semibold leading-relaxed text-ink">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">How it works</p>
            <h2 className="mt-3 text-h2 text-ink">A simple path from search to shortlist</h2>
          </div>
          <Link href={localePath(locale, "/explore")} className={buttonStyles({ variant: "secondary", size: "md" })}>
            Open Explore
          </Link>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="rounded-[24px] bg-bg-surface px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                Step {index + 1}
              </p>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-ink">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Mobile App: Continuation ─── */}
      <section className="overflow-hidden rounded-[32px] border border-line bg-[#0c0f0e] shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1fr_0.85fr]">
          {/* Left: copy + CTAs */}
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:py-16">
            <WaitlistBadge />

            <h2 className="mt-5 max-w-lg text-h2 text-white lg:text-h1">
              Save on web, continue on mobile
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/60 sm:text-base">
              Build your shortlist on any device. Compare side by side. When you are ready to decide, everything is right where you left it.
            </p>

            <div className="mt-5 grid gap-3">
              {[
                "Your shortlist syncs across devices",
                "Side-by-side comparison on the go",
                "Pick up where you left off",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-6" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/55">{item}</span>
                </div>
              ))}
            </div>

            {/* App store buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <AppStoreButton />
              <GooglePlayButton />
            </div>

            <p className="mt-4 text-[12px] text-white/30">
              Join the waitlist for early access. iOS and Android.
            </p>
          </div>

          {/* Right: phone mockup — visible on lg+ */}
          <div className="relative hidden lg:flex lg:items-center lg:justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(16,185,129,0.08),_transparent_60%)]" />
            <div className="relative py-10">
              <HeroPhoneMockup />
            </div>
          </div>

          {/* Tablet/mobile: show phone inline centered */}
          <div className="flex items-center justify-center px-6 pb-10 lg:hidden">
            <div className="scale-90">
              <HeroPhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trusted Providers ─── */}
      <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Trusted providers</p>
            <h2 className="mt-3 text-h2 text-ink">Real brands, visible side by side</h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-secondary">
            Payn compares products from recognizable European providers without turning the experience into an ad wall.
          </p>
        </div>

        <div className="mt-6">
          <ProviderStrip providers={featuredProviders} />
        </div>
      </section>
    </div>
  );
}
