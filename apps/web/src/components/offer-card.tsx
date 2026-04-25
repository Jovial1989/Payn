import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { ProviderLogo } from "@/components/provider-logo";
import { SaveOfferButton } from "@/components/save-offer-button";
import { Tag } from "@/components/tag";
import { getDictionary, getMetricLabel, translateMatchReason, translateUiToken } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import { getMatchReasons } from "@/lib/match-reasons";
import { getOfferDecisionBadge } from "@/lib/offer-badges";
import { getOfferHref, normalizeDisplayText } from "@/lib/marketplace";

export function OfferCard({
  offer,
  rank,
  locale = "en",
  compareSelected = false,
  onToggleCompare,
}: {
  offer: MarketplaceOffer;
  rank: number;
  locale?: MarketplaceLocale;
  compareSelected?: boolean;
  onToggleCompare?: (id: string) => void;
}) {
  const dictionary = getDictionary(locale);
  const reasons = getMatchReasons(offer, rank);
  const primaryMetric = offer.metrics[0];
  const decisionBadge = getOfferDecisionBadge(offer, rank);
  const decisionTag =
    decisionBadge === "fastest"
      ? dictionary.home.tagFastest
      : decisionBadge === "noFees"
        ? dictionary.home.tagNoFees
        : dictionary.home.tagBestValue;
  const supportLabel = primaryMetric
    ? normalizeDisplayText(getMetricLabel(locale, primaryMetric.label))
    : normalizeDisplayText(offer.subtitle);
  const benefitBullets = [
    ...(offer.attributes?.comparisonHighlights ?? []),
    ...offer.bestFor.map((item) => translateUiToken(locale, item)),
    ...reasons.map((reason) => translateMatchReason(locale, reason)),
  ]
    .map((item) => normalizeDisplayText(item))
    .filter((item, index, items) => Boolean(item) && items.indexOf(item) === index)
    .slice(0, 3);
  const secondaryMetrics = offer.metrics.slice(1, 4);

  return (
    <article
      className="premium-card premium-card-hover group overflow-hidden rounded-[24px]"
      aria-label={`${offer.providerName} ${offer.title}`}
    >
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <ProviderLogo
              providerName={offer.providerName}
              websiteUrl={offer.providerWebsiteUrl}
              size="md"
              muted={false}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-semibold text-ink">{offer.providerName}</p>
                <span className="rounded-full bg-[#F2F3F4] px-2 py-0.5 text-[10px] font-bold text-ink-tertiary">
                  #{rank}
                </span>
                {offer.attributes?.isPartner ? <Tag tone="blue">Partner</Tag> : null}
              </div>
              <Link href={localePath(locale, getOfferHref(offer))} className="mt-0.5 block">
                <h3 className="line-clamp-2 text-[16px] font-bold leading-snug tracking-[-0.025em] text-ink transition-colors group-hover:text-accent-emerald-strong">
                  {normalizeDisplayText(offer.title)}
                </h3>
              </Link>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Tag tone="accent">{decisionTag}</Tag>
            <SaveOfferButton offer={offer} variant="ghost" size="sm" />
          </div>
        </div>

        {/* Primary metric — Robinhood-style big number */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-tertiary">
            {supportLabel}
          </p>
          <p className="mt-1.5 text-[2.25rem] font-extrabold leading-none tracking-[-0.055em] text-ink tabular-nums">
            {primaryMetric ? normalizeDisplayText(primaryMetric.value) : "—"}
          </p>
          {secondaryMetrics.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {secondaryMetrics.map((m) => (
                <div key={m.label}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                    {normalizeDisplayText(getMetricLabel(locale, m.label))}
                  </p>
                  <p className="mt-0.5 text-[13px] font-bold text-ink">
                    {normalizeDisplayText(m.value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Benefits — clean dot list */}
        {benefitBullets.length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {benefitBullets.map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-[13px] text-ink-secondary">
                <span className="h-1 w-1 shrink-0 rounded-full bg-accent-emerald" />
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CTA footer */}
      <div className="flex flex-wrap items-center gap-3 border-t border-[#F0F2F0] px-5 py-4 sm:px-6">
        <ProviderLinkButton
          offer={offer}
          label={locale === "de" ? "Weiter" : "Check my rate"}
        />
        <Link
          href={localePath(locale, getOfferHref(offer))}
          className="text-[13px] font-semibold text-ink-secondary transition-colors hover:text-ink"
        >
          {locale === "de" ? "Angebot ansehen" : "View offer"} &rarr;
        </Link>
        {onToggleCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare(offer.id)}
            className={`ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors ${
              compareSelected
                ? "text-accent-emerald-strong"
                : "text-ink-tertiary hover:text-ink"
            }`}
          >
            {compareSelected ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect width="14" height="14" rx="4" fill="currentColor" fillOpacity="0.15" />
                <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="0.5" y="0.5" width="13" height="13" rx="3.5" stroke="currentColor" strokeOpacity="0.4" />
              </svg>
            )}
            {compareSelected
              ? (locale === "de" ? "Hinzugefügt" : "Added")
              : translateUiToken(locale, "Compare")}
          </button>
        )}
      </div>
    </article>
  );
}
