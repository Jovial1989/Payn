import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import { supportedFxCurrencies, type FxCurrencyCode } from "@/lib/fx-quote";

export { supportedFxCurrencies } from "@/lib/fx-quote";

export type FxPairKey = `${FxCurrencyCode}-${FxCurrencyCode}`;

type OfferCalculationAdjustment = {
  baseRateAdjustmentPercent?: number;
  feePercent?: number;
  fixedFee?: number;
};

export type OfferCalculatorProfile = {
  baseRateAdjustmentPercent: number;
  feePercent: number;
  fixedFee: number;
  speedHours: number;
  limits?: {
    minAmount?: number;
    maxAmount?: number;
  };
  feeWaiverThreshold?: number;
  pairAdjustments?: Partial<Record<FxPairKey, OfferCalculationAdjustment>>;
};

export type OfferCalculatorResult = {
  offer: MarketplaceOffer;
  providerRate: number;
  grossAmount: number;
  totalFeeSource: number;
  totalFeeTarget: number;
  finalAmount: number;
  speedHours: number;
  feePercent: number;
  fixedFee: number;
};

const calculatorProfiles: Record<string, OfferCalculatorProfile> = {
  "transfer-wise-intl": {
    baseRateAdjustmentPercent: 0.05,
    feePercent: 0.41,
    fixedFee: 0,
    speedHours: 6,
  },
  "transfer-revolut-send": {
    baseRateAdjustmentPercent: 0.25,
    feePercent: 0.2,
    fixedFee: 0,
    speedHours: 4,
    pairAdjustments: {
      "EUR-GBP": { baseRateAdjustmentPercent: 0.18 },
      "GBP-EUR": { baseRateAdjustmentPercent: 0.18 },
    },
  },
  "transfer-n26-moneybeam": {
    baseRateAdjustmentPercent: 0.18,
    feePercent: 0,
    fixedFee: 0,
    speedHours: 2,
    limits: {
      maxAmount: 5000,
    },
    pairAdjustments: {
      "EUR-GBP": { baseRateAdjustmentPercent: 0.12 },
      "GBP-EUR": { baseRateAdjustmentPercent: 0.12 },
    },
  },
  "transfer-worldremit-global": {
    baseRateAdjustmentPercent: 0.95,
    feePercent: 0.45,
    fixedFee: 1.49,
    speedHours: 8,
  },
  "transfer-bunq-intl": {
    baseRateAdjustmentPercent: 0.12,
    feePercent: 0.5,
    fixedFee: 0,
    speedHours: 24,
  },
  "transfer-monese-send": {
    baseRateAdjustmentPercent: 0.6,
    feePercent: 0.25,
    fixedFee: 1.5,
    speedHours: 30,
  },
  "transfer-currencyfair-fx": {
    baseRateAdjustmentPercent: 0.04,
    feePercent: 0,
    fixedFee: 2.5,
    speedHours: 36,
    pairAdjustments: {
      "EUR-GBP": { fixedFee: 2 },
      "GBP-EUR": { fixedFee: 2 },
    },
  },
  "transfer-xe-global": {
    baseRateAdjustmentPercent: 0.4,
    feePercent: 0.15,
    fixedFee: 3,
    feeWaiverThreshold: 1000,
    speedHours: 48,
  },
  "transfer-remitly-express": {
    baseRateAdjustmentPercent: 0.78,
    feePercent: 0.35,
    fixedFee: 0.99,
    speedHours: 1,
  },
  "transfer-payoneer-biz": {
    baseRateAdjustmentPercent: 0.95,
    feePercent: 2,
    fixedFee: 0,
    speedHours: 24,
  },
  "transfer-western-union-instant": {
    baseRateAdjustmentPercent: 1.1,
    feePercent: 0.6,
    fixedFee: 1.9,
    speedHours: 0.5,
  },
  "transfer-santander-intl": {
    baseRateAdjustmentPercent: 0.45,
    feePercent: 0.15,
    fixedFee: 0,
    speedHours: 18,
    pairAdjustments: {
      "EUR-GBP": { baseRateAdjustmentPercent: 0.3 },
      "GBP-EUR": { baseRateAdjustmentPercent: 0.3 },
    },
  },
  "transfer-paysend-global": {
    baseRateAdjustmentPercent: 0.35,
    feePercent: 0.12,
    fixedFee: 1.5,
    speedHours: 1,
  },
  "transfer-moneygram-online": {
    baseRateAdjustmentPercent: 1.25,
    feePercent: 0.5,
    fixedFee: 2.99,
    speedHours: 0.5,
  },
  "transfer-ofx-global": {
    baseRateAdjustmentPercent: 0.18,
    feePercent: 0.05,
    fixedFee: 0,
    speedHours: 18,
    limits: {
      minAmount: 250,
    },
  },
  "transfer-skrill-money": {
    baseRateAdjustmentPercent: 0.95,
    feePercent: 0.4,
    fixedFee: 1.25,
    speedHours: 12,
  },
  "transfer-torfx-personal": {
    baseRateAdjustmentPercent: 0.12,
    feePercent: 0,
    fixedFee: 0,
    speedHours: 24,
    limits: {
      minAmount: 1000,
    },
  },
  "transfer-atlantic-money": {
    baseRateAdjustmentPercent: 0.03,
    feePercent: 0,
    fixedFee: 3,
    speedHours: 20,
    limits: {
      minAmount: 250,
    },
  },
  "transfer-small-world-remit": {
    baseRateAdjustmentPercent: 0.85,
    feePercent: 0.32,
    fixedFee: 1.99,
    speedHours: 8,
  },
  "transfer-ing-intl": {
    baseRateAdjustmentPercent: 0.9,
    feePercent: 0.2,
    fixedFee: 12,
    speedHours: 72,
    limits: {
      minAmount: 250,
    },
  },
  "exchange-wise-multi": {
    baseRateAdjustmentPercent: 0,
    feePercent: 0.35,
    fixedFee: 0,
    speedHours: 0.25,
  },
  "exchange-revolut-fx": {
    baseRateAdjustmentPercent: 0.08,
    feePercent: 0.2,
    fixedFee: 0,
    speedHours: 0.1,
    pairAdjustments: {
      "EUR-USD": { feePercent: 0.15 },
      "USD-EUR": { feePercent: 0.15 },
      "EUR-GBP": { feePercent: 0.12 },
      "GBP-EUR": { feePercent: 0.12 },
    },
  },
  "exchange-n26-fx": {
    baseRateAdjustmentPercent: 0.12,
    feePercent: 0.5,
    fixedFee: 0,
    speedHours: 0.25,
  },
  "exchange-bunq-fx": {
    baseRateAdjustmentPercent: 0.05,
    feePercent: 0.1,
    fixedFee: 0,
    speedHours: 0.25,
  },
  "exchange-currencyfair-market": {
    baseRateAdjustmentPercent: 0.04,
    feePercent: 0,
    fixedFee: 2.5,
    speedHours: 12,
  },
  "exchange-interactive-brokers": {
    baseRateAdjustmentPercent: 0.01,
    feePercent: 0,
    fixedFee: 2,
    speedHours: 0.5,
    limits: {
      minAmount: 500,
    },
  },
  "exchange-xe-rate-alerts": {
    baseRateAdjustmentPercent: 0.8,
    feePercent: 0.15,
    fixedFee: 0,
    speedHours: 6,
  },
  "exchange-revolut-business-fx": {
    baseRateAdjustmentPercent: 0.06,
    feePercent: 0.15,
    fixedFee: 0,
    speedHours: 0.1,
    limits: {
      minAmount: 250,
    },
  },
  "exchange-klarna-fx": {
    baseRateAdjustmentPercent: 1.8,
    feePercent: 0,
    fixedFee: 0,
    speedHours: 0.25,
    limits: {
      maxAmount: 2500,
    },
  },
  "exchange-monese-fx": {
    baseRateAdjustmentPercent: 0.85,
    feePercent: 0.1,
    fixedFee: 0,
    speedHours: 0.3,
  },
  "exchange-bnp-fx": {
    baseRateAdjustmentPercent: 0.45,
    feePercent: 0.1,
    fixedFee: 0,
    speedHours: 4,
    limits: {
      minAmount: 500,
    },
  },
  "exchange-curve-smart-fx": {
    baseRateAdjustmentPercent: 0.1,
    feePercent: 0.1,
    fixedFee: 0,
    speedHours: 0.1,
    pairAdjustments: {
      "EUR-GBP": { feePercent: 0.05 },
      "GBP-EUR": { feePercent: 0.05 },
    },
  },
  "exchange-wise-business-fx": {
    baseRateAdjustmentPercent: 0,
    feePercent: 0.4,
    fixedFee: 0,
    speedHours: 0.2,
    limits: {
      minAmount: 100,
    },
  },
  "exchange-santander-fx": {
    baseRateAdjustmentPercent: 0.8,
    feePercent: 0.1,
    fixedFee: 0,
    speedHours: 6,
  },
  "exchange-ofx-direct": {
    baseRateAdjustmentPercent: 0.12,
    feePercent: 0.05,
    fixedFee: 0,
    speedHours: 6,
    limits: {
      minAmount: 250,
    },
  },
  "exchange-saxo-fx": {
    baseRateAdjustmentPercent: 0.08,
    feePercent: 0.03,
    fixedFee: 0,
    speedHours: 0.2,
    limits: {
      minAmount: 500,
    },
  },
  "exchange-currencies-direct": {
    baseRateAdjustmentPercent: 0.18,
    feePercent: 0.04,
    fixedFee: 0,
    speedHours: 8,
    limits: {
      minAmount: 250,
    },
  },
  "exchange-monex-europe": {
    baseRateAdjustmentPercent: 0.22,
    feePercent: 0.05,
    fixedFee: 0,
    speedHours: 6,
    limits: {
      minAmount: 500,
    },
  },
};

function getPairKey(fromCurrency: FxCurrencyCode, toCurrency: FxCurrencyCode): FxPairKey {
  return `${fromCurrency}-${toCurrency}`;
}

function clampCurrencyAmount(value: number) {
  return Math.max(0, Number(value.toFixed(2)));
}

export function getOfferCalculatorProfile(offer: MarketplaceOffer) {
  return calculatorProfiles[offer.id] ?? null;
}

export function getOfferCalculatorResult(args: {
  offer: MarketplaceOffer;
  amount: number;
  fromCurrency: FxCurrencyCode;
  toCurrency: FxCurrencyCode;
  baseRate: number;
}): OfferCalculatorResult | null {
  const { offer, amount, fromCurrency, toCurrency, baseRate } = args;
  const profile = getOfferCalculatorProfile(offer);

  if (!profile || amount <= 0 || !Number.isFinite(baseRate) || baseRate <= 0) {
    return null;
  }

  if (profile.limits?.minAmount && amount < profile.limits.minAmount) {
    return null;
  }

  if (profile.limits?.maxAmount && amount > profile.limits.maxAmount) {
    return null;
  }

  const adjustment = profile.pairAdjustments?.[getPairKey(fromCurrency, toCurrency)];
  const feePercent = adjustment?.feePercent ?? profile.feePercent;
  const baseRateAdjustmentPercent =
    adjustment?.baseRateAdjustmentPercent ?? profile.baseRateAdjustmentPercent;
  const fixedFeeBase =
    amount >= (profile.feeWaiverThreshold ?? Number.POSITIVE_INFINITY)
      ? 0
      : adjustment?.fixedFee ?? profile.fixedFee;

  const providerRate = baseRate * (1 - baseRateAdjustmentPercent / 100);
  const grossAmount = amount * providerRate;
  const totalFeeSource = amount * (feePercent / 100) + fixedFeeBase;
  const totalFeeTarget = totalFeeSource * providerRate;
  const finalAmount = grossAmount - totalFeeTarget;

  if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
    return null;
  }

  return {
    offer,
    providerRate,
    grossAmount: clampCurrencyAmount(grossAmount),
    totalFeeSource: clampCurrencyAmount(totalFeeSource),
    totalFeeTarget: clampCurrencyAmount(totalFeeTarget),
    finalAmount: clampCurrencyAmount(finalAmount),
    speedHours: profile.speedHours,
    feePercent,
    fixedFee: fixedFeeBase,
  };
}

export function getCalculatorSpeedLabel(
  speedHours: number,
  locale: MarketplaceLocale = "en",
) {
  if (speedHours <= 1) return locale === "de" ? "Minuten" : "Minutes";
  if (speedHours <= 12) return locale === "de" ? "Am selben Tag" : "Same day";
  if (speedHours <= 24) return "24h";
  if (speedHours <= 48) return locale === "de" ? "1-2 Tage" : "1-2 days";
  return locale === "de" ? "2-5 Tage" : "2-5 days";
}
