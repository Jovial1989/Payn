"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { MarketplaceOffer } from "@payn/types";
import type { MarketplaceLocale } from "@payn/types";
import { getDictionary, formatCopy } from "@/lib/i18n";
import { getProviderLogoPath } from "@/features/catalog/provider-logo";

// ─── Motion variants ──────────────────────────────────────────────────────────
const cardVariants = {
  rest: {
    y: 0,
    boxShadow: "0 1px 3px rgba(15,23,32,0.06)",
    borderColor: "rgba(17,24,39,0.08)",
  },
  hover: {
    y: -3,
    boxShadow: "0 8px 24px -8px rgba(16,185,129,0.20)",
    borderColor: "#10B981",
  },
};

const logoVariants = {
  rest:  { scale: 1 },
  hover: { scale: 1.05 },
};

// ─── Logo box ─────────────────────────────────────────────────────────────────
function ProviderLogo({ providerName, providerMark }: { providerName: string; providerMark: string }) {
  const logoPath = getProviderLogoPath(providerName);

  return (
    <motion.div
      variants={logoVariants}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-accent-emerald-soft"
    >
      {logoPath ? (
        <Image
          src={logoPath}
          alt={providerName}
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      ) : (
        <span className="text-[13px] font-extrabold text-accent-emerald-strong">
          {providerMark.slice(0, 2).toUpperCase()}
        </span>
      )}
    </motion.div>
  );
}

// ─── Metric pair ──────────────────────────────────────────────────────────────
function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">{label}</p>
      <p className="mt-0.5 text-[16px] font-bold tabular-nums leading-tight text-ink">{value}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface OfferCardAtlasProps {
  offer: MarketplaceOffer;
  locale: string;
}

export function OfferCardAtlas({ offer, locale }: OfferCardAtlasProps) {
  const shouldReduce = useReducedMotion();
  const dictionary = getDictionary(locale as MarketplaceLocale);
  const t = dictionary.homeAtlas.exploreBucket;

  const isCountryMetric = (label: string) => /countr/i.test(label);
  const visibleMetrics = offer.metrics.filter((m) => !isCountryMetric(m.label)).slice(0, 4);
  const bullets = offer.bullets?.filter(Boolean).slice(0, 4) ?? [];
  const firstBestFor = offer.bestFor?.[0];

  const href = offer.affiliateLink || offer.providerWebsiteUrl;

  return (
    <motion.div
      className="flex flex-col rounded-2xl border bg-white"
      variants={shouldReduce ? undefined : cardVariants}
      initial={shouldReduce ? undefined : "rest"}
      whileHover={shouldReduce ? undefined : "hover"}
      whileTap={shouldReduce ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex flex-1 flex-col p-5">
        {/* Header: logo + title + subtitle */}
        <div className="flex items-start gap-3">
          <ProviderLogo providerName={offer.providerName} providerMark={offer.providerMark} />
          <div className="min-w-0 pt-0.5">
            <p className="truncate text-[16px] font-bold leading-tight text-ink">{offer.title}</p>
            <p className="mt-0.5 truncate text-[12px] text-ink-tertiary">
              {offer.providerName} · {offer.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-line" />

        {/* Best for pill */}
        {firstBestFor && (
          <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-emerald-soft px-2.5 py-1 text-[10px] font-semibold text-accent-emerald-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald" />
            {formatCopy(t.bestFor, { audience: firstBestFor })}
          </div>
        )}

        {/* Bullets */}
        {bullets.length > 0 && (
          <ul className="mb-3 grid gap-1">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-[12px] text-ink-secondary">
                <span className="mt-[4px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-emerald" />
                {b}
              </li>
            ))}
          </ul>
        )}

        {/* Metrics grid */}
        {visibleMetrics.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {visibleMetrics.map((m) => (
              <MetricCell key={m.label} label={m.label} value={m.value} />
            ))}
          </div>
        )}
      </div>

      {/* CTA — pinned to bottom */}
      <div className="px-5 pb-5">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent-emerald py-2.5 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-accent-emerald-strong"
        >
          {t.goToProvider}
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}
