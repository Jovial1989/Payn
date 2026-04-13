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
      className={`rounded-[26px] border border-transparent bg-white px-4 py-5 shadow-[0_8px_22px_rgba(17,24,39,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#EAEAEA] hover:shadow-[0_18px_34px_rgba(17,24,39,0.10)] active:scale-[0.995] sm:px-5 ${
        highlighted ? "border-[#ECEDEF] bg-[#FCFCFD]" : ""
      }`}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-6">
        <div className="min-w-0">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-8 shrink-0 pt-1 text-sm font-semibold text-ink-tertiary">#{rank}</div>
            <div className="min-w-0 flex-1">
              <div className="grid min-w-0 gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
                <ProviderLogo providerName={offer.providerName} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{offer.providerName}</p>
                  <Link
                    href={localePath(locale, getOfferHref(offer))}
                    className="mt-1 block text-base font-bold tracking-[-0.03em] text-ink transition-colors hover:text-ink-secondary"
                  >
                    <span className="line-clamp-2">{offer.title}</span>
                  </Link>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
                    {normalizeDisplayText(summary)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Tag key={`${offer.id}-${tag.label}`} tone={tag.tone ?? "muted"}>
                  {normalizeDisplayText(translateUiToken(locale, tag.label))}
                </Tag>
              ))}
            </div>
          ) : null}

          {why ? (
            <p className="mt-3 text-sm leading-relaxed text-ink">
              <span className="font-semibold">{whyPrefix}</span> {normalizeDisplayText(why)}
            </p>
          ) : null}

          <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={`${offer.id}-${metric.label}`}>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                  {normalizeDisplayText(metric.label)}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">{normalizeDisplayText(metric.value)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid gap-4 rounded-[20px] border border-[#EAEAEA] bg-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] lg:content-start">
          <div className="text-left lg:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              {normalizeDisplayText(primaryLabel)}
            </p>
            <p className="mt-2 text-[30px] font-bold tracking-[-0.06em] text-ink tabular-nums">
              {normalizeDisplayText(primaryValue)}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <ProviderLinkButton
              offer={offer}
              label={resolvedProviderLabel}
              fullWidth
              className="justify-center"
            />
            <Link
              href={localePath(locale, getOfferHref(offer))}
              className={clsx(
                buttonStyles({ variant: "secondary", size: "sm" }),
                "w-full justify-center",
              )}
            >
              {resolvedDetailsLabel}
            </Link>
            <SaveOfferButton offer={offer} variant="ghost" size="sm" className="w-full justify-center" />
            {extraActions}
          </div>
        </div>
      </div>
    </article>
  );
}
