import type { Metadata } from "next";
import type { MarketplaceMarket } from "@payn/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonStyles } from "@/components/button";
import { OfferCard } from "@/components/offer-card";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { ProviderLogo } from "@/components/provider-logo";
import { SaveOfferButton } from "@/components/save-offer-button";
import { SiteShell } from "@/components/site-shell";
import { Tag } from "@/components/tag";
import { OfferViewTracker } from "@/components/offer-view-tracker";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { getDictionary, getMetricLabel, translateMatchReason, translateTradeoff } from "@/lib/i18n";
import {
  getMarketCategoryHref,
  getOfferTradeoff,
  matchesOfferMarket,
  normalizeDisplayText,
} from "@/lib/marketplace";
import { getMatchReasons } from "@/lib/match-reasons";
import { getRequestPreferences } from "@/lib/request-preferences";
import { getOfferBySlug, listCategoryOffers, listRelatedOffers } from "@/server/catalog/catalog-service";

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(new Date(value));
}

function resolveOfferMarket(preferredMarket: MarketplaceMarket, offerSlug: string): MarketplaceMarket {
  const offer = marketplaceOffers.find((item) => item.slug === offerSlug);

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

export function generateStaticParams() {
  return marketplaceOffers.map((offer) => ({ slug: offer.slug }));
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

  const resolvedMarket = resolveOfferMarket(preferences.market, offer.slug);
  const categoryHref = getMarketCategoryHref(resolvedMarket, offer.category);
  const categoryLabel = dictionary.categories[offer.category];
  const categoryOffers = await listCategoryOffers(offer.category);
  const offerRank = Math.max(categoryOffers.findIndex((item) => item.slug === offer.slug) + 1, 1);
  const reasons = getMatchReasons(offer, offerRank);
  const relatedOffers = (await listRelatedOffers(offer, 4))
    .filter((candidate) => matchesOfferMarket(candidate, resolvedMarket))
    .slice(0, 2);
  const tradeoff = getOfferTradeoff(offer);

  return (
    <SiteShell activePage="marketplace" activeCategory={offer.category}>
      <OfferViewTracker offer={offer} market={resolvedMarket} />
      <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <ProviderLogo providerName={offer.providerName} websiteUrl={offer.providerWebsiteUrl} size="lg" muted={false} />
            <div>
              <p className="text-sm font-bold text-ink">{offer.providerName}</p>
              <p className="mt-1 text-sm text-ink-secondary">
                {categoryLabel} {dictionary.offerDetail.reviewedOn} {formatDate(offer.updatedAt, preferences.locale)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {offer.bestFor.map((item) => (
                  <Tag key={item} tone="muted">
                    {normalizeDisplayText(item)}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <SaveOfferButton offer={offer} variant="secondary" size="md" />
            <Link href={categoryHref} className={buttonStyles({ variant: "secondary", size: "md" })}>
              {dictionary.offerDetail.backToCategory}
            </Link>
            <ProviderLinkButton offer={offer} label={dictionary.offerDetail.visitProvider} variant="primary" size="md" source="offer_detail" />
          </div>
        </div>

        <dl className="mt-8 grid gap-3 sm:grid-cols-3">
          {offer.metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-bg-surface px-5 py-4">
              <dt className="text-xs font-medium text-ink-tertiary">
                {normalizeDisplayText(getMetricLabel(preferences.locale, metric.label))}
              </dt>
              <dd className="mt-1.5 text-lg font-bold tracking-tight text-ink">
                {normalizeDisplayText(metric.value)}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-accent-blue bg-accent-blue/30 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-blue-text">
              {dictionary.offerDetail.whyShown}
            </p>
            <div className="mt-3 grid gap-2">
              {(reasons.length > 0 ? reasons : ["Visible pricing", "Provider context"]).map((reason) => (
                <div key={reason} className="flex items-start gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0 text-accent-blue-text">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M7 4v3M7 9h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm leading-relaxed text-accent-blue-text">
                    {normalizeDisplayText(translateMatchReason(preferences.locale, reason))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-[#FCFCFB] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              {dictionary.offerDetail.tradeoff}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              {normalizeDisplayText(translateTradeoff(preferences.locale, tradeoff))}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-line bg-[#FCFCFB] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
            {dictionary.offerDetail.beforeClick}
          </p>
          <div className="mt-3 grid gap-2">
            {dictionary.offerDetail.beforeClickPoints.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-ink-tertiary">
                  <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm leading-relaxed text-ink-secondary">{item}</p>
              </div>
            ))}
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
    </SiteShell>
  );
}
