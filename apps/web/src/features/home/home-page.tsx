"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion, useMotionValue, animate } from "motion/react";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { buttonStyles } from "@/components/button";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { MotionReveal } from "@/components/motion-reveal";
import { useAuth } from "@/hooks/use-auth";
import { AnalyticsEvent, buildWebAnalyticsProperties } from "@/lib/analytics";
import { getDictionary, formatCopy } from "@/lib/i18n";
import { countTotalOffers, countOffersByOutcome } from "@/features/catalog/count-by-outcome";
import { AtlasGrid } from "@/features/home/atlas-grid";
import { localePath } from "@/lib/locale";
import { WhatsNew } from "@/features/home/whats-new";
import type { Highlight } from "@/features/highlights/get-active-highlights";
import { ProviderStrip } from "@/features/home/provider-strip";
import { HowItWorks } from "@/features/home/how-it-works";

// ─── Hero preview data (static, presentational) ───────────────────────────────
const HERO_CARDS = [
  {
    key: "wise",
    provider: "Wise",
    initials: "W",
    bg: "#164B3E",
    category: "International Transfer",
    metricLabel: "FX Spread",
    metricValue: "0.41%",
    badge: "Best Value",
    badgeStyle: { background: "#DDF4E7", color: "#0B6D3B" } as React.CSSProperties,
    dotColor: "bg-emerald-400",
    floatClass: "floating-layer",
    posClass: "left-0 top-0",
    motionDelay: "60ms",
  },
  {
    key: "revolut",
    provider: "Revolut",
    initials: "R",
    bg: "#2D1B69",
    category: "Premium Card",
    metricLabel: "Cashback",
    metricValue: "1%",
    badge: "Travel Pick",
    badgeStyle: { background: "#EEF2FF", color: "#3730A3" } as React.CSSProperties,
    dotColor: "bg-indigo-400",
    floatClass: "floating-layer-delayed",
    posClass: "right-0 top-[96px]",
    motionDelay: "180ms",
  },
  {
    key: "tr",
    provider: "Trade Republic",
    initials: "TR",
    bg: "#0B2B1C",
    category: "Investment",
    metricLabel: "Annual rate",
    metricValue: "4.00%",
    badge: "Top Return",
    badgeStyle: { background: "#DDF4E7", color: "#0B6D3B" } as React.CSSProperties,
    dotColor: "bg-emerald-400",
    floatClass: "floating-layer",
    posClass: "left-[16px] bottom-0",
    motionDelay: "300ms",
  },
] as const;

const impactSiteVerificationText = "Impact-Site-Verification: 947cb54d-d0de-4e29-b31f-5560a22cba3c";

// ─── NumberTicker ─────────────────────────────────────────────────────────────
function NumberTicker({ value, suffix = "", decimals = 2 }: { value: number; suffix?: string; decimals?: number }) {
  const shouldReduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(shouldReduce ? value : 0);

  useEffect(() => {
    if (shouldReduce) { setDisplay(value); return; }
    const controls = animate(mv, value, {
      duration: 1.2,
      ease: "easeOut",
      delay: 0.3,
      onUpdate: (latest: number) => setDisplay(latest),
    });
    return () => controls.stop();
  }, [value, decimals, shouldReduce, mv]);

  return <>{display.toFixed(decimals)}{suffix}</>;
}

// ─── Ticker values per card key ───────────────────────────────────────────────
const TICKER_CONFIG: Record<string, { value: number; decimals: number; suffix: string }> = {
  wise:    { value: 0.41, decimals: 2, suffix: "%" },
  revolut: { value: 1,    decimals: 0, suffix: "%" },
  tr:      { value: 4.0,  decimals: 2, suffix: "%" },
};

type HeroCardKey = (typeof HERO_CARDS)[number]["key"];
const FLOAT_CONFIG: Record<HeroCardKey, { period: number; amplitude: number; defaultRotate: number }> = {
  wise:    { period: 5,   amplitude: 6, defaultRotate: -1   },
  revolut: { period: 4.5, amplitude: 5, defaultRotate:  0.5 },
  tr:      { period: 6,   amplitude: 8, defaultRotate:  1   },
};

// ─── Main component ────────────────────────────────────────────────────────────
export function HomePage({ highlights = [] }: { highlights?: Highlight[] }) {
  const preferences = useMarketplacePreferences();
  const { user, loading } = useAuth();
  const { locale } = preferences;
  const dictionary = getDictionary(locale);
  const exploreHref = localePath(locale, "/explore");

  const heroBadges: Record<string, string> = {
    wise: dictionary.homeAtlas.badges.bestValue,
    revolut: dictionary.homeAtlas.badges.justLaunched,
    tr: dictionary.homeAtlas.badges.newRate,
  };

  const countryName =
    dictionary.homeAtlas.countryNames[preferences.country.toUpperCase()] ??
    preferences.country;

  const { productCount, providerCount } = countTotalOffers(preferences.country);
  const buckets = useMemo(() => countOffersByOutcome(preferences.country), [preferences.country]);
  const shouldReduce = useReducedMotion();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="grid min-w-0 gap-8 lg:gap-10">
      <AnalyticsPageView
        eventName={AnalyticsEvent.LandingViewed}
        dedupeKey="landing"
        properties={buildWebAnalyticsProperties({ country: preferences.country, language: locale, loggedIn: Boolean(user) })}
        ready={!loading}
      />
      <p className="sr-only" lang="en">{impactSiteVerificationText}</p>

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <MotionReveal
        as="section"
        className="relative overflow-hidden rounded-[40px] border border-line bg-white px-6 py-10 shadow-elevated sm:px-8 sm:py-12 lg:px-12 lg:py-16"
      >
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(15,138,75,0.10),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,247,244,0.94))]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.035)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">

          {/* ── Left: copy ── */}
          <div className="relative z-10 flex min-w-0 flex-col justify-center">
            {/* Eyebrow */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent-emerald/20 bg-accent-emerald-soft px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-emerald-strong">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent-emerald" />
              {dictionary.homeAtlas.hero.eyebrow}
            </div>

            {/* Headline */}
            <h1 className="mt-6 max-w-[16ch] text-[2.6rem] font-extrabold leading-[0.9] tracking-[-0.06em] text-ink sm:text-[3.6rem] lg:text-[4.4rem]">
              {dictionary.homeAtlas.hero.headline}
            </h1>

            {/* Subheadline */}
            <p className="mt-5 max-w-[36ch] text-[16px] leading-7 text-ink-secondary sm:text-[18px]">
              {formatCopy(dictionary.homeAtlas.hero.sub, { country: countryName })}
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={exploreHref}
                className={`${buttonStyles({ variant: "primary", size: "lg" })} hero-primary-cta gap-2`}
              >
                {dictionary.homeAtlas.hero.cta}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {/* Trustline */}
            <p className="mt-4 text-[12px] text-ink-tertiary">
              {formatCopy(dictionary.homeAtlas.hero.trustLine, { productCount, providerCount })}
            </p>

          </div>

          {/* ── Right: floating offer preview cards ── */}
          <div className="relative z-10 hidden min-h-[400px] min-w-0 lg:block">
            {/* Background glows */}
            <div className="pointer-events-none absolute right-6 top-12 h-56 w-56 rounded-full bg-accent-emerald/10 blur-3xl" />

            {HERO_CARDS.map((card) => {
              const fc = FLOAT_CONFIG[card.key];
              const isHovered = hoveredCard === card.key;
              const someHovered = hoveredCard !== null;
              return (
                <motion.div
                  key={card.key}
                  className={`motion-card absolute w-[204px] rounded-[22px] border border-line bg-white p-4 shadow-card ${card.posClass}`}
                  initial={shouldReduce ? false : { rotate: fc.defaultRotate }}
                  animate={
                    shouldReduce ? {} :
                    isHovered
                      ? { y: -12, rotate: 0, scale: 1.05 }
                      : someHovered
                        ? { scale: 0.97, opacity: 0.6, y: 0, rotate: fc.defaultRotate }
                        : { y: [0, -fc.amplitude, 0], rotate: fc.defaultRotate }
                  }
                  transition={
                    someHovered || isHovered
                      ? { duration: 0.3, ease: "easeOut" }
                      : { duration: fc.period, repeat: Infinity, ease: "easeInOut" }
                  }
                  onMouseEnter={() => setHoveredCard(card.key)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-extrabold text-white"
                      style={{ backgroundColor: card.bg }}
                    >
                      {card.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[10px] text-ink-tertiary">{card.category}</p>
                      <p className="truncate text-[13px] font-bold leading-tight text-ink">{card.provider}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-ink-tertiary">
                      {card.metricLabel}
                    </p>
                    <p className="mt-0.5 text-[2rem] font-extrabold leading-none tracking-[-0.07em] tabular-nums text-ink">
                      {TICKER_CONFIG[card.key]
                        ? <NumberTicker {...TICKER_CONFIG[card.key]} />
                        : card.metricValue}
                    </p>
                  </div>
                  <div
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                    style={card.badgeStyle}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${card.dotColor}`} />
                    {heroBadges[card.key] ?? card.badge}
                  </div>
                </motion.div>
              );
            })}

            {/* Live signal pill */}
            <div className="absolute bottom-0 right-0 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-[11px] font-semibold text-ink-secondary shadow-subtle">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent-emerald" />
              Live rates · updated daily
            </div>
          </div>
        </div>
      </MotionReveal>

      {/* ══════════════════════════════════════════════════════════
          PROVIDER STRIP
      ══════════════════════════════════════════════════════════ */}
      <ProviderStrip locale={locale} />

      {/* ══════════════════════════════════════════════════════════
          ATLAS GRID
      ══════════════════════════════════════════════════════════ */}
      <AtlasGrid country={preferences.country} locale={locale} buckets={buckets} />

      {/* ══════════════════════════════════════════════════════════
          WHAT'S NEW — admin-managed highlights feed
      ══════════════════════════════════════════════════════════ */}
      <WhatsNew highlights={highlights} locale={locale} />

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════ */}
      <HowItWorks locale={locale} />
    </div>
  );
}
