import type {
  MarketplaceOffer,
  MarketplaceMetric,
  MarketplaceCategory,
  MarketplaceOfferAttributes,
} from "@payn/types";

// ─── Why this file exists, twice ──────────────────────────────────────────────
//
// V1 of this helper inferred metric direction by regex on the label
// ("monthly fee" → lower-better, "cashback" → higher-better) and pulled
// numbers out of free-text values with parseFloat. That works for ~60% of
// offers and silently lies on the rest — "From €9/month" parses as 9, the
// midpoint of "EUR 1,000 - 25,000" is meaningless for a loan, and the
// resulting "score" only compares against whatever's visible on the page
// after filters, not the actual market.
//
// V2 rebuilds the score on the typed `offer.attributes` fields the catalogue
// already populates per category — annualFeeAmount, fxFeePercent,
// cashbackPercent, atmFreeLimit, priceAmount, coverageAmount, etc. The
// caller now passes the full category market as `marketContext`, so a card
// labelled "Best fee in class" is best across all 28 cards in the category,
// not just the 6 visible on the current viewport.
//
// Per-category scoring criteria are explicit (see CATEGORY_RULES below).
// Free-text metric parsing survives as a fallback only — it lights the
// per-metric "↓ best / ─ avg" glyph but never feeds the composite score or
// triggers an award ribbon. Awards require typed data we trust.

// ─── Direction + extraction primitives (used by fallback path) ────────────────
type Direction = "lower-is-better" | "higher-is-better" | "unknown";

const DIRECTION_RULES: ReadonlyArray<[RegExp, Direction]> = [
  // Lower-is-better
  [/monthly\s*(fee|premium|cost)/i, "lower-is-better"],
  [/annual\s*fee/i, "lower-is-better"],
  [/transfer\s*fee/i, "lower-is-better"],
  [/(^|\s)fee(\s|$)/i, "lower-is-better"],
  [/spread/i, "lower-is-better"],
  [/(^|\s)fx\b/i, "lower-is-better"],
  [/foreign/i, "lower-is-better"],
  [/conversion/i, "lower-is-better"],
  [/deductible|excess/i, "lower-is-better"],
  [/waiting\s*period/i, "lower-is-better"],
  [/apr|interest|loan\s*rate/i, "lower-is-better"],
  // Higher-is-better
  [/cashback/i, "higher-is-better"],
  [/savings?\s*(rate|p\.a\.|apy|interest)/i, "higher-is-better"],
  [/yield|return/i, "higher-is-better"],
  [/coverage|cover\b|insured/i, "higher-is-better"],
  [/atm.*(free|limit)|free.*atm/i, "higher-is-better"],
  [/currencies|markets|countries/i, "higher-is-better"],
  [/sub[- ]?ibans|cards/i, "higher-is-better"],
  [/assets/i, "higher-is-better"],
];

function metricDirection(label: string): Direction {
  for (const [pattern, dir] of DIRECTION_RULES) {
    if (pattern.test(label)) return dir;
  }
  return "unknown";
}

// "Free" / "0%" / "Up to X" / "From X" / "A - B" / first-number-fallback.
// Used only for the per-metric comparative glyph, not for score or award.
export function extractMetricNumber(value: string): number | null {
  const lower = value.toLowerCase().trim();
  if (/^(free|none|no\s*fee|unlimited|n\/?a)\b/.test(lower)) return 0;
  if (/^0%?$/.test(lower)) return 0;
  const range = lower.match(/(-?\d+[\d,]*\.?\d*)\s*[-–]\s*(-?\d+[\d,]*\.?\d*)/);
  if (range) {
    const a = parseFloat(range[1].replace(/,/g, ""));
    const b = parseFloat(range[2].replace(/,/g, ""));
    if (Number.isFinite(a) && Number.isFinite(b)) return (a + b) / 2;
  }
  const first = lower.match(/(-?\d+[\d,]*\.?\d*)/);
  if (first) {
    const n = parseFloat(first[1].replace(/,/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

// ─── Per-category scoring rules ───────────────────────────────────────────────
//
// Each rule names a typed attribute on offer.attributes, says whether higher
// or lower is better, weights its contribution to the composite score, and
// optionally maps a winning value to a ribbon label.
//
// `label` is the ribbon copy when this offer is the absolute market best on
// this attribute. `null` means "score this but never give it a ribbon".

type AttributeKey = keyof MarketplaceOfferAttributes;

interface ScoringCriterion {
  attr: AttributeKey;
  direction: "lower-is-better" | "higher-is-better";
  weight: number;
  award: string | null;
  /** Optional categorical mapping (e.g. speed = instant/same_day/next_day).
   *  Returns a numeric proxy so the comparator can treat it like any number. */
  ordinal?: (value: unknown) => number | null;
}

const SPEED_ORDINAL = (v: unknown): number | null => {
  switch (v) {
    case "instant":  return 4;
    case "same_day": return 3;
    case "next_day": return 2;
    case "standard": return 1;
    default:         return null;
  }
};

const FEE_PROFILE_ORDINAL = (v: unknown): number | null => {
  switch (v) {
    case "low":     return 3;
    case "medium":  return 2;
    case "premium": return 1;
    default:        return null;
  }
};

// Cards group — covers every card-shaped category that shares the same
// fee/FX/ATM/cashback attribute surface.
const CARD_RULES: ScoringCriterion[] = [
  { attr: "annualFeeAmount", direction: "lower-is-better",  weight: 1.0, award: "Best annual fee" },
  { attr: "fxFeePercent",    direction: "lower-is-better",  weight: 1.2, award: "Best FX" },
  { attr: "atmFreeLimit",    direction: "higher-is-better", weight: 0.6, award: "Best ATM" },
  { attr: "cashbackPercent", direction: "higher-is-better", weight: 0.8, award: "Top cashback" },
];

const INSURANCE_RULES: ScoringCriterion[] = [
  { attr: "priceAmount",      direction: "lower-is-better",  weight: 1.0, award: "Lowest premium" },
  { attr: "coverageAmount",   direction: "higher-is-better", weight: 1.0, award: "Widest cover" },
  { attr: "deductibleAmount", direction: "lower-is-better",  weight: 0.5, award: "Lowest excess" },
  { attr: "maxTripDays",      direction: "higher-is-better", weight: 0.3, award: null },
];

const LOAN_RULES: ScoringCriterion[] = [
  // Loans don't carry typed APR in attributes today — left out of the typed
  // score on purpose. The fallback path scores APR from the metric string
  // and surfaces per-metric glyphs; it just doesn't trigger a ribbon.
  { attr: "maxAmount",     direction: "higher-is-better", weight: 0.6, award: null },
  { attr: "maxTermMonths", direction: "higher-is-better", weight: 0.4, award: null },
  { attr: "speed",         direction: "higher-is-better", weight: 0.8, award: "Fastest funding", ordinal: SPEED_ORDINAL },
  { attr: "feeProfile",    direction: "higher-is-better", weight: 0.8, award: "Lowest fees",     ordinal: FEE_PROFILE_ORDINAL },
];

const TRANSFER_RULES: ScoringCriterion[] = [
  { attr: "speed",      direction: "higher-is-better", weight: 1.0, award: "Fastest delivery", ordinal: SPEED_ORDINAL },
  { attr: "feeProfile", direction: "higher-is-better", weight: 1.0, award: "Lowest fees",      ordinal: FEE_PROFILE_ORDINAL },
];

// Categories without enough typed attributes lean entirely on the fallback
// path. We still want a score there, so we give them an empty rule list and
// the scorer will compute purely from metric parsing.
const EMPTY_RULES: ScoringCriterion[] = [];

const CATEGORY_RULES: Record<MarketplaceCategory, ScoringCriterion[]> = {
  cards:       CARD_RULES,
  debit:       CARD_RULES,
  travel:      CARD_RULES,
  cashback:    CARD_RULES,
  insurance:   INSURANCE_RULES,
  loans:       LOAN_RULES,
  bnpl:        LOAN_RULES,
  transfers:   TRANSFER_RULES,
  exchange:    TRANSFER_RULES,
  remittance:  TRANSFER_RULES,
  // Below: typed rules don't apply yet — fall back to metric-string scoring.
  banking:     EMPTY_RULES,
  neobanks:    EMPTY_RULES,
  wallets:     EMPTY_RULES,
  savings:     EMPTY_RULES,
  investments: EMPTY_RULES,
  trading:     EMPTY_RULES,
  crypto:      EMPTY_RULES,
  business:    EMPTY_RULES,
  payroll:     EMPTY_RULES,
  tax:         EMPTY_RULES,
  expense:     EMPTY_RULES,
  budgeting:   EMPTY_RULES,
  kids:        EMPTY_RULES,
};

// ─── Reading + ranking primitives ────────────────────────────────────────────
type AttrNumber = number | null;

function readAttr(
  offer: MarketplaceOffer,
  criterion: ScoringCriterion,
): AttrNumber {
  const raw = offer.attributes?.[criterion.attr];
  if (raw == null) return null;
  if (criterion.ordinal) return criterion.ordinal(raw);
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export type MetricRank = "best" | "good" | "avg" | "worst" | "unknown";

function rankWithin(
  ourValue: number,
  others: number[],
  direction: "lower-is-better" | "higher-is-better",
): MetricRank {
  if (others.length < 2) return "unknown";
  const sorted = [...others].sort((a, b) =>
    direction === "lower-is-better" ? a - b : b - a,
  );
  const bestValue = sorted[0];
  const isBest =
    direction === "lower-is-better"
      ? ourValue <= bestValue + Number.EPSILON
      : ourValue >= bestValue - Number.EPSILON;
  if (isBest) return "best";
  const position = sorted.indexOf(ourValue);
  if (position < 0) return "unknown";
  const percentile = position / Math.max(1, sorted.length - 1);
  if (percentile <= 0.33) return "good";
  if (percentile <= 0.66) return "avg";
  return "worst";
}

const RANK_POINTS: Record<MetricRank, number | null> = {
  best:    100,
  good:    72,
  avg:     50,
  worst:   18,
  unknown: null,
};

// ─── Output type ─────────────────────────────────────────────────────────────
export interface OfferRanking {
  /** 0-100 composite. null when nothing rankable existed. */
  score: number | null;
  /** True when the score draws on at least one typed attribute (not just
   *  regex parsing). Powers the "verified score" badge on the row. */
  trusted: boolean;
  /** Per-metric rank for the glyph under each value. Keyed by metric label
   *  exactly as it appears on offer.metrics. */
  metricRanks: Record<string, MetricRank>;
  /** Single award when this offer is the outright market best on a
   *  high-value typed attribute. Free-text fallback never produces awards. */
  award: string | null;
}

// ─── Main entrypoint ─────────────────────────────────────────────────────────
//
// `marketContext` MUST be the full category market the offer competes in,
// not the filtered visible list. Passing the filtered list will produce
// scores like "best of 3" which is useless.
export function rankOffer(
  offer: MarketplaceOffer,
  marketContext: MarketplaceOffer[],
): OfferRanking {
  const sameCategory = marketContext.filter((o) => o.category === offer.category);
  const rules = CATEGORY_RULES[offer.category] ?? EMPTY_RULES;

  // ── Typed-attribute pass ──────────────────────────────────────────────
  const typedContributions: Array<{ points: number; weight: number }> = [];
  let bestAwardLabel: string | null = null;
  let bestAwardWeight = -Infinity;

  for (const criterion of rules) {
    const ourValue = readAttr(offer, criterion);
    if (ourValue === null) continue;

    const siblingValues: number[] = [];
    for (const sibling of sameCategory) {
      const v = readAttr(sibling, criterion);
      if (v !== null) siblingValues.push(v);
    }
    if (siblingValues.length < 2) continue;

    const rank = rankWithin(ourValue, siblingValues, criterion.direction);
    const points = RANK_POINTS[rank];
    if (points === null) continue;
    typedContributions.push({ points, weight: criterion.weight });

    if (rank === "best" && criterion.award && criterion.weight > bestAwardWeight) {
      bestAwardLabel = criterion.award;
      bestAwardWeight = criterion.weight;
    }
  }

  // ── Free-text fallback for per-metric glyphs (and score backup) ───────
  const metricRanks: Record<string, MetricRank> = {};
  const fallbackContributions: number[] = [];

  // Build label → numbers across siblings once.
  const valuesByLabel = new Map<string, number[]>();
  for (const sibling of sameCategory) {
    for (const metric of sibling.metrics) {
      const direction = metricDirection(metric.label);
      if (direction === "unknown") continue;
      const n = extractMetricNumber(metric.value);
      if (n === null) continue;
      const list = valuesByLabel.get(metric.label) ?? [];
      list.push(n);
      valuesByLabel.set(metric.label, list);
    }
  }

  offer.metrics.forEach((metric: MarketplaceMetric) => {
    const direction = metricDirection(metric.label);
    if (direction === "unknown") {
      metricRanks[metric.label] = "unknown";
      return;
    }
    const ourValue = extractMetricNumber(metric.value);
    if (ourValue === null) {
      metricRanks[metric.label] = "unknown";
      return;
    }
    const others = valuesByLabel.get(metric.label) ?? [];
    const rank = rankWithin(ourValue, others, direction);
    metricRanks[metric.label] = rank;

    // Feed fallback score ONLY when typed-attribute pass produced nothing
    // for this offer — otherwise we'd double-count the same signal.
    if (typedContributions.length === 0) {
      const points = RANK_POINTS[rank];
      if (points !== null) fallbackContributions.push(points);
    }
  });

  // ── Resolve composite score ───────────────────────────────────────────
  let score: number | null = null;
  let trusted = false;

  if (typedContributions.length > 0) {
    const totalWeight = typedContributions.reduce((sum, c) => sum + c.weight, 0);
    const weighted = typedContributions.reduce(
      (sum, c) => sum + c.points * c.weight,
      0,
    );
    score = Math.round(weighted / Math.max(0.0001, totalWeight));
    trusted = true;
  } else if (fallbackContributions.length > 0) {
    score = Math.round(
      fallbackContributions.reduce((sum, n) => sum + n, 0) /
        fallbackContributions.length,
    );
    trusted = false;
  }

  return {
    score,
    trusted,
    metricRanks,
    award: bestAwardLabel,
  };
}

// ─── Score → segments ────────────────────────────────────────────────────────
//
// Maps a 0-100 score to how many of the 6 score-bar segments should be lit.
export function scoreToSegments(score: number): number {
  const clamped = Math.max(0, Math.min(100, score));
  return Math.round((clamped / 100) * 6);
}
