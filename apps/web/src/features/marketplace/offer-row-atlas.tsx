"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import { getDictionary, formatCopy } from "@/lib/i18n";
import { getProviderLogoPath } from "@/features/catalog/provider-logo";
import { localePath } from "@/lib/locale";
import { getOfferHref } from "@/lib/marketplace";
import { SaveOfferButton } from "@/components/save-offer-button";
import {
  rankOffer,
  type MetricRank,
} from "@/features/marketplace/offer-ranking";
import { extractOfferCurrency } from "@/features/marketplace/offer-currency";

const rowVariants = {
  rest:  { y: 0,  borderColor: "rgba(17,24,39,0.08)" },
  hover: { y: -1, borderColor: "rgba(16,185,129,0.4)" },
};

// Canonical metric ordering — when offers in the same category emit metrics
// in different orders (one shows "Monthly fee" first, another "SEPA transfers"
// first), the card row reads inconsistently. This priority list sorts each
// offer's visibleMetrics into a stable display order so the eye scans them
// the same way across a list. Lower number = higher priority. Anything not
// matched lands at the end in original (data) order. Match is case-insensitive
// against the leading word/phrase of the metric label.
const METRIC_PRIORITY: ReadonlyArray<[RegExp, number]> = [
  [/^monthly\s*(fee|premium)/i, 10],
  [/^annual\s*fee/i, 11],
  [/^fee\b/i, 12],
  [/^(fx|foreign)\b/i, 20],
  [/^spread/i, 21],
  [/^conversion/i, 22],
  [/^(transfer|sepa)\b/i, 30],
  [/^speed/i, 31],
  [/^corridor/i, 32],
  [/^(apr|interest)/i, 40],
  [/^cashback/i, 41],
  [/^(amount|insured)/i, 50],
  [/^term/i, 51],
  [/^min(imum)?\b/i, 52],
  [/^(currencies|currencies?)\b/i, 60],
  [/^atm/i, 70],
  [/^(cards|sub-ibans|access)/i, 80],
  [/^deposit\s*protection/i, 90],
  [/^region/i, 91],
  [/^assets/i, 92],
];

function metricPriority(label: string): number {
  for (const [pattern, weight] of METRIC_PRIORITY) {
    if (pattern.test(label)) return weight;
  }
  return 999;
}

// Region/internal-status labels don't belong on the "Best for X" pill — the
// country picker already filters by region, and statuses like "Needs review"
// are admin terms that leak when a curator forgets a real audience. Strip
// these so we surface only a benefit-based or audience-based bestFor.
const REGION_OR_STATUS_BESTFOR = /^(France|Germany|Italy|Spain|Portugal|Netherlands|UK|EU[\s-]?wide|EU\b|All Europe|Needs review)\b/i;

function pickPrimaryBestFor(values: string[] | undefined): string | undefined {
  if (!values || values.length === 0) return undefined;
  const meaningful = values.find((v) => !REGION_OR_STATUS_BESTFOR.test(v));
  return meaningful ?? values[0];
}

// ─── Per-metric comparative glyph ─────────────────────────────────────────────
//
// Tiny indicator under each metric value telling the user how this offer
// stacks up against the others in the visible list. Colors come from design
// tokens (emerald = win, ink-tertiary = neutral, amber = below average).
const RANK_GLYPH: Record<MetricRank, { label: string; cls: string } | null> = {
  best:    { label: "↓ best",       cls: "text-accent-emerald-strong" },
  good:    { label: "↓ good",       cls: "text-accent-emerald-strong" },
  avg:     { label: "─ avg",        cls: "text-ink-tertiary" },
  worst:   { label: "↑ above avg",  cls: "text-amber-600" },
  unknown: null,
};

function MetricRankGlyph({ rank }: { rank: MetricRank }) {
  const meta = RANK_GLYPH[rank];
  if (!meta) return null;
  return (
    <span
      className={`inline-block text-[9px] font-semibold uppercase tracking-[0.14em] ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}

// Reserved-height slot for the metric rank glyph. Renders the glyph when
// the rank exists, an empty placeholder of the same height when it
// doesn't — so a row of metrics where only some columns rank doesn't
// pull adjacent cells up by 12px. Killed the "rippled labels" effect
// the user flagged on the catalogue.
function MetricRankSlot({ rank }: { rank: MetricRank | undefined }) {
  return (
    <div className="mt-0.5 h-[13px] leading-none">
      {rank ? <MetricRankGlyph rank={rank} /> : null}
    </div>
  );
}

// ─── Award ribbon ─────────────────────────────────────────────────────────────
//
// Absolute-positioned top-right ribbon when this offer is the outright winner
// on a high-value metric. Folded-corner SVG so it reads as an award, not just
// another tag.
function AwardRibbon({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent-emerald to-[#10B981] px-3 py-1 shadow-[0_4px_12px_rgba(15,138,75,0.22)]">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path
          d="M5 0.5l1.2 2.5 2.8.4-2 2 .5 2.8L5 6.9 2.5 8.2l.5-2.8-2-2 2.8-.4L5 .5z"
          fill="white"
        />
      </svg>
      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white">
        {label}
      </span>
    </div>
  );
}

// ─── Score visual REMOVED (P0 trust + compliance fix) ─────────────────────────
//
// The previous 0-100 "Payn score" bar was kicked out: a composite financial
// score reads as advisory under EBA/MiCA guidance on product comparison.
// Even with a "verified" checkmark it's a regulator-pleaser, not a
// regulator-clearer.
//
// Card now leans entirely on objective signals the ranking helper already
// emits:
//   • award ribbon (top-right) — one factual win per offer ("Lowest FX")
//   • per-metric comparative glyphs ("↓ best in market") under each value
// Both are FACTUAL statements about a typed attribute relative to the full
// category market. No composite, no opinion, no number-out-of-100.

interface OfferRowAtlasProps {
  offer: MarketplaceOffer;
  locale: string;
  /** Full category market context — MUST be the unfiltered set of offers in
   *  the same category (e.g. all 28 cards if this row is a card), not the
   *  filtered visible list. The score, comparative glyphs, and award ribbon
   *  all rank against this set, so passing a filtered list will produce
   *  meaningless "best of 3" results. Omit to disable v2 visuals entirely. */
  marketContext?: MarketplaceOffer[];
  /** ISO 4217 currency code that matches the user's market (e.g. "EUR"
   *  for an FR viewer). When the offer's own pricing is in a different
   *  currency we render a small amber pill so the difference doesn't get
   *  lost in the column. Omit to suppress the badge. */
  baseCurrency?: string;
  /** True when this offer is in the parent workspace's compare selection.
   *  When omitted, the Compare toggle isn't rendered at all (used for
   *  surfaces like /explore/<bucket> that don't have a compare table). */
  compareSelected?: boolean;
  /** Toggles this offer in/out of the compare drawer. Pair with
   *  `compareSelected`. */
  onToggleCompare?: () => void;
}

export function OfferRowAtlas({
  offer,
  locale,
  marketContext,
  baseCurrency,
  compareSelected,
  onToggleCompare,
}: OfferRowAtlasProps) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const dictionary = getDictionary(locale as MarketplaceLocale);
  const t = dictionary.homeAtlas.exploreBucket;

  // Per-category CTA label (FIX-05 from UX audit) — "Open account" for
  // banking/savings, "Check my rate" for loans, "Get quote" for insurance,
  // etc. Falls back to the generic "Go to provider" if the category somehow
  // isn't in the map.
  const ctaLabel =
    dictionary.offerCard.providerCta[offer.category] ?? t.goToProvider;

  const isCountryMetric = (label: string) => /countr/i.test(label);
  const visibleMetrics = offer.metrics
    .filter((m) => !isCountryMetric(m.label))
    .slice()
    .sort((a, b) => metricPriority(a.label) - metricPriority(b.label))
    .slice(0, 4);
  const bullets = offer.bullets?.filter(Boolean).slice(0, 3) ?? [];
  const firstBestFor = pickPrimaryBestFor(offer.bestFor);
  const logoPath = getProviderLogoPath(offer.providerName);
  const href = offer.affiliateLink || offer.providerWebsiteUrl;
  const detailHref = localePath(locale as MarketplaceLocale, getOfferHref(offer));

  // Ranking only runs when the parent passes the category market. Memoised
  // so a re-render from hover state doesn't re-walk the whole category each
  // time. Score, glyphs, and award all compare against this full market —
  // never against the filtered visible list.
  const ranking = useMemo(
    () => (marketContext && marketContext.length > 1 ? rankOffer(offer, marketContext) : null),
    [offer, marketContext],
  );
  // segments calc removed — score bar no longer rendered.

  // Currency badge — flags offers priced outside the user's market. We
  // only render when both sides of the comparison are known and they
  // disagree (e.g. USD-priced policy shown to a FR user where base is
  // EUR). Suppressed when baseCurrency wasn't passed so older callers
  // don't get a silent visual change.
  const offerCurrency = extractOfferCurrency(offer);
  const showCurrencyBadge =
    Boolean(baseCurrency) &&
    offerCurrency !== null &&
    offerCurrency !== baseCurrency;

  // Card-body click → /offers/<slug> (retention loop). The right-side CTA stays
  // an <a target="_blank"> so the affiliate link keeps its tab/right-click/menu
  // affordances and stopPropagation on its onClick prevents the row's navigation
  // from firing too. Using onClick + role/keyboard on the wrapper instead of a
  // nested <Link> avoids the HTML rule against nested anchors.
  const navigateToDetail = () => router.push(detailHref);

  return (
    <motion.div
      role="link"
      tabIndex={0}
      aria-label={`${offer.providerName} — ${offer.title}`}
      onClick={navigateToDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigateToDetail();
        }
      }}
      className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-emerald focus-visible:ring-offset-2"
      variants={shouldReduce ? undefined : rowVariants}
      initial={shouldReduce ? undefined : "rest"}
      whileHover={shouldReduce ? undefined : "hover"}
      // Tactile press feedback (M3 from the audit) — iOS-style "give" on
      // tap that makes every interactive surface feel native.
      whileTap={shouldReduce ? undefined : { scale: 0.995 }}
      transition={{ type: "tween", duration: 0.15 }}
    >
      {ranking?.award && <AwardRibbon label={ranking.award} />}

      <div className="flex items-center gap-4 p-4 sm:gap-6 sm:p-5">
        {/* Logo + Title — left. Width steps up at md/lg so long names like
            "Société Générale Compte Courant" or "BNP Paribas Personal Loan"
            don't get clipped on mid-size desktops. Title also wraps to 2 lines
            and uses native title attribute as fallback tooltip. */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-[0_0_280px] sm:gap-4 lg:flex-[0_0_320px]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-accent-emerald-soft">
            {logoPath ? (
              <Image
                src={logoPath}
                alt={offer.providerName}
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
            ) : (
              <span className="text-[13px] font-extrabold text-accent-emerald-strong">
                {offer.providerMark.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p
              className="line-clamp-2 text-[15px] font-bold leading-tight text-ink"
              title={offer.title}
            >
              {offer.title}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <p className="truncate text-[12px] text-ink-tertiary">
                {offer.providerName} · {offer.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
              {showCurrencyBadge && (
                <span
                  className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-bold tracking-wide text-amber-800"
                  title={`Priced in ${offerCurrency}, not ${baseCurrency}`}
                >
                  {offerCurrency}
                </span>
              )}
            </div>
            {firstBestFor && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-accent-emerald-soft px-2 py-0.5 text-[10px] font-semibold text-accent-emerald-strong">
                <span className="h-1 w-1 rounded-full bg-accent-emerald" />
                {formatCopy(t.bestFor, { audience: firstBestFor })}
              </div>
            )}
          </div>
        </div>

        {/* Metrics + bullets — center, visible md+.
            Locked grid: every metric column is now a flex item with a
            fixed 112px basis and a 144px ceiling, so when one offer has
            "FX FEE (WEEKDAY)" and the next has "FX FEE", the value rows
            still line up across stacked offers (the user called this out).
            Labels truncate with a native title tooltip rather than wrap
            into a second line that pushes value baselines down. */}
        {(visibleMetrics.length > 0 || bullets.length > 0) && (
          <div className="hidden min-w-0 flex-1 items-center gap-4 md:flex lg:gap-6">
            {visibleMetrics.map((m) => (
              <div
                key={m.label}
                className="flex min-w-0 flex-1 basis-[112px] flex-col"
                style={{ maxWidth: 144 }}
              >
                <p
                  className="truncate text-[11px] font-medium text-ink-tertiary"
                  title={m.label}
                >
                  {m.label}
                </p>
                <p className="mt-0.5 truncate text-[17px] font-extrabold tabular-nums leading-tight tracking-tight-1 text-ink">
                  {m.value}
                </p>
                <MetricRankSlot rank={ranking?.metricRanks[m.label]} />
              </div>
            ))}
            {bullets.length > 0 && ranking === null && (
              <ul className="grid min-w-0 flex-1 gap-0.5">
                {bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-1.5 text-[11px] text-ink-secondary"
                    title={b}
                  >
                    <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-emerald" />
                    {/* line-clamp-2 + title tooltip kills the "worldwi..."
                        single-line cut the user flagged on the catalogue. */}
                    <span className="line-clamp-2">{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {/* Score bar removed (P0 compliance fix). Award ribbon and
                per-metric glyphs carry the ranking signal without a
                composite "X/100" that reads as advice. */}
          </div>
        )}

        {/* CTA — right, fixed. Save + Compare icons fade in on row hover
            so the resting state stays clean. stopPropagation on both
            onClick handlers keeps the row's body-click handler from firing
            when the user actually wants the inner action.

            Compare icon is rendered only when the parent provides
            `onToggleCompare` — workspaces with a compare table (dashboards)
            wire it; surfaces without one (e.g. /explore/<bucket>) don't. */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 data-[compare-active=true]:opacity-100 sm:flex"
               data-compare-active={compareSelected ? "true" : "false"}>
            {onToggleCompare && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleCompare();
                }}
                aria-pressed={Boolean(compareSelected)}
                title={compareSelected ? "Remove from compare" : "Add to compare"}
                className={[
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all",
                  compareSelected
                    ? "border-accent-emerald/40 bg-accent-emerald-soft text-accent-emerald-strong"
                    : "border-line bg-white text-ink-tertiary hover:border-accent-emerald/40 hover:text-accent-emerald-strong",
                ].join(" ")}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 4.5h8L8 2.5M12 9.5H4L6 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <SaveOfferButton
              offer={offer}
              mode="icon"
              stopPropagation
            />
          </div>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={(event) => event.stopPropagation()}
            // Explicit height (h-10 = 40px on sm+, h-9 = 36px on mobile)
            // so icon and text share a deterministic vertical centre —
            // fixes the "arrow slides off baseline" the user spotted.
            // strokeWidth standardised to 2 (was 1.8) — matches all other
            // action arrows on the page.
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-accent-emerald px-4 text-[13px] font-semibold leading-none text-white shadow-[0_4px_10px_rgba(15,138,75,0.20)] transition-all hover:bg-accent-emerald-strong hover:shadow-[0_6px_14px_rgba(15,138,75,0.28)] active:scale-[0.98] sm:h-10 sm:px-5 sm:text-[14px]"
          >
            <span className="hidden sm:inline">{ctaLabel}</span>
            <span className="sm:hidden">Go</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      {/* Mobile section — metrics + bullets, visible below md. Score bar is
          desktop-only so the mobile row stays compact; we still surface the
          comparative glyphs under each metric value for parity. */}
      {(visibleMetrics.length > 0 || bullets.length > 0) && (
        <div className="border-t border-line px-4 py-3 md:hidden">
          {visibleMetrics.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {visibleMetrics.map((m) => (
                <div key={m.label}>
                  <p className="text-[11px] font-medium text-ink-tertiary">
                    {m.label}
                  </p>
                  <p className="mt-0.5 text-[15px] font-bold tabular-nums text-ink">{m.value}</p>
                  <MetricRankSlot rank={ranking?.metricRanks[m.label]} />
                </div>
              ))}
            </div>
          )}
          {bullets.length > 0 && (
            <ul className={`grid gap-1 ${visibleMetrics.length > 0 ? "mt-3" : ""}`}>
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[11px] text-ink-secondary">
                  <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-emerald" />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </motion.div>
  );
}
