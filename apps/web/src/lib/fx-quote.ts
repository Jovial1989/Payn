// P1.2 — the currencies a user can pick for a transfer/exchange. Expanded
// beyond the original four so European users can quote in their own currency
// (a Polish user can now enter PLN). The live FX sources (Frankfurter,
// exchangerate.host, Open Exchange Rates) all cover these ECB currencies; the
// cached fallback in fx-quote-service.ts covers them too.
export const supportedFxCurrencies = [
  "EUR", "USD", "GBP", "CHF", "PLN", "SEK", "DKK", "CZK", "NOK", "HUF", "RON",
] as const;

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
