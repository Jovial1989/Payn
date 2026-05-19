import type { Metadata } from "next";
import type { MarketplaceMarket, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonStyles } from "@/components/button";
import { OfferCard } from "@/components/offer-card";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { ProviderLogo } from "@/components/provider-logo";
import { SaveOfferButton } from "@/components/save-offer-button";
import { Tag } from "@/components/tag";
import { OfferViewTracker } from "@/components/offer-view-tracker";
import { matchesOfferCountrySelection } from "@/lib/countries";
import { formatCopy, getDictionary, getMetricLabel, translateMatchReason, translateTradeoff } from "@/lib/i18n";
import {
  getOfferTradeoff,
  matchesOfferMarket,
  normalizeDisplayText,
} from "@/lib/marketplace";
import { getMatchReasons } from "@/lib/match-reasons";
import { localePath } from "@/lib/locale";
import { getRequestPreferences } from "@/lib/request-preferences";
import { getOfferBySlug, listCategoryOffers, listMarketplaceOffers, listRelatedOffers } from "@/server/catalog/catalog-service";

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(new Date(value));
}

function resolveOfferMarket(preferredMarket: MarketplaceMarket, offer: MarketplaceOffer | null): MarketplaceMarket {
  if (!offer) {
    return "eu";
  }

  if (matchesOfferMarket(offer, preferredMarket)) {
    return preferredMarket;
  }

  if (offer.countryCodes.includes("EU")) {
    return "eu";
  }

  const firstCountry = offer.countryCodes[0]?.toLowerCase();

  if (
    firstCountry === "de" ||
    firstCountry === "es" ||
    firstCountry === "uk" ||
    firstCountry === "fr" ||
    firstCountry === "it" ||
    firstCountry === "pt" ||
    firstCountry === "nl"
  ) {
    return firstCountry;
  }

  return "eu";
}

export async function generateStaticParams() {
  const offers = await listMarketplaceOffers();
  return offers.map((offer) => ({ slug: offer.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const offer = await getOfferBySlug(slug);

  if (!offer) {
    return { title: "Offer not found | Payn" };
  }

  return {
    title: `${offer.title} | Payn`,
    description: normalizeDisplayText(offer.subtitle),
  };
}

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const preferences = await getRequestPreferences();
  const dictionary = getDictionary(preferences.locale);
  const { slug } = await params;
  const offer = await getOfferBySlug(slug);

  if (!offer) {
    notFound();
  }

  const resolvedMarket = resolveOfferMarket(preferences.market, offer);
  const categoryHref = localePath(preferences.locale, `/${offer.category}`);
  const categoryLabel = dictionary.categories[offer.category];
  const categoryOffers = await listCategoryOffers(offer.category);
  const offerRank = Math.max(categoryOffers.findIndex((item) => item.slug === offer.slug) + 1, 1);
  const reasons = getMatchReasons(offer, offerRank);
  const relatedOffers = (await listRelatedOffers(offer, 4))
    .filter((candidate) => matchesOfferCountrySelection(candidate, preferences.country))
    .slice(0, 2);
  const tradeoff = getOfferTradeoff(offer);
  const primaryMetric = offer.metrics[0];
  const secondaryMetrics = offer.metrics.slice(1, 4);

  return (
    <>
      <OfferViewTracker
        offer={offer}
        country={preferences.country}
        language={preferences.locale}
        market={resolvedMarket}
      />
      <section className="grid gap-5">
        <div className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <ProviderLogo providerName={offer.providerName} websiteUrl={offer.providerWebsiteUrl} size="lg" muted={false} />
                <div>
                  <p className="text-sm font-bold text-ink">{offer.providerName}</p>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {categoryLabel} {dictionary.offerDetail.reviewedOn} {formatDate(offer.updatedAt, preferences.locale)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {offer.bestFor.slice(0, 2).map((item) => (
                      <Tag key={item} tone="muted">
                        {normalizeDisplayText(item)}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <SaveOfferButton offer={offer} variant="ghost" size="md" />
                <Link href={categoryHref} className={buttonStyles({ variant: "secondary", size: "md" })}>
                  {dictionary.offerDetail.backToCategory}
                </Link>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">
                  {primaryMetric
                    ? normalizeDisplayText(getMetricLabel(preferences.locale, primaryMetric.label))
                    : categoryLabel}
                </p>
                <h1 className="mt-3 text-[3rem] font-extrabold leading-none tracking-[-0.07em] text-ink sm:text-[4.5rem]">
                  {primaryMetric ? normalizeDisplayText(primaryMetric.value) : normalizeDisplayText(offer.title)}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-secondary">
                  {normalizeDisplayText(offer.subtitle)}
                </p>
              </div>

              <div className="rounded-[28px] bg-[#F7F9F7] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  {dictionary.offerDetail.primaryAction}
                </p>
                <div className="mt-4 grid gap-3">
                  <ProviderLinkButton
                    offer={offer}
                    label={dictionary.offerCard.providerCta[offer.category]}
                    source="offer_detail"
                    fullWidth
                  />
                  <p className="text-sm leading-relaxed text-ink-secondary">
                    {formatCopy(dictionary.offerDetail.primaryActionBody, {
                      provider: offer.providerName,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[28px] border border-line bg-white p-6 shadow-card lg:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              {dictionary.offerDetail.ratesTitle}
            </p>
            <div className="mt-5 grid gap-4">
              {offer.metrics.map((metric) => (
                <div key={metric.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                    {normalizeDisplayText(getMetricLabel(preferences.locale, metric.label))}
                  </p>
                  <p className="mt-1 text-xl font-bold tracking-[-0.04em] text-ink">
                    {normalizeDisplayText(metric.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-white p-6 shadow-card lg:col-span-2">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  {dictionary.offerDetail.benefitsTitle}
                </p>
                <div className="mt-4 grid gap-3">
                  {(reasons.length > 0 ? reasons : ["Visible pricing", "Provider context"]).map((reason) => (
                    <div key={reason} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#DDF4E7] text-accent-emerald">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M3.5 8l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <p className="text-sm leading-relaxed text-ink-secondary">
                        {normalizeDisplayText(translateMatchReason(preferences.locale, reason))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  {dictionary.offerDetail.tradeoffsTitle}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
                  {normalizeDisplayText(translateTradeoff(preferences.locale, tradeoff))}
                </p>
                {secondaryMetrics.length > 0 ? (
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {secondaryMetrics.map((metric) => (
                      <div key={metric.label} className="rounded-[20px] bg-[#F7F9F7] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                          {normalizeDisplayText(getMetricLabel(preferences.locale, metric.label))}
                        </p>
                        <p className="mt-1 text-base font-bold text-ink">
                          {normalizeDisplayText(metric.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-4 z-20 rounded-[28px] border border-line bg-white/92 p-4 shadow-[0_20px_46px_rgba(15,23,32,0.14)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                {primaryMetric
                  ? normalizeDisplayText(getMetricLabel(preferences.locale, primaryMetric.label))
                  : categoryLabel}
              </p>
              <p className="mt-1 text-2xl font-extrabold tracking-[-0.05em] text-ink">
                {primaryMetric ? normalizeDisplayText(primaryMetric.value) : normalizeDisplayText(offer.title)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ProviderLinkButton
                offer={offer}
                label={dictionary.offerCard.providerCta[offer.category]}
                source="offer_detail_sticky"
              />
            </div>
          </div>
        </div>
      </section>

      {relatedOffers.length > 0 && (
        <section>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
                {dictionary.offerDetail.related}
              </p>
              <h2 className="mt-4 text-h2 text-ink">{categoryLabel}</h2>
            </div>
            <Link href={categoryHref} className="text-sm font-semibold text-ink-secondary transition-colors hover:text-ink">
              {dictionary.offerDetail.viewAll} {categoryLabel.toLowerCase()}
            </Link>
          </div>
          <div className="grid gap-4">
            {relatedOffers.map((relatedOffer, index) => (
              <OfferCard
                key={relatedOffer.id}
                offer={relatedOffer}
                rank={index + 2}
                locale={preferences.locale}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
