"use client";

import Image from "next/image";
import Link from "next/link";
import type { MarketplaceOffer, MarketplaceLocale } from "@payn/types";
import {
  rankOffer,
  extractMetricNumber,
} from "@/features/marketplace/offer-ranking";
import { getProviderLogoPath } from "@/features/catalog/provider-logo";
import { getOfferHref } from "@/lib/marketplace";
import { localePath } from "@/lib/locale";

// ─── SmartCrossSell ────────────────────────────────────────────────────────────
//
// Replaces the generic "More to compare" carousel that used to dead-end
// users back to the catalogue. Two purpose-built strips:
//
//   1. Cheaper alternatives — same category, lower headline cost, with a
//      single-sentence delta explaining what the user trades away to get
//      the lower price.
//   2. Pairs well with — complementary offer from a different category
//      (e.g. a card PDP cross-sells a savings account). One pick only,
//      curated to feel like a recommendation, not a dump.
//
// Both strips render inline cards smaller than the catalogue OfferRowAtlas
// — they're contextual nudges, not primary discovery surfaces.
interface SmartCrossSellProps {
  offer: MarketplaceOffer;
  categoryMarket: MarketplaceOffer[];
  /** All offers in the user's country, used to find a complementary
   *  cross-category pick. Optional — when omitted the "Pairs well with"
   *  strip simply doesn't render. */
  countryMarket?: MarketplaceOffer[];
  locale: MarketplaceLocale;
}

export function SmartCrossSell({
  offer,
  categoryMarket,
  countryMarket,
  locale,
}: SmartCrossSellProps) {
  const sameCategory = categoryMarket.filter(
    (o) => o.category === offer.category && o.id !== offer.id,
  );

  // ─── Build "Cheaper alternatives" candidates ──────────────────────────
  //
  // We rank by the same metric the hero shows (offer.metrics[0]) and pick
  // those with a smaller numeric value. Strict "smaller value" only works
  // when the metric is lower-is-better (fee, APR, spread). For higher-is-
  // better metrics (cashback, rate), we flip and look for HIGHER values.
  // Heuristic: if the metric label contains "fee|cost|apr|spread|fx" →
  // lower; if "rate|cashback|return|yield" → higher; otherwise skip.
  const primary = offer.metrics[0];
  const ourPrimaryValue = primary ? extractMetricNumber(primary.value) : null;
  const direction =
    primary && /fee|cost|apr|spread|fx|premium/i.test(primary.label)
      ? "lower"
      : primary && /rate|cashback|return|yield|coverage/i.test(primary.label)
        ? "higher"
        : null;

  const cheaperAlternatives =
    direction && ourPrimaryValue !== null && primary
      ? sameCategory
          .map((alt) => {
            const altPrimary = alt.metrics.find((m) => m.label === primary.label);
            if (!altPrimary) return null;
            const altValue = extractMetricNumber(altPrimary.value);
            if (altValue === null) return null;
            const isBetter =
              direction === "lower"
                ? altValue < ourPrimaryValue
                : altValue > ourPrimaryValue;
            if (!isBetter) return null;
            const altRanking = rankOffer(alt, categoryMarket);
            return {
              offer: alt,
              altValue,
              altMetricLabel: altPrimary.label,
              altMetricValue: altPrimary.value,
              ourValue: ourPrimaryValue,
              delta: Math.abs(altValue - ourPrimaryValue),
              direction,
              tradeoffSentence: composeTradeoffSentence(offer, alt, altRanking),
            };
          })
          .filter((x): x is NonNullable<typeof x> => Boolean(x))
          .sort((a, b) =>
            a.direction === "lower" ? a.altValue - b.altValue : b.altValue - a.altValue,
          )
          .slice(0, 3)
      : [];

  // ─── Pick one cross-category complement ───────────────────────────────
  //
  // Mapping is intentional and conservative: cards pair with savings,
  // savings pair with investments, transfers pair with cards, etc. We
  // pick the highest-scoring offer in the target category for the user's
  // country. Falls back to "no recommendation" when no good match exists.
  const complementCategory = COMPLEMENT_MAP[offer.category];
  const complementCandidate =
    complementCategory && countryMarket
      ? pickBestInCategory(complementCategory, countryMarket)
      : null;

  // No data to surface anything — render nothing.
  if (cheaperAlternatives.length === 0 && !complementCandidate) {
    return null;
  }

  return (
    <section className="grid gap-6">
      {cheaperAlternatives.length > 0 && (
        <div>
          <div className="mb-4 max-w-prose-base">
            <p className="eyebrow-cap" data-tone="emerald">
              Cheaper if you compromise
            </p>
            <h2 className="display-lead mt-2 text-[1.5rem] sm:text-[1.75rem]">
              You can pay less — here's what changes.
            </h2>
          </div>
          <div className="grid gap-3">
            {cheaperAlternatives.map((alt) => (
              <AlternativeCard
                key={alt.offer.id}
                offer={alt.offer}
                metricLabel={alt.altMetricLabel}
                metricValue={alt.altMetricValue}
                tradeoffSentence={alt.tradeoffSentence}
                locale={locale}
              />
            ))}
          </div>
        </div>
      )}

      {complementCandidate && (
        <div>
          <div className="mb-4 max-w-prose-base">
            <p className="eyebrow-cap">Pairs well with</p>
            <h2 className="display-lead mt-2 text-[1.5rem] sm:text-[1.75rem]">
              Most {offer.category} users also pick {aOrAn(COMPLEMENT_LABEL[offer.category])} {COMPLEMENT_LABEL[offer.category]}.
            </h2>
          </div>
          <ComplementCard offer={complementCandidate} locale={locale} />
        </div>
      )}
    </section>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────────────
function AlternativeCard({
  offer,
  metricLabel,
  metricValue,
  tradeoffSentence,
  locale,
}: {
  offer: MarketplaceOffer;
  metricLabel: string;
  metricValue: string;
  tradeoffSentence: string;
  locale: MarketplaceLocale;
}) {
  const logoPath = getProviderLogoPath(offer.providerName);
  const href = localePath(locale, getOfferHref(offer));

  return (
    <Link
      href={href}
      className="group flex items-stretch gap-4 rounded-2xl border border-line bg-white p-4 shadow-subtle transition-all hover:-translate-y-px hover:border-accent-emerald/30 hover:shadow-card"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent-emerald-soft">
        {logoPath ? (
          <Image
            src={logoPath}
            alt={offer.providerName}
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        ) : (
          <span className="text-[11px] font-extrabold text-accent-emerald-strong">
            {offer.providerMark.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="truncate text-[14px] font-bold leading-tight text-ink">
          {offer.title}
        </p>
        <p className="mt-1 text-[12px] leading-snug text-ink-secondary">
          {tradeoffSentence}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
          {metricLabel}
        </p>
        <p className="mt-1 text-[18px] font-extrabold tabular-nums tracking-tight-2 text-accent-emerald-strong">
          {metricValue}
        </p>
        <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-accent-emerald-strong transition-transform group-hover:translate-x-0.5">
          See offer
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6h7M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function ComplementCard({
  offer,
  locale,
}: {
  offer: MarketplaceOffer;
  locale: MarketplaceLocale;
}) {
  const logoPath = getProviderLogoPath(offer.providerName);
  const href = localePath(locale, getOfferHref(offer));
  const headline = offer.metrics[0];

  return (
    <Link
      href={href}
      className="group flex items-stretch gap-5 rounded-3xl border border-line bg-gradient-to-br from-accent-emerald-soft/40 via-white to-white p-5 shadow-card transition-all hover:-translate-y-px hover:shadow-card-hover"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent-emerald-soft">
        {logoPath ? (
          <Image
            src={logoPath}
            alt={offer.providerName}
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
        ) : (
          <span className="text-[13px] font-extrabold text-accent-emerald-strong">
            {offer.providerMark.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-emerald-strong">
          {offer.providerName}
        </p>
        <p className="mt-0.5 text-[16px] font-bold leading-tight tracking-tight-1 text-ink">
          {offer.title}
        </p>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-ink-secondary">
          {offer.subtitle}
        </p>
      </div>

      {headline && (
        <div className="flex shrink-0 flex-col items-end justify-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
            {headline.label}
          </p>
          <p className="mt-1 text-[20px] font-extrabold tabular-nums tracking-tight-2 text-ink">
            {headline.value}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-accent-emerald-strong transition-transform group-hover:translate-x-0.5">
            Take a look
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h7M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      )}
    </Link>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
//
// Compose a single-sentence "what you lose" delta. We look for a metric
// where the alternative ranks worse than our offer (or has a worse-looking
// value) and surface it. Falls back to a generic line when no obvious
// tradeoff can be computed — never empty.
function composeTradeoffSentence(
  ours: MarketplaceOffer,
  alt: MarketplaceOffer,
  altRanking: ReturnType<typeof rankOffer>,
): string {
  // Look for one of our bullets that isn't on the alternative.
  const ourBullets = (ours.bullets ?? []).slice(0, 3);
  const altBulletsLower = new Set((alt.bullets ?? []).map((b) => b.toLowerCase()));
  const missingFeature = ourBullets.find(
    (b) => !altBulletsLower.has(b.toLowerCase()),
  );
  if (missingFeature) {
    return `Cheaper, but you lose "${shortenBullet(missingFeature)}".`;
  }

  // Look for an alt metric that ranks worse (worst) on a high-value field.
  const worstMetric = Object.entries(altRanking.metricRanks).find(
    ([, rank]) => rank === "worst",
  );
  if (worstMetric) {
    return `Cheaper, but worse on ${worstMetric[0].toLowerCase()}.`;
  }

  return `Cheaper headline — check the full terms before switching.`;
}

function shortenBullet(b: string): string {
  return b.length > 50 ? b.slice(0, 47).trim() + "…" : b;
}

// English indefinite article — naive vowel-letter check, fine for the
// product nouns in COMPLEMENT_LABEL (no honest/hour-style exceptions).
function aOrAn(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

// Cross-category complement map. Entries are intentional: a card buyer
// commonly opens a savings account next, a saver looks at investments,
// etc. `insurance` is deliberately absent — recommending a savings
// account next to a life-insurance policy is weak positioning. Until we
// have insurance subtype data (life / travel / health / property /
// device) we'd rather render no strip than a generic savings nudge.
const COMPLEMENT_MAP: Record<string, string> = {
  cards:       "savings",
  debit:       "savings",
  travel:      "transfers",
  cashback:    "savings",
  transfers:   "exchange",
  exchange:    "transfers",
  remittance:  "exchange",
  savings:     "investments",
  investments: "savings",
  trading:     "investments",
  crypto:      "exchange",
  loans:       "savings",
  bnpl:        "cards",
  banking:     "cards",
  neobanks:    "investments",
  wallets:     "transfers",
  business:    "payroll",
  payroll:     "business",
  tax:         "business",
  expense:     "business",
  budgeting:   "savings",
  kids:        "savings",
};

const COMPLEMENT_LABEL: Record<string, string> = {
  cards:       "savings account",
  debit:       "savings account",
  travel:      "transfer service",
  cashback:    "savings account",
  transfers:   "exchange",
  exchange:    "transfer service",
  remittance:  "exchange",
  savings:     "investment account",
  investments: "savings account",
  trading:     "investment account",
  crypto:      "exchange",
  loans:       "savings account",
  bnpl:        "card",
  banking:     "card",
  neobanks:    "investment account",
  wallets:     "transfer service",
  business:    "payroll tool",
  payroll:     "business account",
  tax:         "business account",
  expense:     "business account",
  budgeting:   "savings account",
  kids:        "savings account",
};

function pickBestInCategory(
  category: string,
  countryMarket: MarketplaceOffer[],
): MarketplaceOffer | null {
  const candidates = countryMarket.filter((o) => o.category === category);
  if (candidates.length === 0) return null;

  // Score each + pick the highest. Falls back to affiliate priority when
  // no rankable data exists.
  const scored = candidates
    .map((c) => ({
      offer: c,
      score: rankOffer(c, candidates).score ?? c.affiliatePriorityScore ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.offer ?? null;
}
