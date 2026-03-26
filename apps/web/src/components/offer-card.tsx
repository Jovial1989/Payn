import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { ProviderLogo } from "@/components/provider-logo";
import { Tag } from "@/components/tag";
import { getDictionary, getMetricLabel, translateMatchReason, translateTradeoff } from "@/lib/i18n";
import { getMatchReasons } from "@/lib/match-reasons";
import { getOfferHref, getOfferTradeoff, normalizeDisplayText } from "@/lib/marketplace";

const tagTones = ["blue", "accent", "purple", "orange", "muted"] as const;

function formatDate(value: string, locale: MarketplaceLocale) {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(new Date(value));
}

export function OfferCard({
  offer,
  rank,
  locale = "en",
}: {
  offer: MarketplaceOffer;
  rank: number;
  locale?: MarketplaceLocale;
}) {
  const reasons = getMatchReasons(offer, rank);
  const tradeoff = getOfferTradeoff(offer);
  const dictionary = getDictionary(locale);

  return (
    <article
      className="group rounded-[28px] border border-line bg-white/95 p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover sm:p-8"
      aria-label={`${offer.providerName} ${offer.title}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <ProviderLogo providerName={offer.providerName} websiteUrl={offer.providerWebsiteUrl} size="lg" />
          <div>
            <p className="text-sm font-bold text-ink">{offer.providerName}</p>
            <p className="mt-0.5 text-xs text-ink-tertiary">
              {dictionary.offerCard.updated} {formatDate(offer.updatedAt, locale)}
            </p>
          </div>
        </div>
        <Tag tone="blue">#{rank}</Tag>
      </div>

      <div className="mt-5">
        <Link href={getOfferHref(offer)} className="transition-colors hover:text-ink-secondary">
          <h3 className="text-h3 text-ink">{offer.title}</h3>
        </Link>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          {normalizeDisplayText(offer.subtitle)}
        </p>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        {offer.metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl bg-bg-surface px-5 py-4">
            <dt className="text-xs font-medium text-ink-tertiary">
              {normalizeDisplayText(getMetricLabel(locale, metric.label))}
            </dt>
            <dd className="mt-1.5 text-lg font-bold tabular-nums tracking-tight text-ink">
              {normalizeDisplayText(metric.value)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        {offer.bestFor.map((item, i) => (
          <Tag key={item} tone={tagTones[i % tagTones.length]}>
            {normalizeDisplayText(item)}
          </Tag>
        ))}
      </div>

      {reasons.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-accent-blue bg-accent-blue/30 px-4 py-3">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-accent-blue-text">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 4v3M7 9h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <p className="text-xs font-medium text-accent-blue-text">
            {reasons
              .map((reason) => normalizeDisplayText(translateMatchReason(locale, reason)))
              .join(" · ")}
          </p>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-line bg-[#FCFCFB] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
          {dictionary.offerCard.keyTradeoff}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          {normalizeDisplayText(translateTradeoff(locale, tradeoff))}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-xs text-ink-tertiary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span>{dictionary.offerCard.reviewBeforeLeave}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={getOfferHref(offer)} className={buttonStyles({ variant: "primary", size: "md" })}>
            {dictionary.offerCard.reviewOffer}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1.5">
              <path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a
            href={offer.providerWebsiteUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonStyles({ variant: "secondary", size: "md" })}
          >
            {dictionary.offerCard.providerSite}
          </a>
        </div>
      </div>
    </article>
  );
}
