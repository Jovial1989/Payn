import type { Metadata } from "next";
import type { MarketplaceMarket, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonStyles } from "@/components/button";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { ProviderLogo } from "@/components/provider-logo";
import { SaveOfferButton } from "@/components/save-offer-button";
import { OfferViewTracker } from "@/components/offer-view-tracker";
import { VerdictBar } from "@/features/offers/verdict-bar";
import { PdpStickySummary } from "@/features/offers/pdp-sticky-summary";
import { CardsCostEstimator } from "@/features/offers/cards-cost-estimator";
import { LoansCostEstimator } from "@/features/offers/loans-cost-estimator";
import { TransfersCostEstimator } from "@/features/offers/transfers-cost-estimator";
import { SavingsCostEstimator } from "@/features/offers/savings-cost-estimator";
import { MobileScrollHide } from "@/components/mobile-scroll-hide";
import { PdpDeepDive } from "@/features/offers/pdp-deep-dive";
import { OfferPlainSummary } from "@/features/offers/offer-plain-summary";
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
      {/* RESP.9 — PDP hero padded p-4 on 375px (was p-6) and corner
          radius dropped to rounded-[24px]; the rounded-4xl + p-6
          combination ate 56px of horizontal room which made the
          headline metric tower truncate on smaller phones. The
          provider-row gap also collapses to gap-3 on mobile so the
          ProviderLogo + name + tags column doesn't overflow. */}
      <section className="grid gap-5">
        <div className="rounded-[24px] bg-gradient-to-br from-[#0D1812] to-[#13181A] p-4 sm:rounded-4xl sm:p-8">
          <div className="flex flex-col gap-6 sm:gap-8">
            <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3 sm:gap-4">
                <ProviderLogo providerName={offer.providerName} websiteUrl={offer.providerWebsiteUrl} size="lg" muted={false} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">{offer.providerName}</p>
                  <p className="mt-1 text-[13px] text-white/60 sm:text-sm">
                    {categoryLabel} {dictionary.offerDetail.reviewedOn} {formatDate(offer.updatedAt, preferences.locale)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {offer.bestFor.slice(0, 2).map((item) => (
                      <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                        {normalizeDisplayText(item)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <SaveOfferButton offer={offer} variant="ghost" size="md" />
                <Link
                  href={categoryHref}
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  {dictionary.offerDetail.backToCategory}
                </Link>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                  {primaryMetric
                    ? normalizeDisplayText(getMetricLabel(preferences.locale, primaryMetric.label))
                    : categoryLabel}
                </p>
                <h1 className="mt-3 text-[2.5rem] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-white sm:text-[3.25rem]">
                  {primaryMetric ? normalizeDisplayText(primaryMetric.value) : normalizeDisplayText(offer.title)}
                </h1>
                <p className="mt-4 max-w-prose-base text-base leading-relaxed text-white/70">
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
              <div className="rounded-2xl bg-bg-surface p-5">
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

        {/* UX.6 — Plain-language summary block. Adds the FAQ section
            (process questions: "will checking my rate hurt my credit
            score?", "what if I lose my job mid-loan?") and the
            explicit "last checked on <date>" stamp the rewrite spec
            called out. The product questions ("What you get",
            "Things to watch") are already handled by PdpDeepDive
            above; this block fills the trust-signal gap underneath. */}
        <OfferPlainSummary offer={offer} />

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
