import type { MarketplaceOffer } from "@payn/types";

// ─── Transfer speed inference ─────────────────────────────────────────────────
//
// /explore/travel-and-abroad lists 44 transfer/exchange/remittance offers.
// The single decision that gates most users is "how fast does the money
// land?" — but the Speed column reads as free text ("Instant – 3 days",
// "Minutes – 2 days", "1 – 4 days", "SEPA zone"). Without a filter, the
// user has to scan 44 rows.
//
// Classification uses the LOWER bound of the speed range. A service that
// CAN deliver instantly passes the Instant filter even if it also can run
// slower (the user's question is "can I send now and have it land
// immediately?", not "is every transfer instant?").

export type TransferSpeed = "instant" | "fast" | "multi-day" | "unknown";

const INSTANT_RE = /\b(instant|minutes?|real[- ]time|same[- ]day)\b/i;
const FAST_RE = /\b(24\s*h(?:rs?|ours?)?|next[- ]day|1\s*day\b|0[-–]1\s*days?)\b/i;
const MULTI_DAY_RE = /\b\d+\s*[-–]\s*\d+\s*days?\b|\b\d+\s*days?\b/i;

export function inferTransferSpeed(offer: MarketplaceOffer): TransferSpeed {
  // Restrict to money-movement categories. Other rows in a mixed bucket
  // (cards under travel bucket) pass through as "unknown" so the filter
  // doesn't silently drop them.
  const c = offer.category;
  if (c !== "transfers" && c !== "exchange" && c !== "remittance") {
    return "unknown";
  }

  // 1. Look at the "Speed" metric value first.
  const speedMetric = offer.metrics.find((m) => /speed/i.test(m.label));
  const candidate = speedMetric?.value ?? "";

  if (INSTANT_RE.test(candidate)) return "instant";
  if (FAST_RE.test(candidate)) return "fast";
  if (MULTI_DAY_RE.test(candidate)) return "multi-day";

  // 2. Some offers don't expose a Speed metric (XE International lists
  // Transfer fee / Currencies / Rate alerts). Fall back to title/subtitle
  // scan — most providers advertise speed in their copy.
  const haystack = `${offer.title ?? ""} ${offer.subtitle ?? ""} ${(offer.bullets ?? []).join(" ")}`;
  if (INSTANT_RE.test(haystack)) return "instant";
  if (FAST_RE.test(haystack)) return "fast";
  if (MULTI_DAY_RE.test(haystack)) return "multi-day";

  return "unknown";
}

export const TRANSFER_SPEED_LABELS: Record<TransferSpeed, string> = {
  instant: "Instant",
  fast: "Under 24h",
  "multi-day": "1+ days",
  unknown: "Not specified",
};

// Display order in the filter UI — fast → slow → unknown.
export const TRANSFER_SPEED_ORDER: TransferSpeed[] = [
  "instant",
  "fast",
  "multi-day",
  "unknown",
];

// ─── Transfer fee bracket ────────────────────────────────────────────────────
//
// Same money-movement scope as inferTransferSpeed. Looks at the headline
// fee metric and buckets into free / paid. A provider that offers a free
// tier alongside paid tiers ("Free – 1.5%") qualifies as "free" since the
// user's question is "can I send without paying a fee?", not "is every
// rail free?". The binary keeps the filter pill compact (one toggle in
// the row, not a three-bucket dropdown).

export type TransferFeeBracket = "free" | "paid";

const TRANSFER_CATEGORIES = new Set([
  "transfers",
  "exchange",
  "remittance",
]);

function transferFeeMetric(offer: MarketplaceOffer) {
  return offer.metrics.find((m) => /\bfee\b/i.test(m.label));
}

export function isTransferFree(offer: MarketplaceOffer): boolean {
  if (!TRANSFER_CATEGORIES.has(offer.category)) return false;
  const m = transferFeeMetric(offer);
  if (!m) return false;
  const v = m.value.toLowerCase();
  // Explicit "free" wording wins (covers "Free", "Free – 1.5%",
  // "Free (SEPA)", "Free (>1k)", etc.).
  if (/\bfree\b/.test(v)) return true;
  // "EUR 0", "USD 0", "0 EUR", "0%" with no other non-zero percent.
  if (/\b(eur|usd|gbp|chf)\s*0\b/.test(v)) return true;
  if (/\b0\s*(eur|usd|gbp|chf)\b/.test(v)) return true;
  if (/^\s*0\s*%/.test(v) && !/[1-9]\s*%/.test(v.replace(/0\s*%[^%]*/, " "))) {
    return true;
  }
  return false;
}

