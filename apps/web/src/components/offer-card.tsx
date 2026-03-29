import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { ProviderLogo } from "@/components/provider-logo";
import { SaveOfferButton } from "@/components/save-offer-button";
import { Tag } from "@/components/tag";
import { getDictionary, getMetricLabel, translateMatchReason } from "@/lib/i18n";
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

  return (
    <article
      className="group flex h-full flex-col rounded-[22px] border border-[#E2E4E8] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]"
      aria-label={`${offer.providerName} ${offer.title}`}
    >
      <div className="flex items-start gap-3">
        <ProviderLogo
          providerName={offer.providerName}
          websiteUrl={offer.providerWebsiteUrl}
          size="md"
          muted={false}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-semibold text-ink">{offer.providerName}</p>
                <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">
                  #{rank}
                </span>
                {offer.attributes?.isPartner && (
                  <span className="rounded-full bg-accent-blue px-2 py-0.5 text-[10px] font-semibold text-accent-blue-text">
                    Partner
                  </span>
                )}
              </div>

              <Link href={localePath(locale, getOfferHref(offer))} className="mt-1.5 block">
                <h3 className="line-clamp-2 text-[17px] font-bold leading-snug tracking-[-0.03em] text-ink transition-colors group-hover:text-ink-secondary">
                  {normalizeDisplayText(offer.title)}
                </h3>
              </Link>
            </div>

            {primaryMetric ? (
              <div className="shrink-0 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                  {normalizeDisplayText(getMetricLabel(locale, primaryMetric.label))}
                </p>
                <p className="mt-1 text-xl font-bold tracking-[-0.04em] text-ink">
                  {normalizeDisplayText(primaryMetric.value)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Tag tone="accent">{decisionTag}</Tag>
        {offer.bestFor.slice(0, 2).map((item) => (
          <Tag key={item} tone="muted">
            {normalizeDisplayText(item)}
          </Tag>
        ))}
        {reasons[0] ? (
          <Tag tone="blue">
            {normalizeDisplayText(translateMatchReason(locale, reasons[0]))}
          </Tag>
        ) : null}
      </div>

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-center gap-2 border-t border-[#F0F0F2] pt-4">
          <ProviderLinkButton
            offer={offer}
            label={dictionary.offerCard.reviewOffer}
            variant="primary"
            size="sm"
          />
          <Link
            href={localePath(locale, getOfferHref(offer))}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            Details
          </Link>
          <SaveOfferButton offer={offer} variant="ghost" size="sm" />
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(offer.id)}
              className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                compareSelected
                  ? "bg-black text-white"
                  : "bg-bg-surface text-ink-secondary hover:bg-bg-overlay hover:text-ink"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h8M8 4v8" />
              </svg>
              {compareSelected ? "Added" : "Compare"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
