"use client";

import clsx from "clsx";
import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { ProviderLogo } from "@/components/provider-logo";
import { SaveOfferButton } from "@/components/save-offer-button";
import { Tag } from "@/components/tag";
import { getDictionary, translateUiToken } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import { getOfferHref, normalizeDisplayText } from "@/lib/marketplace";

type DecisionResultTagTone =
  | "neutral"
  | "accent"
  | "muted"
  | "success"
  | "blue"
  | "purple"
  | "orange";

export type DecisionResultMetric = {
  label: string;
  value: string;
};

export type DecisionResultTag = {
  label: string;
  tone?: DecisionResultTagTone;
};

export function DecisionResultRow({
  locale,
  offer,
  rank,
  summary,
  primaryLabel,
  primaryValue,
  metrics,
  tags,
  why,
  detailsLabel,
  providerLabel,
  highlighted = false,
  extraActions,
}: {
  locale: MarketplaceLocale;
  offer: MarketplaceOffer;
  rank: number;
  summary: string;
  primaryLabel: string;
  primaryValue: string;
  metrics: DecisionResultMetric[];
  tags: DecisionResultTag[];
  why?: string;
  detailsLabel?: string;
  providerLabel?: string;
  highlighted?: boolean;
  extraActions?: React.ReactNode;
}) {
  const dictionary = getDictionary(locale);
  const resolvedDetailsLabel = detailsLabel ?? dictionary.offerCard.reviewOffer;
  const resolvedProviderLabel = providerLabel ?? dictionary.offerCard.providerSite;
  const whyPrefix = locale === "de" ? `Warum auf Platz ${rank}:` : `Why this is #${rank}:`;

  return (
    <article
      className={`group rounded-[20px] bg-white p-5 shadow-[0_2px_10px_rgba(17,24,39,0.05)] transition-all duration-200 hover:shadow-[0_8px_28px_rgba(17,24,39,0.09)] active:scale-[0.997] sm:p-6 ${
        highlighted ? "" : "opacity-95"
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Rank */}
        <span className="mt-1 w-7 shrink-0 text-[13px] font-semibold tabular-nums text-ink-tertiary">
          #{rank}
        </span>

        <div className="min-w-0 flex-1">
          {/* Header: logo + name/title + primary value */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <ProviderLogo providerName={offer.providerName} size="sm" />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-ink-tertiary">{offer.providerName}</p>
                <Link
                  href={localePath(locale, getOfferHref(offer))}
                  className="mt-0.5 block line-clamp-2 text-[15px] font-bold leading-snug tracking-[-0.025em] text-ink transition-colors hover:text-accent-emerald-strong"
                >
                  {offer.title}
                </Link>
              </div>
            </div>

            {/* Primary metric — inline, no box */}
            <div className="shrink-0 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                {normalizeDisplayText(primaryLabel)}
              </p>
              <p className="mt-1 text-[1.7rem] font-extrabold leading-none tracking-[-0.04em] text-ink tabular-nums">
                {normalizeDisplayText(primaryValue)}
              </p>
            </div>
          </div>

          {/* Tags — max 2, all neutral */}
          {tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.slice(0, 2).map((tag) => (
                <Tag key={`${offer.id}-${tag.label}`} tone="muted">
                  {normalizeDisplayText(translateUiToken(locale, tag.label))}
                </Tag>
              ))}
            </div>
          ) : null}

          {/* Metrics — flat row, no grid boxes */}
          {metrics.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {metrics.map((metric) => (
                <div key={`${offer.id}-${metric.label}`}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                    {normalizeDisplayText(metric.label)}
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold text-ink">
                    {normalizeDisplayText(metric.value)}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {/* CTA row */}
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#F2F3F2] pt-4">
            <ProviderLinkButton offer={offer} label={resolvedProviderLabel} />
            <Link
              href={localePath(locale, getOfferHref(offer))}
              className="text-[13px] font-semibold text-ink-secondary transition-colors hover:text-ink"
            >
              {resolvedDetailsLabel} &rarr;
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <SaveOfferButton offer={offer} variant="ghost" size="sm" />
              {extraActions}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
