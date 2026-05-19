import type { MarketplaceOffer } from "@payn/types";

// ─── Card fee filters ─────────────────────────────────────────────────────────
//
// /explore/spend-smarter lists 28 cards. The two questions a card buyer
// always asks first are "is it free to hold?" and "do they take a cut on
// FX?". Both are answerable from existing metric values without any
// schema change, but reading them out of 28 rows is slow. These helpers
// expose two binary filters that BucketWorkspace renders as pill buttons.
//
// Restricted to card-shaped categories so the filter doesn't try to read
// "Monthly fee" off a transfer or savings row that happens to share the
// label.

const CARD_CATEGORIES = new Set([
  "cards",
  "debit",
  "travel",
  "cashback",
]);

export function isCardCategory(category: string): boolean {
  return CARD_CATEGORIES.has(category);
}

// Treat "free" generously: "Free", "Free (Standard)", "EUR 0", "0 EUR",
// "From €0", "Free / EUR 9.99" all qualify — most cards advertise a free
// tier alongside a paid tier, and the user's question is "can I open this
// without paying a monthly fee?". A card with a free tier passes.
const FREE_PATTERNS = [
  /\bfree\b/i,
  /\b(eur|usd|gbp|chf)\s*0(?:\b|\.0+\b)/i,
  /\b0\s*(?:eur|usd|gbp|chf)\b/i,
  /\bfrom\s+(?:€|\$|£)?0(?:\.0+)?\b/i,
];

export function isMonthlyFeeFree(offer: MarketplaceOffer): boolean {
  if (!isCardCategory(offer.category)) return false;
  const m = offer.metrics.find((x) => /\b(monthly|annual)\s+fee\b/i.test(x.label));
  if (!m) return false;
  return FREE_PATTERNS.some((re) => re.test(m.value));
}

// "Zero FX" means the headline FX is 0%. We don't try to detect "0% up to
// a limit" as a different bucket — most users searching for zero-FX want
// the qualifying cards in the list either way; the per-row detail still
// shows the cap. Reject when the value contains a non-zero percent.
const FX_ZERO_PATTERNS = [
  /^\s*0\s*%/,
  /\b0\s*%/,
];

export function isFxFeeZero(offer: MarketplaceOffer): boolean {
  if (!isCardCategory(offer.category)) return false;
  const m = offer.metrics.find((x) => /\bfx\s*fee\b/i.test(x.label));
  if (!m) return false;
  if (!FX_ZERO_PATTERNS.some((re) => re.test(m.value))) return false;
  // Reject "0% up to X then 2%" if a later non-zero percent appears.
  // Strip the leading 0% match and see if any other number-percent remains.
  const after = m.value.replace(/0\s*%[^%]*/, " ");
  return !/\d+(?:\.\d+)?\s*%/.test(after);
}
