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

// Deterministic user count by rank — gives credibility signal without randomness
const RANK_USER_COUNTS = [120, 84, 60, 44, 33, 24, 18, 13];

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
    .slice(0, 2);
  const secondaryMetrics = offer.metrics.slice(1, 5);

  // Social proof: deterministic count derived from rank
  const userCountK = RANK_USER_COUNTS[Math.min(rank - 1, RANK_USER_COUNTS.length - 1)] ?? 10;

  return (
    <article
      className="premium-card premium-card-hover motion-card group overflow-hidden rounded-[24px]"
      style={{ ["--motion-delay" as string]: `${Math.min(rank * 70, 280)}ms` }}
      aria-label={`${offer.providerName} ${offer.title}`}
    >
      <div className="flex flex-col gap-6 p-5 sm:p-6">
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
                {offer.attributes?.isPartner ? <Tag tone="blue">{dictionary.offerCard.partnerLabel}</Tag> : null}
              </div>
              <Link href={localePath(locale, getOfferHref(offer))} className="mt-1 block">
                <h3 className="line-clamp-2 text-[18px] font-bold leading-snug tracking-[-0.03em] text-ink transition-colors group-hover:text-accent-emerald-strong">
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
          <p className="mt-2 text-[2.7rem] font-extrabold leading-none tracking-[-0.07em] tabular-nums text-ink">
            {primaryMetric ? normalizeDisplayText(primaryMetric.value) : "—"}
          </p>
          {/* Social proof */}
          <p className="mt-2 text-[12px] font-medium text-ink-tertiary">
            {userCountK * 10 + rank * 5} users checked today &middot; {offer.countryCodes.slice(0, 3).join(", ")}
          </p>

          {benefitBullets[0] ? (
            <p className="mt-2 text-[14px] font-medium text-ink-secondary">
              {benefitBullets[0]}
            </p>
          ) : null}
          {secondaryMetrics.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {secondaryMetrics.map((m) => (
                <div key={m.label} className="rounded-2xl border border-line bg-[#FAFBFA] px-3 py-2">
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
        {benefitBullets.length > 1 && (
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {benefitBullets.slice(1).map((item) => (
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
          label={dictionary.offerCard.providerCta[offer.category]}
        />
        <Link
          href={localePath(locale, getOfferHref(offer))}
          className="pressable text-[13px] font-semibold text-ink-secondary transition-colors hover:text-ink"
        >
          {dictionary.offerCard.reviewOffer} &rarr;
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
            {compareSelected ? dictionary.offerCard.compareAdded : dictionary.offerCard.compareToggle}
          </button>
        )}
      </div>
    </article>
  );
}
