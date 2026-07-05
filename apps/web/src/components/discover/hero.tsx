"use client";

import type { MarketplaceCategory, MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { getOfferHref } from "@/lib/marketplace";
import { localePath } from "@/lib/locale";
import { discoverCopy as t } from "@/copy/discover.en";
import { parseSearch } from "@/lib/discover/parseSearch";
import { ScrambleNumber } from "@/features/home/scramble-number";

const placeholders = [...t.hero.searchPlaceholder];

const quickStart = [...t.hero.quickStart];

function RotatingPlaceholder() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % placeholders.length);
        setVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {placeholders[index]}
    </span>
  );
}

interface DiscoverHeroProps {
  locale: MarketplaceLocale;
  onGoalSelect: (goal: MarketplaceCategory) => void;
  continueOffer?: MarketplaceOffer | null;
  /** Live counts for the proof-tile grid on the right. Pulled from the
   *  real catalogue so the numbers move when the catalogue does — no fudging. */
  productCount: number;
  providerCount: number;
  /** Real count of named markets the country picker offers (DE/ES/IT/FR/UK/
   *  NL/PT) — NOT a marketing "30". Kept as a prop so it can track the config. */
  marketCount?: number;
}

export function DiscoverHero({
  locale,
  onGoalSelect,
  continueOffer,
  productCount,
  providerCount,
  marketCount = 7,
}: DiscoverHeroProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const shouldReduce = useReducedMotion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseSearch(query);
    if (parsed.goal) {
      onGoalSelect(parsed.goal as MarketplaceCategory);
    } else {
      onGoalSelect("transfers");
    }
  };

  // Headline animates in word-by-word so the value prop reads as a beat,
  // not a wall of text. Same pattern as the home hero — repeats the brand
  // voice across both pages so /discover doesn't feel like a different site.
  const headlineWords = t.hero.headline.split(" ");

  // RESP.13 — Was px-6 py-9 (24px gutter) on 375px which stacked
  // with the parent AppShell `p-4` + 24px workspace padding to leave
  // only ~280px content width. Hero now uses px-4 py-6 on mobile
  // so the headline + description + chip row have proper room.
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0D1812] to-[#13181A] px-4 py-6 sm:rounded-[32px] sm:px-10 sm:py-12 lg:px-14 lg:py-16">
      {/* Soft emerald glow + grid background — gives the hero weight without
          paying the cost of a real illustration. Dark-mode recipe: glow is
          brighter against the dark ground and the grid uses white lines. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(15,138,75,0.18),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60" />

      {continueOffer && (
        <Link
          href={localePath(locale, getOfferHref(continueOffer))}
          className="absolute right-6 top-6 z-10 hidden items-center gap-2 rounded-[16px] border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white/80 shadow-subtle backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/15 hover:text-white lg:flex"
        >
          <span className="text-white/50">↩</span>
          <span>
            {t.hero.continueCard.prefix}{" "}
            <strong className="text-white">{continueOffer.providerName}</strong>{" "}
            · {t.hero.continueCard.cta}
          </span>
        </Link>
      )}

      <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
        {/* ── Left: headline + search + chips ── */}
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent-emerald" />
            {t.hero.eyebrow}
          </div>

          <h1 className="mt-5 max-w-[18ch] text-[1.75rem] font-extrabold leading-[1.05] tracking-[-0.035em] text-white sm:text-[2.2rem] sm:leading-[1.02] sm:tracking-[-0.04em] md:text-[2.75rem] lg:text-[3.25rem]">
            {headlineWords.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={shouldReduce ? false : { opacity: 0, filter: "blur(8px)", y: 6 }}
                animate={shouldReduce ? false : { opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.05, ease: "easeOut" }}
                style={{ marginRight: "0.25em" }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-white/70 sm:text-[16px]">
            {t.hero.subhead}
          </p>

          {/* Search input rebuild — the previous flat field read as "label
              + button" rather than "type here". Now:
              • Larger 60px height so it claims the eye like a primary action.
              • Stronger left inset + thicker icon stroke.
              • Inset shadow + emerald focus ring for unambiguous "input"
                affordance.
              • Submit button aligned to the same 44px inner height with
                tighter shadow. */}
          <form onSubmit={handleSubmit} className="mt-7">
            <div className="group/search relative flex items-center rounded-2xl border border-white/20 bg-white/10 shadow-subtle backdrop-blur-sm transition-all focus-within:border-accent-emerald/60 focus-within:shadow-[0_0_0_3px_rgba(15,138,75,0.20)]">
              {/* RESP.13 — Search icon ml-4 on mobile (was ml-5),
                  input py-4 (was py-5), submit button collapses to
                  icon-only on 375px (the "Search" label crowds the
                  input width with the rotating placeholder). Full
                  labelled button returns at sm. */}
              <svg
                className="ml-4 h-5 w-5 shrink-0 text-white/50 transition-colors group-focus-within/search:text-accent-emerald sm:ml-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="8.5" cy="8.5" r="5.5" />
                <path d="M15 15l3 3" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent px-3 py-4 text-[15px] font-medium text-white outline-none placeholder:text-transparent sm:py-5"
                placeholder=" "
                aria-label="Search for a financial product"
              />
              {!query && (
                <span className="pointer-events-none absolute left-[48px] top-1/2 -translate-y-1/2 text-[15px] text-white/40 sm:left-[52px]">
                  <RotatingPlaceholder />
                </span>
              )}
              <button
                type="submit"
                className="mr-1.5 inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-accent-emerald px-3 text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(15,138,75,0.20)] transition-all hover:bg-accent-emerald-strong hover:shadow-[0_6px_14px_rgba(15,138,75,0.28)] sm:h-11 sm:px-5"
                aria-label="Search"
              >
                <span className="hidden sm:inline">Search</span>
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6h7M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>

          {/* RESP.13 — "Or jump in:" chip row: stacked on its own line
              with a horizontal-scrolling chip strip on mobile so all
              chips remain reachable without clipping past the hero
              edge. From sm: returns to the original wrap behaviour. */}
          <div className="mt-4">
            <p className="mb-2 text-sm text-white/50 sm:mb-0 sm:inline">
              {t.hero.quickStartLabel}
            </p>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-0 sm:inline-flex sm:flex-wrap sm:items-center sm:overflow-visible sm:px-0 sm:pl-2 sm:pb-0">
              {quickStart.map((chip) => (
                <button
                  key={chip.goal}
                  type="button"
                  onClick={() => onGoalSelect(chip.goal as MarketplaceCategory)}
                  className="shrink-0 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition-all hover:-translate-y-px hover:border-white/30 hover:bg-white/15 hover:text-white"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: 2×2 proof-tile grid ──
            Tiles surface the four numbers we want the visitor to internalise
            before they scroll. Two of them scramble-animate on mount (the
            same component the home hero uses) so the page feels alive without
            being noisy. Hidden below lg because the headline + search already
            fill the screen on smaller widths. */}
        <div className="relative hidden min-w-0 lg:block">
          <div className="pointer-events-none absolute -inset-x-6 -inset-y-6 rounded-[36px] bg-gradient-to-br from-accent-emerald/12 via-transparent to-transparent" />

          <div className="relative grid grid-cols-2 gap-3">
            <StatTile
              kicker={t.hero.stats.products}
              animatedValue={Math.max(Math.floor(productCount / 50) * 50, 50)}
              suffix="+"
              cacheKey="discover-hero-products"
              delay={0}
              accent
            />
            <StatTile
              kicker={t.hero.stats.providers}
              animatedValue={Math.max(Math.floor(providerCount / 10) * 10, 10)}
              suffix="+"
              cacheKey="discover-hero-providers"
              delay={120}
            />
            <StatTile
              kicker={t.hero.stats.markets}
              staticValue={String(marketCount)}
              delay={240}
            />
            <StatTile
              kicker={t.hero.stats.refresh}
              staticValue="24h"
              caption={t.hero.stats.refreshSub}
              delay={360}
              live
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface StatTileProps {
  kicker: string;
  /** Numeric value that should scramble-animate on mount. */
  animatedValue?: number;
  /** Plain string when the value isn't a count (e.g. "30", "24h"). */
  staticValue?: string;
  /** Tail suffix appended to the number ("+", "%", etc.). */
  suffix?: string;
  /** Sub-label shown below the metric for extra context. */
  caption?: string;
  /** Stagger delay in ms so tiles cascade in instead of popping at once. */
  delay: number;
  /** First tile uses the emerald-soft surface to anchor the eye. */
  accent?: boolean;
  /** Live indicator shows a pulsing dot — used only for the refresh tile. */
  live?: boolean;
  /** Cache key so ScrambleNumber doesn't replay between client navigations. */
  cacheKey?: string;
}

function StatTile({
  kicker,
  animatedValue,
  staticValue,
  suffix,
  caption,
  delay,
  accent,
  live,
  cacheKey,
}: StatTileProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 12 }}
      animate={shouldReduce ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "relative overflow-hidden rounded-[22px] border p-5",
        accent
          ? "border-accent-emerald/40 bg-accent-emerald/15"
          : "border-white/10 bg-white/8",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <p className={[
          "text-[10px] font-semibold uppercase tracking-[0.2em]",
          accent ? "text-accent-emerald" : "text-white/50",
        ].join(" ")}>
          {kicker}
        </p>
        {live && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent-emerald">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-emerald" />
            Live
          </span>
        )}
      </div>

      <p className="mt-2 text-[2.4rem] font-extrabold leading-none tracking-[-0.06em] tabular-nums text-white">
        {animatedValue !== undefined && cacheKey ? (
          <>
            <ScrambleNumber
              value={animatedValue}
              decimals={0}
              suffix=""
              cacheKey={cacheKey}
            />
            {suffix}
          </>
        ) : (
          <>
            {staticValue}
            {suffix}
          </>
        )}
      </p>

      {caption && (
        <p className="mt-2 text-[11px] leading-snug text-white/60">
          {caption}
        </p>
      )}
    </motion.div>
  );
}
