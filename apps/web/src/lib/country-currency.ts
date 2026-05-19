// ─── Country → base-currency map ──────────────────────────────────────────────
//
// Used to flag offers priced in a currency that doesn't match the user's
// market (e.g. a USD-priced SafetyWing policy shown to a French viewer).
// Conservative: when we don't know the country, we return null so the
// caller can decide whether to suppress the badge or assume EUR.

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // Eurozone
  AT: "EUR", BE: "EUR", CY: "EUR", DE: "EUR", EE: "EUR", ES: "EUR",
  FI: "EUR", FR: "EUR", GR: "EUR", HR: "EUR", IE: "EUR", IT: "EUR",
  LT: "EUR", LU: "EUR", LV: "EUR", MT: "EUR", NL: "EUR", PT: "EUR",
  SI: "EUR", SK: "EUR",
  EU: "EUR",
  // Non-euro EU + EEA + UK
  BG: "BGN", CZ: "CZK", DK: "DKK", HU: "HUF", PL: "PLN", RO: "RON",
  SE: "SEK", IS: "ISK", LI: "CHF", NO: "NOK",
  CH: "CHF",
  UK: "GBP", GB: "GBP",
};

export function countryToBaseCurrency(country: string | undefined | null): string | null {
  if (!country) return null;
  return COUNTRY_TO_CURRENCY[country.toUpperCase()] ?? null;
}
