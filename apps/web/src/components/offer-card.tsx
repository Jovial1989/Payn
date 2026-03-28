import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { ProviderLogo } from "@/components/provider-logo";
import { SaveOfferButton } from "@/components/save-offer-button";
import { Tag } from "@/components/tag";
import { getDictionary, getMetricLabel, translateMatchReason, translateTradeoff } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
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
  const isTopRank = rank === 1;

  return (
    <article
      className={`group rounded-[22px] border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover sm:p-5 ${
        isTopRank
          ? "border-accent-green/60 shadow-[0_4px_20px_rgba(19,115,51,0.06)]"
          : "border-line shadow-card"
      }`}
      aria-label={`${offer.providerName} ${offer.title}`}
    >
      {/* ─── Header: Provider + Rank + Metrics (single row on lg) ─── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
        {/* Provider identity */}
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <div className="relative shrink-0">
            <ProviderLogo providerName={offer.providerName} websiteUrl={offer.providerWebsiteUrl} size="md" />
            {isTopRank && (
              <div className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent-green text-[9px] font-bold text-accent-green-text shadow-subtle">
                1
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-ink">{offer.providerName}</p>
              {!isTopRank && (
                <span className="rounded-md bg-accent-blue px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-accent-blue-text">
                  #{rank}
                </span>
              )}
              <span className="hidden text-[11px] text-ink-tertiary sm:inline">
                {dictionary.offerCard.updated} {formatDate(offer.updatedAt, locale)}
              </span>
            </div>
            <Link href={localePath(locale, getOfferHref(offer))} className="group/title mt-0.5 block">
              <h3 className="text-[15px] font-bold leading-snug tracking-tight text-ink transition-colors group-hover/title:text-ink-secondary">
                {offer.title}
              </h3>
            </Link>
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-secondary">
              {normalizeDisplayText(offer.subtitle)}
            </p>
          </div>
        </div>

        {/* Metrics — compact tiles */}
        <dl className="flex shrink-0 gap-2 lg:gap-1.5">
          {offer.metrics.map((metric) => (
            <div key={metric.label} className="min-w-0 flex-1 rounded-xl bg-bg-surface px-3 py-2.5 lg:w-[105px] lg:flex-none">
              <dt className="truncate text-[10px] font-medium uppercase tracking-wide text-ink-tertiary">
                {normalizeDisplayText(getMetricLabel(locale, metric.label))}
              </dt>
              <dd className="mt-0.5 truncate text-sm font-bold tabular-nums tracking-tight text-ink">
                {normalizeDisplayText(metric.value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ─── Tags + Insights (single compact row) ─── */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {offer.bestFor.slice(0, 4).map((item, i) => (
          <Tag key={item} tone={tagTones[i % tagTones.length]}>
            {normalizeDisplayText(item)}
          </Tag>
        ))}

        {/* Inline match reason */}
        {reasons.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-blue/40 px-2.5 py-1 text-[11px] font-medium text-accent-blue-text">
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
              <path d="M7 4v3M7 9h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {reasons
              .slice(0, 2)
              .map((reason) => normalizeDisplayText(translateMatchReason(locale, reason)))
              .join(" · ")}
          </span>
        )}
      </div>

      {/* ─── Tradeoff + Actions (compact bottom bar) ─── */}
      <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tradeoff — slim inline */}
        <div className="flex min-w-0 flex-1 items-center gap-2 text-[12px] text-ink-tertiary">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="shrink-0">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="truncate">
            <span className="font-semibold text-ink-secondary">{dictionary.offerCard.keyTradeoff}:</span>{" "}
            {normalizeDisplayText(translateTradeoff(locale, tradeoff))}
          </span>
        </div>

        {/* CTAs — tight row */}
        <div className="flex shrink-0 items-center gap-1.5">
          <SaveOfferButton offer={offer} variant="ghost" size="sm" />
          <Link href={localePath(locale, getOfferHref(offer))} className={buttonStyles({ variant: "primary", size: "sm" })}>
            {dictionary.offerCard.reviewOffer}
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="ml-1">
              <path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <ProviderLinkButton offer={offer} label={dictionary.offerCard.providerSite} variant="secondary" size="sm" />
        </div>
      </div>
    </article>
  );
}
