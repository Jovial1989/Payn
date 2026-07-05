"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { MarketplaceOffer, MarketplaceLocale } from "@payn/types";
import {
  rankOffer,
  type MetricRank,
} from "@/features/marketplace/offer-ranking";
import { getMetricLabel } from "@/lib/i18n";
import { normalizeDisplayText } from "@/lib/marketplace";

// ─── PdpDeepDive ───────────────────────────────────────────────────────────────
//
// Five progressive-disclosure sections that replace the previous single
// "Things to watch" paragraph. Each accordion answers one trust question:
//
//   1. Pricing & fees       — every metric, fully visible, with rank glyphs
//   2. What's included      — feature bullets as a check-list
//   3. What's NOT included  — generated from worst-ranking metrics + caveats
//   4. Eligibility          — country, audience, application path
//   5. Editor's note        — Payn's take, sourced from existing tradeoff data
//
// The "What's NOT included" section is the trust earner — competitors hide
// weaknesses, we surface them. The data is computed by walking the offer's
// metric ranks against the full category market: metrics where this offer
// ranks "worst" (bottom third) are surfaced as concrete weaknesses with
// the comparison spelt out.

interface PdpDeepDiveProps {
  offer: MarketplaceOffer;
  categoryMarket: MarketplaceOffer[];
  locale: MarketplaceLocale;
  tradeoffText: string;
  editorialContext: {
    /** "credit card", "loan", "savings account" etc. — used for the
     *  "what's NOT" copy so it reads naturally. */
    categoryNoun: string;
  };
}

export function PdpDeepDive({
  offer,
  categoryMarket,
  locale,
  tradeoffText,
  editorialContext,
}: PdpDeepDiveProps) {
  const sameCategory = categoryMarket.filter((o) => o.category === offer.category);
  const ranking =
    sameCategory.length >= 2 ? rankOffer(offer, sameCategory) : null;

  // Pre-compute the weaknesses array once so the accordion body doesn't
  // recompute on every open/close.
  const weaknesses = computeWeaknesses(offer, ranking?.metricRanks);

  return (
    <section className="rounded-[24px] border border-line bg-white p-4 shadow-subtle sm:rounded-3xl sm:p-8">
      <div className="mb-5 max-w-prose-base">
        <p className="eyebrow-cap">Everything you should know</p>
        <h2 className="display-lead mt-2 text-[1.5rem] sm:text-[1.75rem]">
          The full picture, no fine print games.
        </h2>
      </div>

      <div className="divide-y divide-line">
        <Accordion
          title="Pricing & fees"
          defaultOpen
          subtitle={`${offer.metrics.length} ${offer.metrics.length === 1 ? "metric" : "metrics"}`}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offer.metrics.map((m) => {
              const rank = ranking?.metricRanks[m.label];
              return (
                <div
                  key={m.label}
                  className="rounded-2xl border border-line bg-bg-surface p-4"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                    {normalizeDisplayText(getMetricLabel(locale, m.label))}
                  </p>
                  <p className="mt-1 text-[18px] font-extrabold tabular-nums tracking-tight-2 text-ink">
                    {normalizeDisplayText(m.value)}
                  </p>
                  {rank && <RankGlyph rank={rank} />}
                </div>
              );
            })}
          </div>
        </Accordion>

        {offer.bullets && offer.bullets.length > 0 && (
          <Accordion
            title="What you get"
            subtitle={`${offer.bullets.length} ${offer.bullets.length === 1 ? "feature" : "features"}`}
          >
            <ul className="grid gap-2.5">
              {offer.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-emerald-soft text-accent-emerald-strong">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2.5 6.2L4.6 8 9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <p className="text-[14px] leading-relaxed text-ink">{b}</p>
                </li>
              ))}
            </ul>
          </Accordion>
        )}

        {weaknesses.length > 0 && (
          <Accordion
            title="Things to watch"
            subtitle={`${weaknesses.length} ${weaknesses.length === 1 ? "caveat" : "caveats"} we found`}
          >
            <ul className="grid gap-2.5">
              {weaknesses.map((w) => (
                <li key={w.label} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M6 3v3.5M6 8.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                  <p className="text-[14px] leading-relaxed text-ink">
                    <strong className="font-semibold text-ink">{w.label}</strong>
                    <span className="text-ink-secondary"> — {w.body}</span>
                  </p>
                </li>
              ))}
              {tradeoffText && (
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M6 3v3.5M6 8.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                  <p className="text-[14px] leading-relaxed text-ink-secondary">
                    {tradeoffText}
                  </p>
                </li>
              )}
            </ul>
          </Accordion>
        )}

        <Accordion
          title="Who can apply"
          subtitle={readableMarkets(offer)}
        >
          <EligibilityBody offer={offer} categoryNoun={editorialContext.categoryNoun} />
        </Accordion>

        <Accordion title="Editor's note" subtitle="Payn's take">
          <EditorialBody
            offer={offer}
            ranking={ranking}
            categoryNoun={editorialContext.categoryNoun}
            tradeoffText={tradeoffText}
          />
        </Accordion>
      </div>
    </section>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────────────
function Accordion({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="py-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold tracking-tight-1 text-ink">{title}</p>
          {subtitle && (
            <p className="mt-0.5 text-[12px] text-ink-tertiary">{subtitle}</p>
          )}
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-tertiary transition-colors group-hover:border-accent-emerald/40 group-hover:text-accent-emerald-strong"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RankGlyph({ rank }: { rank: MetricRank }) {
  const meta: Record<MetricRank, { label: string; cls: string } | null> = {
    best:    { label: "↓ best in class", cls: "text-accent-emerald-strong" },
    good:    { label: "↓ better than most", cls: "text-accent-emerald-strong" },
    avg:     { label: "─ average",          cls: "text-ink-tertiary" },
    worst:   { label: "↑ above average",    cls: "text-amber-600" },
    unknown: null,
  };
  const m = meta[rank];
  if (!m) return null;
  return (
    <p className={`mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${m.cls}`}>
      {m.label}
    </p>
  );
}

function EligibilityBody({
  offer,
  categoryNoun,
}: {
  offer: MarketplaceOffer;
  categoryNoun: string;
}) {
  return (
    <div className="grid gap-3 text-[14px] leading-relaxed text-ink-secondary">
      <div className="flex items-start gap-3">
        <Bullet />
        <p>
          <strong className="font-semibold text-ink">Available in: </strong>
          {readableMarkets(offer)}
        </p>
      </div>
      {offer.bestFor && offer.bestFor.length > 0 && (
        <div className="flex items-start gap-3">
          <Bullet />
          <p>
            <strong className="font-semibold text-ink">Best fit for: </strong>
            {offer.bestFor.slice(0, 4).join(" · ")}
          </p>
        </div>
      )}
      <div className="flex items-start gap-3">
        <Bullet />
        <p>
          <strong className="font-semibold text-ink">Application path: </strong>
          {offer.linkType === "lead_capture"
            ? `Payn captures basic info, then forwards to ${offer.providerName}.`
            : offer.linkType === "embedded_partner"
              ? `Apply directly inside Payn.`
              : `You'll be sent to ${offer.providerName} to complete the ${categoryNoun} application.`}
        </p>
      </div>
    </div>
  );
}

function EditorialBody({
  offer,
  ranking,
  categoryNoun,
  tradeoffText,
}: {
  offer: MarketplaceOffer;
  ranking: ReturnType<typeof rankOffer> | null;
  categoryNoun: string;
  tradeoffText: string;
}) {
  // Compose a short "editor's note" from real signals. When the offer
  // earned an award (e.g. "Top cashback") we lead with it; otherwise we
  // surface the audience tag. Always close with the tradeoff text so the
  // user gets one balanced sentence in addition to the data above.
  const lead = ranking?.award
    ? `Payn flagged this ${categoryNoun} as ${ranking.award.toLowerCase()} in the current ${offer.category} market.`
    : offer.bestFor && offer.bestFor[0]
      ? `Best fit when your situation matches "${offer.bestFor[0].toLowerCase()}".`
      : `A standard option in the ${offer.category} category — nothing flashy, no obvious red flags.`;

  return (
    <div className="grid gap-3 text-[14px] leading-relaxed text-ink-secondary">
      <p>{lead}</p>
      {tradeoffText && <p>{tradeoffText}</p>}
      <p className="text-[12px] text-ink-tertiary">
        Last verified {new Date(offer.updatedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
        . We re-check provider terms at least monthly; live rates update daily.
      </p>
    </div>
  );
}

function Bullet() {
  return (
    <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-emerald" />
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
interface Weakness {
  label: string;
  body: string;
}

// Worst-ranking metrics get surfaced as honest weaknesses so the user
// sees what every other comparison site hides. Only metrics with a "worst"
// rank against the full market trigger — average-ranking metrics aren't
// weaknesses worth flagging.
function computeWeaknesses(
  offer: MarketplaceOffer,
  metricRanks: Record<string, MetricRank> | undefined,
): Weakness[] {
  if (!metricRanks) return [];
  const items: Weakness[] = [];
  for (const metric of offer.metrics) {
    if (metricRanks[metric.label] === "worst") {
      items.push({
        label: metric.label,
        body: `at ${metric.value} — sits in the bottom third of the market.`,
      });
    }
  }
  // Cap at 3 so the panel doesn't become a wall of red flags.
  return items.slice(0, 3);
}

const COUNTRY_NAMES: Record<string, string> = {
  AT: "Austria", BE: "Belgium", BG: "Bulgaria", CH: "Switzerland",
  CY: "Cyprus",  CZ: "Czechia", DE: "Germany",  DK: "Denmark",
  EE: "Estonia", ES: "Spain",   FI: "Finland",  FR: "France",
  GR: "Greece",  HR: "Croatia", HU: "Hungary",  IE: "Ireland",
  IS: "Iceland", IT: "Italy",   LT: "Lithuania", LU: "Luxembourg",
  LV: "Latvia",  MT: "Malta",   NL: "Netherlands", NO: "Norway",
  PL: "Poland",  PT: "Portugal", RO: "Romania",
  SE: "Sweden",  SI: "Slovenia", SK: "Slovakia",
  UK: "United Kingdom", GB: "United Kingdom",
};

function readableMarkets(offer: MarketplaceOffer): string {
  const codes = offer.countryCodes.map((c) => c.toUpperCase());
  if (codes.includes("EU") || codes.includes("ALL")) return "EU & EEA";
  if (codes.length === 0) return "Check with provider";
  const names = codes.slice(0, 6).map((c) => COUNTRY_NAMES[c] ?? c);
  const more = codes.length - names.length;
  return more > 0 ? `${names.join(", ")} + ${more} more` : names.join(", ");
}
