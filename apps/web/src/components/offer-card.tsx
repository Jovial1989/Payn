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

// Rewrite a bare-zero metric value as a friendlier word so the card
// headline doesn't read "EUR 0" (which looks like a placeholder /
// loading state) or "0%" (which can read as "data missing"). Anything
// else passes through unchanged.
function friendlyHeroValue(raw: string): string {
  const v = raw.trim();
  if (/^(eur|usd|gbp|chf)\s*0(\.0+)?$/i.test(v)) return "Free";
  if (/^0(\.0+)?\s*%$/.test(v)) return "0%";
  return raw;
}

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

  return (
    <article
      // WEB.6 — `flex h-full flex-col` lets the article fill its grid
      // cell when the parent uses `lg:grid-cols-3`. Without h-full the
      // CTA footer landed at different vertical positions per card,
      // because each card sized to its own content height and the
      // grid only `items-stretch`ed implicit children of the same
      // height. The body div takes `flex-1` to push the CTA footer
      // to the bottom of every card, so the row of "Check my rate" /
      // "Get card" buttons across the three tiles always line up.
      className="premium-card premium-card-hover motion-card group flex h-full flex-col overflow-hidden rounded-[24px]"
      style={{ ["--motion-delay" as string]: `${Math.min(rank * 70, 280)}ms` }}
      aria-label={`${offer.providerName} ${offer.title}`}
    >
      <div className="flex flex-1 flex-col gap-6 p-5 sm:p-6">
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

        {/* Primary metric — Robinhood-style big number, with "EUR 0" /
            "0%" rewritten as a friendlier word so the headline isn't a
            bare zero that reads as a placeholder. */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-tertiary">
            {supportLabel}
          </p>
          <p className="mt-2 text-[2.4rem] font-extrabold leading-none tracking-[-0.06em] tabular-nums text-ink sm:text-[2.7rem]">
            {primaryMetric ? friendlyHeroValue(primaryMetric.value) : "—"}
          </p>

          {benefitBullets[0] ? (
            <p className="mt-3 text-[14px] font-medium text-ink-secondary">
              {benefitBullets[0]}
            </p>
          ) : null}

          {secondaryMetrics.length > 0 && (
            // 2-col cap — the card sits inside a 3-col dashboard grid, so
            // a 4-col internal grid produced ~70px columns and wrapped
            // values like "Saveback up to 1%" or "Free up to EUR 100"
            // into 3-4 tiny lines. Two columns gives ~140px which lets
            // a typical metric value sit on one line.
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
              {secondaryMetrics.slice(0, 4).map((m) => (
                <div key={m.label} className="min-w-0">
                  <dt className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                    {normalizeDisplayText(getMetricLabel(locale, m.label))}
                  </dt>
                  <dd
                    className="mt-0.5 truncate text-[14px] font-bold text-ink"
                    title={normalizeDisplayText(m.value)}
                  >
                    {normalizeDisplayText(m.value)}
                  </dd>
                </div>
              ))}
            </dl>
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

      {/* CTA footer — one primary action + optional Compare. The
          "Check details" secondary link is gone (the entire header is
          a Link to the PDP, so the card body already navigates there
          on click of the title), removing the dual-CTA confusion the
          user flagged on the dashboard cards. */}
      <div className="flex flex-wrap items-center gap-3 border-t border-[#F0F2F0] px-5 py-4 sm:px-6">
        <ProviderLinkButton
          offer={offer}
          label={dictionary.offerCard.providerCta[offer.category]}
        />
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
