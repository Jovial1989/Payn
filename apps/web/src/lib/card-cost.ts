// P0.3 — the card yearly-cost model, extracted pure so it is unit-testable and
// so the assumption behind every "estimated yearly cost" is legible in one
// place. The maths is unchanged from the inline version it replaces; what's new
// is that callers can see the gross fee and the cashback offset separately, so
// a card whose cashback cancels its fee shows "cashback covers the fee" instead
// of a bare €0 next to a visible fee.

export type FeePeriod = "monthly" | "annual" | "unknown";

/** Detect whether a fee metric is quoted per month or per year. */
export function detectFeePeriod(label: string, value: string): FeePeriod {
  const blob = `${label} ${value}`.toLowerCase();
  if (/month|\/mo\b|\bmo\b|monthly|p\/m/.test(blob)) return "monthly";
  if (/year|annual|\/yr\b|\byr\b|p\.a|per year|jahr/.test(blob)) return "annual";
  return "unknown";
}

/**
 * Annualise a fee amount. A monthly fee MUST be ×12 — otherwise a €16.90/mo
 * card reads as €16.90/yr and its estimate (and its rank) collapse toward €0.
 */
export function annualiseFee(amount: number, period: FeePeriod): number {
  return period === "monthly" ? amount * 12 : amount;
}

export interface CardCostInputs {
  /** Already annualised fee (see annualiseFee). */
  annualFee: number;
  fxFeePercent: number;
  cashbackPercent: number;
  monthlySpend: number;
  /** Travel profile assumes a larger share of spend is in foreign currency. */
  travelMode: boolean;
}

export interface CardCostEstimate {
  /** Unavoidable cost before cashback: annual fee + FX drag on foreign spend. */
  grossFee: number;
  /** Cashback the user would realistically earn at this spend level. */
  cashbackBenefit: number;
  /** Net yearly cost, floored at 0. */
  net: number;
  /** True when a real fee exists but cashback cancels it out at this spend. */
  cashbackOffsetsFee: boolean;
  monthlySpend: number;
}

// Share of annual spend assumed to be in a foreign currency (drives FX drag).
const FOREIGN_SHARE_TRAVEL = 0.42;
const FOREIGN_SHARE_DOMESTIC = 0.08;
// Realisation haircut on headline cashback — most cards cap/tier it, so we only
// credit a fraction of the advertised rate.
const CASHBACK_REALISATION = 0.35;

export function estimateCardYearlyCost(inputs: CardCostInputs): CardCostEstimate {
  const yearlySpend = Math.max(0, inputs.monthlySpend) * 12;
  const foreignShare = inputs.travelMode ? FOREIGN_SHARE_TRAVEL : FOREIGN_SHARE_DOMESTIC;
  const foreignSpend = yearlySpend * foreignShare;
  const grossFee = inputs.annualFee + foreignSpend * (inputs.fxFeePercent / 100);
  const cashbackBenefit = yearlySpend * (inputs.cashbackPercent / 100) * CASHBACK_REALISATION;
  const rawNet = grossFee - cashbackBenefit;
  return {
    grossFee,
    cashbackBenefit,
    net: Math.max(0, rawNet),
    cashbackOffsetsFee: grossFee > 0 && rawNet <= 0,
    monthlySpend: inputs.monthlySpend,
  };
}
