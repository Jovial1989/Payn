import { getCountryCurrency } from "@/lib/countries";
import { type FxCurrencyCode, normalizeFxCurrency } from "@/lib/fx-quote";

// Money-transfer corridor presets shown as one-click chips above the
// transfers / exchange results. Kept within the four FX currencies the quote
// engine supports (EUR/USD/GBP/CHF) so every chip resolves to a real ranked
// list — a "EUR→PLN" chip would dead-end until PLN becomes a quotable
// currency (tracked under the market-context expansion, P1.2).
export const TRANSFER_CORRIDOR_PRESETS: ReadonlyArray<{
  fromCurrency: FxCurrencyCode;
  toCurrency: FxCurrencyCode;
}> = [
  { fromCurrency: "EUR", toCurrency: "GBP" },
  { fromCurrency: "EUR", toCurrency: "USD" },
  { fromCurrency: "GBP", toCurrency: "EUR" },
  { fromCurrency: "EUR", toCurrency: "CHF" },
];

export interface TransferCorridor {
  fromCountry: string;
  toCountry: string;
  fromCurrency: FxCurrencyCode;
  toCurrency: FxCurrencyCode;
}

// Cold-start corridor derived from the visitor's market. The audit found
// /transfers greeting param-less traffic with a same-country "UK→UK" default
// and a dead empty state. We seed a real cross-border corridor so the first
// paint is a ranked list: from-currency follows the market (EUR fallback),
// to-currency is the opposite major so the pair is always non-identity and
// always quotable (both sides have a cached fallback rate).
export function getDefaultTransferCorridor(defaultCountry: string): TransferCorridor {
  const fromCurrency = normalizeFxCurrency(getCountryCurrency(defaultCountry), "EUR");
  const toCurrency: FxCurrencyCode = fromCurrency === "EUR" ? "GBP" : "EUR";
  const fromCountry = defaultCountry || "de";
  // Destination country whose currency matches toCurrency, never the origin.
  const toCountry = toCurrency === "GBP" ? "uk" : fromCountry === "de" ? "fr" : "de";
  return { fromCountry, toCountry, fromCurrency, toCurrency };
}
