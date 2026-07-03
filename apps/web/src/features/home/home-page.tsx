"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ScrambleNumber } from "@/features/home/scramble-number";
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
import { getProductEntryActionLabel } from "@/components/product-entry-action";
import { WhatsNew } from "@/features/home/whats-new";
import type { Highlight } from "@/features/highlights/get-active-highlights";
import { ProviderStrip } from "@/features/home/provider-strip";
import { AppWaitlistPill } from "@/features/home/app-waitlist-pill";
import { HowItWorks } from "@/features/home/how-it-works";
import { TopPicksStrip } from "@/features/home/top-picks-strip";
import { WhatDoYouWantToDo } from "@/features/home/what-do-you-want-to-do";
import type { MarketplaceOffer } from "@payn/types";

// ─── Hero preview data (static, presentational) ───────────────────────────────
const HERO_CARDS = [
  // Positions tightened so badges and neighbouring logos no longer share
  // the same Y-band (was: Wise.bottom = ~200, Revolut.top = 96 → pill of
  // Wise sat next to logo of Revolut). Cards are now stacked vertically
  // along a true Z-pattern with badges moved to top-right corners, so
  // each card's "BEST VALUE" sticker reads as a sticker, not a stray pill.
  {
    key: "wise",
    provider: "Wise",
    initials: "W",
    bg: "#164B3E",
    category: "International Transfer",
    metricLabel: "Rate markup",
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
    bg: "#1F2937",
    category: "Premium Card",
    metricLabel: "Cashback",
    metricValue: "1%",
    badge: "Travel Pick",
    badgeStyle: { background: "#DDF4E7", color: "#0B6D3B" } as React.CSSProperties,
    dotColor: "bg-emerald-400",
    floatClass: "floating-layer-delayed",
    posClass: "right-0 top-[164px]",
    motionDelay: "180ms",
  },
  {
    key: "tr",
    provider: "Trade Republic",
    initials: "TR",
    bg: "#0B2B1C",
    category: "Investment",
    metricLabel: "Interest a year",
    metricValue: "4.00%",
    badge: "Top Return",
    badgeStyle: { background: "#DDF4E7", color: "#0B6D3B" } as React.CSSProperties,
    dotColor: "bg-emerald-400",
    floatClass: "floating-layer",
    posClass: "left-[20px] bottom-0",
    motionDelay: "300ms",
  },
] as const;

const impactSiteVerificationText = "Impact-Site-Verification: 947cb54d-d0de-4e29-b31f-5560a22cba3c";

// ─── Testimonials — swap in real user quotes when collected ──────────────────
// Section is hidden when this array is empty. No fakes go live.
const TESTIMONIALS: { quote: string; author: string; location?: string }[] = [
  // Example:
  // {
  //   quote: "Found a travel card that saves me €30 every time I go abroad. Took about 3 minutes.",
  //   author: "Marco S.",
  //   location: "Berlin, Germany",
  // },
];

// ─── ScrambleNumber config per card key ──────────────────────────────────────
const SCRAMBLE_CONFIG: Record<string, { value: number; decimals: number; suffix: string; cacheKey: string }> = {
  wise:    { value: 0.41, decimals: 2, suffix: "%", cacheKey: "hero-wise"    },
  revolut: { value: 1,    decimals: 0, suffix: "%", cacheKey: "hero-revolut" },
  tr:      { value: 4.0,  decimals: 2, suffix: "%", cacheKey: "hero-tr"      },
};

type HeroCardKey = (typeof HERO_CARDS)[number]["key"];
const FLOAT_CONFIG: Record<HeroCardKey, { period: number; amplitude: number; defaultRotate: number }> = {
  wise:    { period: 5,   amplitude: 6, defaultRotate: -1   },
  revolut: { period: 4.5, amplitude: 5, defaultRotate:  0.5 },
  tr:      { period: 6,   amplitude: 8, defaultRotate:  1   },
};

// ─── Main component ────────────────────────────────────────────────────────────
export function HomePage({
  highlights = [],
  topPicks = [],
  countryMarket = [],
}: {
  highlights?: Highlight[];
  /** Top 3 category-diverse winners picked server-side from the country's
   *  full market. Used by TopPicksStrip to surface Card v2 visuals on home. */
  topPicks?: MarketplaceOffer[];
  /** Full unfiltered country market — fed to each OfferRowAtlas as
   *  marketContext so award ribbons and score bars rank correctly. */
  countryMarket?: MarketplaceOffer[];
}) {
  const preferences = useMarketplacePreferences();
  const { user, loading } = useAuth();
  const { locale } = preferences;
  const dictionary = getDictionary(locale);
  // PASS A — "browse" CTA points straight at /discover (the category
  // hub) instead of the retired /explore index, which only 301'd here.
  const exploreHref = localePath(locale, "/discover");
  // FLOW — the hero's primary action now goes straight to Explore (the
  // offers hub) instead of the /start quiz. productEntryActionLabel is the
  // localized "Explore all / Jetzt vergleichen" verb already used in the
  // footer + product entry points, so the CTA reads as "go see offers".
  const productEntryActionLabel = getProductEntryActionLabel(locale);

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

  // ── AI selection cycle: each card gets a green ring + "Best fit" badge
  // in turn — simulates the system scanning and picking the top result.
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedCard = HERO_CARDS[selectedIdx].key;
  useEffect(() => {
    if (shouldReduce) return;
    const id = setInterval(() => {
      setSelectedIdx((i) => (i + 1) % HERO_CARDS.length);
    }, 2600);
    return () => clearInterval(id);
  }, [shouldReduce]);

  // ── Hero parallax: each card drifts at a different rate as the hero scrolls
  // out of view, creating a convincing depth-of-field layering effect.
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Different Y-shift per "depth layer" — further cards move slower.
  const pWise    = useTransform(heroScroll, [0, 1], [0, shouldReduce ? 0 : -22]);
  const pRevolut = useTransform(heroScroll, [0, 1], [0, shouldReduce ? 0 : -48]);
  const pTR      = useTransform(heroScroll, [0, 1], [0, shouldReduce ? 0 : -34]);
  const parallaxY: Record<string, MotionValue<number>> = {
    wise: pWise, revolut: pRevolut, tr: pTR,
  };

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
      {/* RESP.1 — Hero padding crushed at 375px. Dropped px-6 → px-4 on
          mobile (24px → 16px each side) which gives the headline an
          extra 16px to breathe; corner radius shrunk from 40px → 28px
          on mobile so the rounded edges still feel intentional at the
          smaller frame. */}
      {/* HERO — full-bleed band. The root SiteShell has overflow-x-clip so
          the left-1/2 / -translate-x / w-screen breakout is safe (no
          horizontal scroll). Negative top margin cancels <main>'s top
          padding so the band sits flush under the header. The old rounded
          border + card shadow ("the frame") and the two animated gradient
          orbs are gone — the hero now reads as one calm dark section. */}
      <div
        ref={heroRef}
        className="relative left-1/2 w-screen -translate-x-1/2"
      >
      <MotionReveal
        as="section"
        className="relative overflow-hidden border-b border-white/[0.06] bg-gradient-to-br from-[#0D1812] to-[#13181A]"
      >
        {/* Background layers — a moody, out-of-focus emerald-lit European
            boulevard at dusk, anchored to the bottom, behind a legibility
            scrim, a subtle emerald glow + faint grid (orbs removed).
            Distinct from the /discover hero (night skyline) so the two
            pages don't share the same backdrop. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[url('/hero-photo-2.webp')] bg-cover bg-bottom bg-no-repeat opacity-[0.5]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a130e]/85 via-[#0a130e]/55 to-[#0a130e]/25"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(15,138,75,0.18),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />

        {/* Inner container — keeps hero copy aligned with the 1240px page
            grid while the dark band itself runs edge-to-edge. */}
        <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-5 sm:py-14 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">

          {/* ── Left: copy ── */}
          <div className="relative z-10 flex min-w-0 flex-col justify-center">
            {/* Eyebrow */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent-emerald/30 bg-accent-emerald/[0.12] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-emerald-soft">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent-emerald" />
              {dictionary.homeAtlas.hero.eyebrow}
            </div>

            {/* Headline — word-by-word blur-in.
                RESP.1 — Three-step scale: 2rem (375px), 2.6rem (sm),
                3.6rem (md), 4.4rem (lg). The previous jump from 2.6rem
                → 3.6rem at sm skipped a tier and the headline felt
                cramped on phones; this gives it a smoother ramp. */}
            <h1 className="mt-6 max-w-[16ch] text-[2rem] font-extrabold leading-[0.95] tracking-[-0.05em] text-white sm:text-[2.6rem] sm:leading-[0.9] sm:tracking-[-0.06em] md:text-[3.6rem] lg:text-[4.4rem]">
              {dictionary.homeAtlas.hero.headline.split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={shouldReduce ? false : { opacity: 0, y: 16 }}
                  animate={shouldReduce ? false : { opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 70, damping: 22, delay: i * 0.06 }}
                  style={{ marginRight: "0.25em" }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Subheadline */}
            <p className="mt-5 max-w-[36ch] text-[16px] leading-7 text-white/70 sm:text-[18px]">
              {formatCopy(dictionary.homeAtlas.hero.sub, { country: countryName })}
            </p>

            {/* CTA cluster. Primary: open the catalogue. Secondary: launch
                the Year Builder — the differentiating bet. We give it a
                subtle sparkle dot indicator to nudge curiosity without
                competing for visual weight against the primary action.
                RESP.1 — Stack vertically on mobile so each CTA gets a
                full-width tap target (~343px); side-by-side from sm
                upward where the labels don't wrap. */}
            {/* UX.1 — CTA cluster rewritten in plain language.
                Primary now takes you to /start (the new checkbox-quiz
                onboarding) so "What do you want to do?" actually
                answers itself. Secondary is a low-weight text link
                for the expert who skips the quiz entirely. The old
                "Build my year" button collapsed into the situation
                cards below (Year Builder still exists at /year for
                anyone who wants the long form). */}
            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              {/* FLOW — primary now goes straight to Explore (the offers
                  hub) so visitors reach real offers in one tap. The /start
                  quiz is demoted to a quiet secondary link for people who
                  want to be guided instead of browsing. */}
              <Link
                href={exploreHref}
                className={`${buttonStyles({ variant: "primary", size: "lg" })} hero-primary-cta relative justify-center gap-2 overflow-hidden sm:justify-start`}
              >
                {/* Revolut-style shimmer sweep across the CTA */}
                {!shouldReduce && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.18] to-transparent"
                    initial={{ x: "-120%" }}
                    animate={{ x: "220%" }}
                    transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 5, ease: "linear" }}
                  />
                )}
                {productEntryActionLabel}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href={localePath(locale, "/start")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[14px] font-semibold text-white/60 transition-colors hover:text-white sm:justify-start"
              >
                {dictionary.homeAtlas.hero.cta}
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {/* Trustline */}
            <p className="mt-4 text-[12px] text-white/40">
              {formatCopy(dictionary.homeAtlas.hero.trustLine, { productCount, providerCount })}
            </p>

            {/* Mobile proof strip — the desktop floating cards are hidden
                below lg, which left the mobile hero text-only with dead
                space. This gives phones the same "real offers" proof in a
                native, swipeable row (snap scroll, no absolute overlap). */}
            <div className="-mx-4 mt-8 lg:hidden">
              <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {HERO_CARDS.map((card) => (
                  <div
                    key={`m-${card.key}`}
                    className="w-[200px] shrink-0 snap-start rounded-xl border border-line bg-white p-4 shadow-card"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-extrabold text-white"
                        style={{ backgroundColor: card.bg }}
                      >
                        {card.initials}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em]"
                        style={card.badgeStyle}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${card.dotColor}`} />
                        {heroBadges[card.key] ?? card.badge}
                      </span>
                    </div>
                    <p className="mt-3 truncate text-[10px] text-ink-tertiary">{card.category}</p>
                    <p className="text-[13px] font-bold leading-tight text-ink">{card.provider}</p>
                    <div className="mt-3">
                      <p className="eyebrow-cap">{card.metricLabel}</p>
                      <p className="mt-0.5 text-[1.6rem] font-extrabold leading-none tracking-tight-3 tabular-nums text-ink">
                        {card.metricValue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                // Outer: scroll-driven parallax layer (each card at a different depth)
                <motion.div
                  key={card.key}
                  className={`absolute ${card.posClass}`}
                  style={{ y: parallaxY[card.key] }}
                >
                {/* Inner: float + hover animation */}
                <motion.div
                  className="relative w-[208px] rounded-xl border bg-white p-4 shadow-card"
                  style={{ borderColor: selectedCard === card.key && !shouldReduce ? "rgba(15,138,75,0.5)" : "var(--line-subtle, rgba(17,24,39,0.08))" }}
                  initial={shouldReduce ? false : { rotate: fc.defaultRotate }}
                  animate={
                    shouldReduce ? {} :
                    isHovered
                      ? { y: -12, rotate: 0, scale: 1.05 }
                      : someHovered
                        ? { scale: 0.97, opacity: 0.6, y: 0, rotate: fc.defaultRotate }
                        : { y: [0, -fc.amplitude, 0], rotate: [fc.defaultRotate, fc.defaultRotate, fc.defaultRotate] }
                  }
                  transition={
                    someHovered || isHovered
                      ? { duration: 0.3, ease: "easeOut" }
                      : { duration: fc.period, repeat: Infinity, ease: "easeInOut" }
                  }
                  onMouseEnter={() => setHoveredCard(card.key)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* AI selection ring glow */}
                  {!shouldReduce && selectedCard === card.key && (
                    <motion.div
                      key={`glow-${card.key}`}
                      className="pointer-events-none absolute inset-0 rounded-xl"
                      initial={{ boxShadow: "0 0 0px 0px rgba(15,138,75,0)" }}
                      animate={{ boxShadow: ["0 0 0px 0px rgba(15,138,75,0)", "0 0 20px 4px rgba(15,138,75,0.22)", "0 0 12px 2px rgba(15,138,75,0.14)"] }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  )}
                  {/* "Best fit" badge — appears only on the active selected card */}
                  <AnimatePresence>
                    {!shouldReduce && selectedCard === card.key && (
                      <motion.div
                        key={`bestfit-${card.key}`}
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent-emerald px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_4px_12px_rgba(15,138,75,0.4)]"
                        initial={{ opacity: 0, y: 4, scale: 0.88 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.88 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        ✓ Best fit
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* Badge moved to top-right corner — was previously a pill
                      below the metric value, which on a floating layout put
                      it next to the neighbouring card's logo (the user
                      called this out). Absolute-positioning here means each
                      card carries its own sticker that can't bleed into a
                      sibling card no matter how the floats animate. */}
                  <div
                    className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em]"
                    style={card.badgeStyle}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${card.dotColor}`} />
                    {heroBadges[card.key] ?? card.badge}
                  </div>

                  <div className="flex items-center gap-3 pr-16">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-[11px] font-extrabold text-white"
                      style={{ backgroundColor: card.bg }}
                    >
                      {card.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[10px] text-ink-tertiary">{card.category}</p>
                      <p className="text-[13px] font-bold leading-tight text-ink">{card.provider}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="eyebrow-cap">{card.metricLabel}</p>
                    <p className="mt-1 text-[2.1rem] font-extrabold leading-none tracking-tight-3 tabular-nums text-ink">
                      {SCRAMBLE_CONFIG[card.key]
                        ? <ScrambleNumber {...SCRAMBLE_CONFIG[card.key]} />
                        : card.metricValue}
                    </p>
                  </div>
                </motion.div>
                </motion.div>
              );
            })}

          </div>
        </div>
        </div>
      </MotionReveal>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PROVIDER STRIP
      ══════════════════════════════════════════════════════════ */}
      <ProviderStrip locale={locale} />

      {/* ══════════════════════════════════════════════════════════
          WHAT DO YOU WANT TO DO? — UX.1 new primary nav (situation
          cards in first-person voice). Sits above the AtlasGrid so
          newcomers land on the situation-led grid first; experts
          can still scroll past to browse by product type.
      ══════════════════════════════════════════════════════════ */}
      <WhatDoYouWantToDo locale={locale} />

      {/* ══════════════════════════════════════════════════════════
          ATLAS GRID — browse by product type (for visitors who
          already know what they're looking for).
      ══════════════════════════════════════════════════════════ */}
      <AtlasGrid country={preferences.country} locale={locale} buckets={buckets} />

      {/* ══════════════════════════════════════════════════════════
          APP WAITLIST PILL — moved down out of the top "find what you
          need" path. Savings Spotlight removed here: Top Picks + the
          Atlas grid already cover "here are good options", so three
          stacked offer-proof blocks was redundant and lengthened the
          page. Simplification pass for everyday users.
      ══════════════════════════════════════════════════════════ */}
      <AppWaitlistPill locale={locale} />

      {/* ══════════════════════════════════════════════════════════
          TOP PICKS — Card v2 visuals brought to the homepage. Three
          category-diverse winners picked server-side, rendered with
          the same OfferRowAtlas (ribbons, score bar, glyphs) used in
          the catalogue. Skipped when the country market is empty.
      ══════════════════════════════════════════════════════════ */}
      {topPicks.length > 0 && (
        <TopPicksStrip
          picks={topPicks}
          marketContext={countryMarket}
          locale={locale}
          countryLabel={countryName}
        />
      )}

      {/* ══════════════════════════════════════════════════════════
          TESTIMONIALS — raw centered quote, no card chrome.
          Section only renders when TESTIMONIALS array is non-empty.
          Swap in real user quotes here before going live.
      ══════════════════════════════════════════════════════════ */}
      {TESTIMONIALS.length > 0 && (
        <section className="py-4">
          {TESTIMONIALS.map((t, i) => (
            <MotionReveal
              key={i}
              className="mx-auto max-w-2xl py-8 text-center"
            >
              <blockquote className="text-[1.4rem] font-bold leading-snug tracking-[-0.025em] text-ink sm:text-[1.65rem]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <p className="mt-5 text-[13px] text-ink-tertiary">
                {t.author}
                {t.location ? <span className="ml-2 opacity-60">· {t.location}</span> : null}
              </p>
            </MotionReveal>
          ))}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          WHAT'S NEW — admin-managed highlights feed
      ══════════════════════════════════════════════════════════ */}
      <WhatsNew highlights={highlights} locale={locale} countryName={countryName} />

    </div>
  );
}
