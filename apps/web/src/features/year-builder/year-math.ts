import type { MarketplaceOffer } from "@payn/types";
import { rankOffer } from "@/features/marketplace/offer-ranking";

// ─── Year Builder math ─────────────────────────────────────────────────────────
//
// Computes a 12-month financial scenario comparing "do nothing" vs "the
// Payn-optimised kit" given a user's basic situation. Outputs:
//   • Annual saving number (€)
//   • Three product recommendations (one card, one savings, optionally one
//     transfer or loan) picked from the country's full catalogue using the
//     existing typed-attribute ranking helper.
//   • A 12-row monthly cash-flow series for the chart visualisation.
//
// Modeling assumptions (intentionally conservative — undersell to over-
// deliver):
//   • High-street bank FX  = 2.5% on abroad spend
//   • Current account rate = 0%
//   • High-street loan APR = 9.5%
//   • Payn travel card     = 0% FX
//   • Payn savings rate    = pulled from the picked savings offer
//   • Payn loan APR        = pulled from the picked loan offer (cheapest)
//
// Each assumption is exposed so the result UI can footnote the maths.

export interface YearInputs {
  /** Monthly card spend in € (€100 to €10k typical range). */
  monthlySpend: number;
  /** Share spent abroad as a 0-100 percentage. */
  abroadPct: number;
  /** Current-account balance the user could earn yield on. */
  currentBalance: number;
  /** When > 0, the user is planning to take a loan of this size. */
  plannedLoan: number;
  /** ISO-2 country code (FR, DE, ES…). Used to filter the catalogue. */
  country: string;
}

export interface ProductRecommendation {
  offer: MarketplaceOffer;
  /** A single sentence saying *why* this offer is in the user's year. */
  reasoning: string;
  /** Stable identifier of the slot — "card" | "savings" | "transfer" | "loan". */
  slot: string;
}

export interface YearResult {
  /** Net annual delta (€) vs the do-nothing baseline. Positive = savings. */
  totalSaved: number;
  /** Cost the user is paying today (bank baseline, annualised). */
  bankBaselineAnnual: number;
  /** Cost under the Payn-optimised kit (annualised; negative when net gain). */
  paynKitAnnual: number;
  /** 12 entries — { month, bank, payn } in € spent (or earned, negative). */
  timeline: Array<{ month: number; bank: number; payn: number }>;
  /** Selected products (card / savings / optional loan or transfer). */
  recommendations: ProductRecommendation[];
  /** Component breakdown so the result card can explain WHERE the savings
   *  come from (abroad FX vs interest earned vs loan APR delta). */
  breakdown: {
    abroadFeeSaved: number;
    interestEarned: number;
    loanInterestSaved: number;
  };
  assumptions: {
    bankFxPct: number;
    bankLoanApr: number;
    paynSavingsRate: number;
    paynLoanApr: number;
  };
}

// Conservative-by-design constants. Documented in the assumptions block
// returned to the UI so the user can audit the math.
const BANK_FX_PCT = 2.5;
const BANK_LOAN_APR = 9.5;
const PAYN_TRAVEL_CARD_FX = 0;
// Default fallback APR when no loan offer is available in the catalogue.
const FALLBACK_PAYN_LOAN_APR = 5.5;
// Default fallback savings rate when no savings offer is available.
const FALLBACK_PAYN_SAVINGS_RATE = 3.0;

function pickBestInCategory(
  category: string,
  countryMarket: MarketplaceOffer[],
): MarketplaceOffer | null {
  const pool = countryMarket.filter((o) => o.category === category);
  if (pool.length === 0) return null;
  const scored = pool
    .map((o) => ({ offer: o, score: rankOffer(o, pool).score ?? o.affiliatePriorityScore ?? 0 }))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.offer ?? null;
}

// Try multiple category names, return the first hit. Used to find a
// "travel card" (looking through cashback → debit → cards in order).
function pickFirstAvailable(
  categories: string[],
  countryMarket: MarketplaceOffer[],
): MarketplaceOffer | null {
  for (const c of categories) {
    const hit = pickBestInCategory(c, countryMarket);
    if (hit) return hit;
  }
  return null;
}

function findRateOnSavings(offer: MarketplaceOffer): number {
  // Look for any metric labelled rate/p.a./apy/yield and extract a number.
  const rateMetric = offer.metrics.find((m) =>
    /(rate|p\.a\.|apy|interest|yield)/i.test(m.label),
  );
  if (!rateMetric) return FALLBACK_PAYN_SAVINGS_RATE;
  const range = rateMetric.value.match(/(-?\d+[\d,]*\.?\d*)\s*[-–]\s*(-?\d+[\d,]*\.?\d*)/);
  if (range) {
    const a = parseFloat(range[1].replace(/,/g, ""));
    const b = parseFloat(range[2].replace(/,/g, ""));
    if (Number.isFinite(a) && Number.isFinite(b) && (a + b) / 2 > 0 && (a + b) / 2 < 25) {
      return (a + b) / 2;
    }
  }
  const first = rateMetric.value.match(/(-?\d+[\d,]*\.?\d*)/);
  if (first) {
    const n = parseFloat(first[1].replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0 && n < 25) return n;
  }
  return FALLBACK_PAYN_SAVINGS_RATE;
}

function findAprOnLoan(offer: MarketplaceOffer): number {
  const aprMetric = offer.metrics.find((m) => /(apr|interest)/i.test(m.label));
  if (!aprMetric) return FALLBACK_PAYN_LOAN_APR;
  const range = aprMetric.value.match(/(-?\d+[\d,]*\.?\d*)\s*[-–]\s*(-?\d+[\d,]*\.?\d*)/);
  if (range) {
    const a = parseFloat(range[1].replace(/,/g, ""));
    if (Number.isFinite(a) && a > 0 && a < 35) return a;
  }
  const first = aprMetric.value.match(/(-?\d+[\d,]*\.?\d*)/);
  if (first) {
    const n = parseFloat(first[1].replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0 && n < 35) return n;
  }
  return FALLBACK_PAYN_LOAN_APR;
}

export function computeYear(
  inputs: YearInputs,
  countryMarket: MarketplaceOffer[],
): YearResult {
  // ── Product picks ────────────────────────────────────────────────────
  const card = pickFirstAvailable(["travel", "cashback", "debit", "cards"], countryMarket);
  const savings = pickBestInCategory("savings", countryMarket);
  const loan = inputs.plannedLoan > 0 ? pickBestInCategory("loans", countryMarket) : null;
  const transfer = inputs.abroadPct >= 25 ? pickBestInCategory("transfers", countryMarket) : null;

  const paynSavingsRate = savings ? findRateOnSavings(savings) : FALLBACK_PAYN_SAVINGS_RATE;
  const paynLoanApr = loan ? findAprOnLoan(loan) : FALLBACK_PAYN_LOAN_APR;

  // ── Cost components ─────────────────────────────────────────────────
  // Abroad FX: bank takes 2.5%, Payn card 0% → user saves bank_fee/yr.
  const annualSpend = inputs.monthlySpend * 12;
  const annualAbroadSpend = annualSpend * (inputs.abroadPct / 100);
  const bankAbroadFeeAnnual = annualAbroadSpend * (BANK_FX_PCT / 100);
  const paynAbroadFeeAnnual = annualAbroadSpend * (PAYN_TRAVEL_CARD_FX / 100);
  const abroadFeeSaved = bankAbroadFeeAnnual - paynAbroadFeeAnnual;

  // Savings: bank 0% earns nothing; Payn rate earns balance × rate.
  const interestEarned = (inputs.currentBalance * paynSavingsRate) / 100;

  // Loan interest: bank 9.5% × amount, Payn rate × amount, save the diff
  // (per year — simple interest approximation for first-year cost).
  const bankLoanInterest = (inputs.plannedLoan * BANK_LOAN_APR) / 100;
  const paynLoanInterest = (inputs.plannedLoan * paynLoanApr) / 100;
  const loanInterestSaved = bankLoanInterest - paynLoanInterest;

  // ── Roll-up ─────────────────────────────────────────────────────────
  const totalSaved = abroadFeeSaved + interestEarned + loanInterestSaved;
  const bankBaselineAnnual = bankAbroadFeeAnnual + bankLoanInterest; // user loses these / pays
  const paynKitAnnual = paynAbroadFeeAnnual + paynLoanInterest - interestEarned; // negative = net gain

  // ── 12-month timeline series ─────────────────────────────────────────
  // Spread linearly across months — good enough for the visualisation,
  // and lets the user see the cumulative slope rather than a single bar.
  const monthlyBank = bankBaselineAnnual / 12;
  const monthlyPayn = paynKitAnnual / 12;
  const timeline = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    bank: monthlyBank * (i + 1),
    payn: monthlyPayn * (i + 1),
  }));

  // ── Recommendations array ───────────────────────────────────────────
  const recommendations: ProductRecommendation[] = [];
  if (card) {
    recommendations.push({
      offer: card,
      slot: "card",
      reasoning:
        abroadFeeSaved > 0
          ? `Saves ${euroR(abroadFeeSaved)} a year on FX vs a high-street card.`
          : `0% FX on every transaction — keeps your daily spend honest.`,
    });
  }
  if (savings) {
    recommendations.push({
      offer: savings,
      slot: "savings",
      reasoning:
        interestEarned > 0
          ? `Earns ${euroR(interestEarned)} a year on your ${euroR(inputs.currentBalance)} balance at ${paynSavingsRate.toFixed(2)}%.`
          : `${paynSavingsRate.toFixed(2)}% on instant-access savings.`,
    });
  }
  if (loan) {
    recommendations.push({
      offer: loan,
      slot: "loan",
      reasoning:
        loanInterestSaved > 0
          ? `Saves ${euroR(loanInterestSaved)} in year-one interest vs an average bank loan.`
          : `Lower APR than typical high-street loans.`,
    });
  } else if (transfer) {
    recommendations.push({
      offer: transfer,
      slot: "transfer",
      reasoning:
        `For the bigger transfers — keeps your FX margin tight.`,
    });
  }

  return {
    totalSaved,
    bankBaselineAnnual,
    paynKitAnnual,
    timeline,
    recommendations,
    breakdown: { abroadFeeSaved, interestEarned, loanInterestSaved },
    assumptions: {
      bankFxPct: BANK_FX_PCT,
      bankLoanApr: BANK_LOAN_APR,
      paynSavingsRate,
      paynLoanApr,
    },
  };
}

function euroR(value: number) {
  return Math.round(value).toLocaleString("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}
