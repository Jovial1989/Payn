export const supportedFxCurrencies = ["EUR", "USD", "GBP", "CHF"] as const;

export type FxCurrencyCode = (typeof supportedFxCurrencies)[number];

export interface FxQuotePayload {
  fromCurrency: FxCurrencyCode;
  toCurrency: FxCurrencyCode;
  rate: number;
  sourceName: string;
  delayed: boolean;
  unavailable: boolean;
  updatedAt: string;
}

export function isFxCurrencyCode(value: string | null): value is FxCurrencyCode {
  return Boolean(value && supportedFxCurrencies.includes(value as FxCurrencyCode));
}

export function normalizeFxCurrency(value: string | null, fallback: FxCurrencyCode = "EUR"): FxCurrencyCode {
  return isFxCurrencyCode(value) ? value : fallback;
}
