"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import { getDictionary, formatCopy } from "@/lib/i18n";
import { getProviderLogoPath } from "@/features/catalog/provider-logo";

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

interface OfferRowAtlasProps {
  offer: MarketplaceOffer;
  locale: string;
}

export function OfferRowAtlas({ offer, locale }: OfferRowAtlasProps) {
  const shouldReduce = useReducedMotion();
  const dictionary = getDictionary(locale as MarketplaceLocale);
  const t = dictionary.homeAtlas.exploreBucket;

  const isCountryMetric = (label: string) => /countr/i.test(label);
  const visibleMetrics = offer.metrics
    .filter((m) => !isCountryMetric(m.label))
    .slice()
    .sort((a, b) => metricPriority(a.label) - metricPriority(b.label))
    .slice(0, 4);
  const bullets = offer.bullets?.filter(Boolean).slice(0, 3) ?? [];
  const firstBestFor = offer.bestFor?.[0];
  const logoPath = getProviderLogoPath(offer.providerName);
  const href = offer.affiliateLink || offer.providerWebsiteUrl;

  return (
    <motion.div
      className="w-full overflow-hidden rounded-2xl border bg-white"
      variants={shouldReduce ? undefined : rowVariants}
      initial={shouldReduce ? undefined : "rest"}
      whileHover={shouldReduce ? undefined : "hover"}
      whileTap={shouldReduce ? undefined : { scale: 0.995 }}
      transition={{ type: "tween", duration: 0.15 }}
    >
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
            <p className="mt-0.5 truncate text-[12px] text-ink-tertiary">
              {offer.providerName} · {offer.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </p>
            {firstBestFor && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-accent-emerald-soft px-2 py-0.5 text-[10px] font-semibold text-accent-emerald-strong">
                <span className="h-1 w-1 rounded-full bg-accent-emerald" />
                {formatCopy(t.bestFor, { audience: firstBestFor })}
              </div>
            )}
          </div>
        </div>

        {/* Metrics + bullets — center, visible md+ */}
        {(visibleMetrics.length > 0 || bullets.length > 0) && (
          <div className="hidden min-w-0 flex-1 items-center gap-4 md:flex lg:gap-6">
            {visibleMetrics.map((m) => (
              <div key={m.label} className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">{m.label}</p>
                <p className="mt-0.5 text-[14px] font-bold tabular-nums leading-tight text-ink">{m.value}</p>
              </div>
            ))}
            {bullets.length > 0 && (
              <ul className="grid min-w-0 flex-1 gap-0.5">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-1.5 truncate text-[11px] text-ink-secondary">
                    <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-emerald" />
                    <span className="truncate">{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* CTA — right, fixed */}
        <div className="shrink-0">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center gap-1.5 rounded-xl bg-accent-emerald px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-accent-emerald-strong sm:px-5 sm:py-2.5 sm:text-[14px]"
          >
            <span className="hidden sm:inline">{t.goToProvider}</span>
            <span className="sm:hidden">Go</span>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      {/* Mobile section — metrics + bullets, visible below md */}
      {(visibleMetrics.length > 0 || bullets.length > 0) && (
        <div className="border-t border-line px-4 py-3 md:hidden">
          {visibleMetrics.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {visibleMetrics.map((m) => (
                <div key={m.label}>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">{m.label}</p>
                  <p className="mt-0.5 text-[13px] font-bold tabular-nums text-ink">{m.value}</p>
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
