import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { ProviderLogo } from "@/components/provider-logo";
import { SaveOfferButton } from "@/components/save-offer-button";
import { Tag } from "@/components/tag";
import { getDictionary, getMetricLabel, translateMatchReason, translateUiToken } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import { getOfferTradeoff } from "@/lib/marketplace";
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
  const highlightCopy =
    reasons[0]
      ? normalizeDisplayText(translateMatchReason(locale, reasons[0]))
      : normalizeDisplayText(getOfferTradeoff(offer));

  return (
    <article
      className="premium-card premium-card-hover group flex h-full flex-col overflow-hidden rounded-[28px] p-5 sm:p-6"
      aria-label={`${offer.providerName} ${offer.title}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3.5">
          <ProviderLogo
            providerName={offer.providerName}
            websiteUrl={offer.providerWebsiteUrl}
            size="md"
            muted={false}
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[13px] font-semibold text-ink">{offer.providerName}</p>
              <span className="rounded-full border border-line bg-bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-tertiary">
                #{rank}
              </span>
              {offer.attributes?.isPartner ? <Tag tone="blue">Partner</Tag> : null}
            </div>

            <Link href={localePath(locale, getOfferHref(offer))} className="mt-1 block">
              <h3 className="line-clamp-2 text-[17px] font-bold leading-snug tracking-[-0.03em] text-ink transition-colors group-hover:text-accent-emerald-strong">
                {normalizeDisplayText(offer.title)}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-ink-secondary">
              {normalizeDisplayText(offer.subtitle)}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <Tag tone="accent" className="ml-auto">
            {decisionTag}
          </Tag>
          <p className="mt-3 max-w-[120px] text-sm font-semibold leading-snug text-ink">
            {normalizeDisplayText(decisionTag)}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
            {highlightCopy}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-[24px] border border-[#E8EEE9] bg-[linear-gradient(180deg,#FDFEFD_0%,#F7FAF8_100%)] p-5 sm:grid-cols-[minmax(0,1fr)_170px] sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-tertiary">
            {supportLabel}
          </p>
          <p className="mt-2 text-[2rem] font-extrabold leading-none tracking-[-0.05em] text-ink sm:text-[2.4rem]">
            {primaryMetric ? normalizeDisplayText(primaryMetric.value) : "-"}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-secondary">
            {normalizeDisplayText(offer.subtitle)}
          </p>
        </div>

        <div className="rounded-[20px] border border-[#E3EBE6] bg-white/90 p-4 shadow-[0_8px_20px_rgba(15,23,32,0.04)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-emerald">
            Highlight
          </p>
          <p className="mt-2 text-base font-bold leading-tight text-ink">{normalizeDisplayText(decisionTag)}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{highlightCopy}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {benefitBullets.map((item) => (
          <div
            key={item}
            className="inline-flex items-center gap-2 rounded-full border border-[#E6ECE8] bg-[#FBFCFB] px-3.5 py-2 text-sm text-ink-secondary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-5">
        <div className="flex flex-col gap-3 border-t border-[#EDF1ED] pt-5 sm:flex-row sm:flex-wrap sm:items-center">
          <ProviderLinkButton
            offer={offer}
            label={locale === "de" ? "Weiter" : "Continue"}
            fullWidth
            className="sm:w-auto"
          />
          <Link
            href={localePath(locale, getOfferHref(offer))}
            className={`${buttonStyles({ variant: "secondary", size: "md" })} w-full justify-center sm:w-auto`}
          >
            {locale === "de" ? "Angebot ansehen" : "View offer"}
          </Link>
          <SaveOfferButton offer={offer} variant="ghost" size="md" className="w-full justify-center sm:w-auto" />
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(offer.id)}
              className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full border px-4 py-3 text-sm font-semibold transition-colors sm:ml-auto sm:w-auto ${
                compareSelected
                  ? "border-accent-emerald/25 bg-accent-emerald-soft text-accent-emerald-strong"
                  : "border-line bg-bg-surface text-ink-secondary hover:border-accent-emerald/25 hover:text-ink"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h8M8 4v8" />
              </svg>
              {compareSelected ? (locale === "de" ? "Hinzugefügt" : "Added") : translateUiToken(locale, "Compare")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
