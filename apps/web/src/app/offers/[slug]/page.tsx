import type { Metadata } from "next";
import type { MarketplaceMarket, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonStyles } from "@/components/button";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { ProviderLogo } from "@/components/provider-logo";
import { SaveOfferButton } from "@/components/save-offer-button";
import { Tag } from "@/components/tag";
import { OfferViewTracker } from "@/components/offer-view-tracker";
import { VerdictBar } from "@/features/offers/verdict-bar";
import { PdpStickySummary } from "@/features/offers/pdp-sticky-summary";
import { CardsCostEstimator } from "@/features/offers/cards-cost-estimator";
import { LoansCostEstimator } from "@/features/offers/loans-cost-estimator";
import { TransfersCostEstimator } from "@/features/offers/transfers-cost-estimator";
import { SavingsCostEstimator } from "@/features/offers/savings-cost-estimator";
import { MobileScrollHide } from "@/components/mobile-scroll-hide";
import { PdpDeepDive } from "@/features/offers/pdp-deep-dive";
import { SmartCrossSell } from "@/features/offers/smart-cross-sell";
import type { MarketplaceCategory } from "@payn/types";

// Card-shaped categories where the cost estimator can apply (we score on
// annualFeeAmount / fxFeePercent / cashbackPercent / atmFreeLimit).
const CARD_CATEGORIES = new Set(["cards", "debit", "travel", "cashback"]);
// Loan-shaped categories where the loan estimator can apply (it parses APR
// range from the metric value).
const LOAN_CATEGORIES = new Set(["loans", "bnpl"]);
// Money-movement categories where the transfer cost calculator applies.
const TRANSFER_CATEGORIES = new Set(["transfers", "exchange", "remittance"]);
// Yield-bearing categories where the savings calculator applies.
const SAVINGS_CATEGORIES = new Set(["savings"]);

// Used by the PdpDeepDive to write copy that reads naturally
// ("the application path you'll be sent to…").
const CATEGORY_NOUN: Partial<Record<MarketplaceCategory, string>> = {
  cards: "card", debit: "debit card", travel: "travel card", cashback: "cashback card",
  loans: "loan", bnpl: "buy-now-pay-later plan",
  transfers: "transfer service", exchange: "exchange", remittance: "remittance service",
  banking: "account", neobanks: "neobank account", wallets: "wallet",
  savings: "savings account",
  investments: "investment account", trading: "trading account", crypto: "crypto exchange",
  insurance: "insurance policy",
  business: "business account", payroll: "payroll service",
  tax: "tax tool", expense: "expense tool",
  budgeting: "budgeting app", kids: "kids' account",
};
import { matchesOfferCountrySelection } from "@/lib/countries";
import { formatCopy, getDictionary, getMetricLabel, translateTradeoff } from "@/lib/i18n";
import {
  getOfferTradeoff,
  matchesOfferMarket,
  normalizeDisplayText,
} from "@/lib/marketplace";
import { localePath } from "@/lib/locale";
import { getRequestPreferences } from "@/lib/request-preferences";
import { getOfferBySlug, listCategoryOffers, listMarketplaceOffers } from "@/server/catalog/catalog-service";

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
  // Country-scoped full market — used by SmartCrossSell to pick a single
  // cross-category complement (e.g. on a card PDP we recommend a savings
  // account from the same country market).
  const allOffers = await listMarketplaceOffers();
  const countryMarket = allOffers.filter((candidate) =>
    matchesOfferCountrySelection(candidate, preferences.country),
  );
  const tradeoff = getOfferTradeoff(offer);
  const primaryMetric = offer.metrics[0];

  return (
    <>
      <OfferViewTracker
        offer={offer}
        country={preferences.country}
        language={preferences.locale}
        market={resolvedMarket}
      />
      <section className="grid gap-5">
        <div className="rounded-4xl border border-line bg-white p-6 shadow-card sm:p-8">
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
                <p className="eyebrow-cap">
                  {primaryMetric
                    ? normalizeDisplayText(getMetricLabel(preferences.locale, primaryMetric.label))
                    : categoryLabel}
                </p>
                <h1 className="display-hero mt-3 tabular-nums">
                  {primaryMetric ? normalizeDisplayText(primaryMetric.value) : normalizeDisplayText(offer.title)}
                </h1>
                <p className="mt-4 max-w-prose-base text-base leading-relaxed text-ink-secondary">
                  {normalizeDisplayText(offer.subtitle)}
                </p>
              </div>

              {/* Primary action panel — the "PRIMARY ACTION" eyebrow used
                  to live here. It was a design-system artefact that leaked
                  into prod: a label on a CTA that already speaks for itself.
                  Now the panel reads directly: button + reassurance copy.
                  The dictionary value is intentionally kept (empty string)
                  so future locales can re-introduce a contextual eyebrow
                  if needed without re-plumbing markup. */}
              <div className="rounded-3xl bg-[#F7F9F7] p-5">
                <div className="grid gap-3">
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

        {/* Top sticky summary — slides in as the user scrolls past the
            hero. Desktop-only (mobile has the bottom sticky already). */}
        <PdpStickySummary
          offer={offer}
          ctaLabel={dictionary.offerCard.providerCta[offer.category]}
        />

        {/* Verdict Bar — sits between hero and pricing grid. Answers
            "is this actually good?" before the user has to read the table. */}
        <VerdictBar offer={offer} categoryMarket={categoryOffers} />

        {/* Cost Estimator — category-specific. Each estimator
            self-checks for the required data and renders nothing when
            missing, so PDP gracefully degrades. Four families now:
            cards (annualFee/FX/cashback), loans (APR/term/amount),
            transfers (fee/spread), savings (rate). */}
        {CARD_CATEGORIES.has(offer.category) && (
          <CardsCostEstimator offer={offer} />
        )}
        {LOAN_CATEGORIES.has(offer.category) && (
          <LoansCostEstimator offer={offer} />
        )}
        {TRANSFER_CATEGORIES.has(offer.category) && (
          <TransfersCostEstimator offer={offer} />
        )}
        {SAVINGS_CATEGORIES.has(offer.category) && (
          <SavingsCostEstimator offer={offer} />
        )}

        {/* Deep-dive accordions — replaces the old 3-col Pricing/Benefits/
            Tradeoffs grid with 5 progressive-disclosure sections:
            Pricing & fees, What you get, Things to watch (with computed
            weaknesses from the ranking helper), Who can apply, and
            Editor's note. Earns trust by surfacing weaknesses competitors
            hide. */}
        <PdpDeepDive
          offer={offer}
          categoryMarket={categoryOffers}
          locale={preferences.locale}
          tradeoffText={normalizeDisplayText(translateTradeoff(preferences.locale, tradeoff))}
          editorialContext={{
            categoryNoun: CATEGORY_NOUN[offer.category] ?? "product",
          }}
        />

        {/* Mobile-only sticky bottom CTA, now wrapped in MobileScrollHide so
            it disappears while the user is scrolling down (reading) and
            reappears the moment they swipe up. Twitter/X pattern — keeps
            the action reachable without fighting the affiliate banner or
            blocking long-form reading. */}
        <MobileScrollHide
          className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-20 -mx-2 rounded-3xl border border-line bg-white/92 p-4 shadow-floating backdrop-blur md:hidden"
          // sticky bottom anchored above mobile bottom-nav (~64px) +
          // safe-area inset for the iPhone home-bar.
        >
          <div
            className="flex items-center justify-between gap-3"
            style={{ marginBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-ink-tertiary">
                {primaryMetric
                  ? normalizeDisplayText(getMetricLabel(preferences.locale, primaryMetric.label))
                  : categoryLabel}
              </p>
              <p className="mt-0.5 truncate text-[17px] font-extrabold tracking-tight-1 text-ink">
                {primaryMetric ? normalizeDisplayText(primaryMetric.value) : normalizeDisplayText(offer.title)}
              </p>
            </div>
            <ProviderLinkButton
              offer={offer}
              label={dictionary.offerCard.providerCta[offer.category]}
              source="offer_detail_sticky"
            />
          </div>
        </MobileScrollHide>
      </section>

      {/* Smart cross-sell — replaces the old generic "More <category>"
          carousel. Two contextual strips:
            1. Cheaper alternatives in the same category with a concrete
               "what you trade away" delta line per row.
            2. One cross-category complement (cards → savings, etc.) that
               feels like a recommendation, not a catalogue dump. */}
      <SmartCrossSell
        offer={offer}
        categoryMarket={categoryOffers}
        countryMarket={countryMarket}
        locale={preferences.locale}
      />
    </>
  );
}
