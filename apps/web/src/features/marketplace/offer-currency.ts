import type { MarketplaceOffer } from "@payn/types";

// Currencies we recognise in metric values. Order doesn't matter — the
// regex picks the first one it finds in the first price-shaped metric.
const CURRENCY_CODES = [
  "EUR", "USD", "GBP", "CHF", "SEK", "NOK", "DKK",
  "PLN", "CZK", "HUF", "RON", "BGN", "ISK", "JPY",
];

const CURRENCY_RE = new RegExp(`\\b(${CURRENCY_CODES.join("|")})\\b`);

// Symbols → ISO code, so an offer priced as "€19" or "$45" still classifies.
const SYMBOL_TO_CURRENCY: Record<string, string> = {
  "€": "EUR",
  "$": "USD",
  "£": "GBP",
  "¥": "JPY",
};

// ─── extractOfferCurrency ─────────────────────────────────────────────────────
//
// Returns the currency a user would actually pay this offer in, or null if
// nothing parseable is found. Walks metric values first (where pricing
// lives), then subtitle as a last resort. Restricted to the first match —
// most offers price the entire product in one currency, so a single hit
// is enough to flag a USD-priced row for a EUR viewer.
export function extractOfferCurrency(offer: MarketplaceOffer): string | null {
  for (const m of offer.metrics) {
    const isoMatch = CURRENCY_RE.exec(m.value);
    if (isoMatch) return isoMatch[1].toUpperCase();

    for (const sym of Object.keys(SYMBOL_TO_CURRENCY)) {
      if (m.value.includes(sym)) return SYMBOL_TO_CURRENCY[sym];
    }
  }

  if (offer.subtitle) {
    const isoMatch = CURRENCY_RE.exec(offer.subtitle);
    if (isoMatch) return isoMatch[1].toUpperCase();
  }

  return null;
}
