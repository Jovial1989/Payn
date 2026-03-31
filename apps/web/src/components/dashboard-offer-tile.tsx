"use client";

import type { MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { ProviderLogo } from "@/components/provider-logo";
import { SaveOfferButton } from "@/components/save-offer-button";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { Tag } from "@/components/tag";
import { getDashboardDecisionCopy } from "@/lib/dashboard-decision-copy";
import { getDictionary, getMetricLabel } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import { getOfferHref, normalizeDisplayText } from "@/lib/marketplace";
import { getUiCopy } from "@/lib/ui-copy";

type OfferInsightLike = {
  activityScore?: number;
  saveCount?: number;
  providerClickCount?: number;
  offerViewCount?: number;
};

export function DashboardOfferTile({
  offer,
  insight,
  eyebrow,
}: {
  offer: MarketplaceOffer;
  insight?: OfferInsightLike;
  eyebrow?: string;
}) {
  const { locale } = useMarketplacePreferences();
  const dictionary = getDictionary(locale);
  const decisionCopy = getDashboardDecisionCopy(locale);
  const uiCopy = getUiCopy(locale);
  const metrics = offer.metrics.slice(0, 2);
  const bestForLead = offer.bestFor[0];
  const secondaryTags = offer.bestFor.slice(1, 3);

  return (
    <article className="rounded-[26px] border border-line bg-white p-5 shadow-subtle">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <ProviderLogo
            providerName={offer.providerName}
            websiteUrl={offer.providerWebsiteUrl}
            size="sm"
          />
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                {eyebrow}
              </p>
            ) : null}
            <p className="truncate text-sm font-semibold text-ink">{offer.providerName}</p>
          </div>
        </div>

        {typeof insight?.activityScore === "number" && insight.activityScore > 0 ? (
          <Tag tone="blue">{insight.activityScore.toFixed(1)}</Tag>
        ) : null}
      </div>

      <div className="mt-4">
        <Link href={localePath(locale, getOfferHref(offer))} className="transition-colors hover:text-ink-secondary">
          <h3 className="text-lg font-bold tracking-tight text-ink">{offer.title}</h3>
        </Link>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          {normalizeDisplayText(offer.subtitle)}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl bg-bg-surface px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-tertiary">
              {normalizeDisplayText(getMetricLabel(locale, metric.label))}
            </p>
            <p className="mt-1 text-sm font-bold text-ink">{normalizeDisplayText(metric.value)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {bestForLead ? (
          <Tag tone="blue">
            {`${decisionCopy.bestForPrefix}: ${normalizeDisplayText(bestForLead).toLowerCase()}`}
          </Tag>
        ) : null}
        {secondaryTags.map((item, index) => (
          <Tag key={item} tone={index === 0 ? "success" : "purple"}>
            {normalizeDisplayText(item)}
          </Tag>
        ))}
      </div>

      {insight ? (
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
          {typeof insight.offerViewCount === "number" ? <span>{insight.offerViewCount} {uiCopy.common.views}</span> : null}
          {typeof insight.saveCount === "number" ? <span>{insight.saveCount} {uiCopy.common.saves}</span> : null}
          {typeof insight.providerClickCount === "number" ? <span>{insight.providerClickCount} {uiCopy.common.clicks}</span> : null}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <ProviderLinkButton offer={offer} label="Go to provider" variant="primary" size="sm" />
        <SaveOfferButton offer={offer} variant="ghost" size="sm" />
        <Link href={localePath(locale, getOfferHref(offer))} className={buttonStyles({ variant: "secondary", size: "sm" })}>
          {dictionary.offerCard.reviewOffer}
        </Link>
      </div>
    </article>
  );
}
