import type { MarketplaceOffer, MarketplaceOfferAttributes } from "@payn/types";
import type { InsuranceSubtype } from "./insurance-subtypes";

// ─── Subtype-specific filters for Insurance ───────────────────────────────────
//
// Once the user picks an insurance subtype (Health / Travel / Life / Auto /
// Device), the remaining 5–15 offers still differ on the questions a
// buyer actually asks: "is this worldwide cover?" / "does my 90-day trip
// fit?" / "what's the premium tier?". This file exposes a set of sub-
// filters per subtype, reading typed attributes from the offer where
// possible and falling back to bestFor scanning for the rare offer with
// no structured data yet.
//
// One filter == one FilterSheet pill in the UI. Filters are conservative
// — we never invent buckets that don't have at least one matching offer
// in the current market (the caller does the empty-bucket pruning).

export interface InsuranceSubFilterOption {
  value: string;
  label: string;
  test: (offer: MarketplaceOffer) => boolean;
}

export interface InsuranceSubFilter {
  key: string;
  label: string;
  options: InsuranceSubFilterOption[];
}

const attrs = (o: MarketplaceOffer): MarketplaceOfferAttributes =>
  (o.attributes ?? {}) as MarketplaceOfferAttributes;

// Generic predicate for numeric range over a typed attribute field. Returns
// false when the attribute is absent so the filter only narrows down to
// offers we can actually classify (a missing field is not the same as a
// matching field).
function inNumericRange(
  field: keyof MarketplaceOfferAttributes,
  min: number | null,
  max: number | null,
): (o: MarketplaceOffer) => boolean {
  return (o) => {
    const v = attrs(o)[field];
    if (typeof v !== "number") return false;
    if (min !== null && v < min) return false;
    if (max !== null && v > max) return false;
    return true;
  };
}

// ── Health ────────────────────────────────────────────────────────────────────
const HEALTH_FILTERS: InsuranceSubFilter[] = [
  {
    key: "health-coverage-area",
    label: "Coverage area",
    options: [
      {
        value: "worldwide",
        label: "Worldwide",
        test: (o) => attrs(o).regionCoverage === "worldwide",
      },
      {
        value: "regional",
        label: "Regional / EU",
        test: (o) =>
          attrs(o).regionCoverage === "regional" ||
          attrs(o).regionCoverage === "eu",
      },
    ],
  },
  {
    key: "health-premium",
    label: "Monthly premium",
    options: [
      {
        value: "under-50",
        label: "Under €50",
        test: inNumericRange("priceAmount", null, 49.99),
      },
      {
        value: "50-100",
        label: "€50 – €100",
        test: inNumericRange("priceAmount", 50, 100),
      },
      {
        value: "over-100",
        label: "Over €100",
        test: inNumericRange("priceAmount", 100.01, null),
      },
    ],
  },
];

// ── Travel ────────────────────────────────────────────────────────────────────
const TRAVEL_FILTERS: InsuranceSubFilter[] = [
  {
    key: "travel-trip-length",
    label: "Trip length",
    options: [
      {
        value: "short",
        label: "Up to 30 days",
        test: inNumericRange("maxTripDays", null, 30),
      },
      {
        value: "medium",
        label: "30 – 90 days",
        test: inNumericRange("maxTripDays", 31, 90),
      },
      {
        value: "long",
        label: "90+ days",
        test: inNumericRange("maxTripDays", 91, null),
      },
      {
        value: "rolling",
        label: "Rolling monthly",
        // Nomad / SafetyWing style policies — no maxTripDays, billed per
        // 4-week cycle. Detect by either typed subtype or copy.
        test: (o) => {
          const a = attrs(o);
          if (a.subtype === "nomad") return true;
          const hay = `${o.title ?? ""} ${(o.bestFor ?? []).join(" ")}`;
          return /\b(rolling|monthly\s+renewal|nomad)\b/i.test(hay);
        },
      },
    ],
  },
  {
    key: "travel-activity",
    label: "Activity",
    options: [
      {
        value: "basic",
        label: "Standard",
        test: (o) => attrs(o).activityLevel === "basic",
      },
      {
        value: "adventure",
        label: "Adventure / Sports",
        test: (o) => attrs(o).activityLevel === "extreme",
      },
    ],
  },
  {
    key: "travel-medical",
    label: "Medical cover",
    options: [
      {
        value: "under-500k",
        label: "Up to €500K",
        test: inNumericRange("medicalCoverage", null, 500_000),
      },
      {
        value: "500k-2m",
        label: "€500K – €2M",
        test: inNumericRange("medicalCoverage", 500_001, 2_000_000),
      },
      {
        value: "over-2m",
        label: "Over €2M",
        test: inNumericRange("medicalCoverage", 2_000_001, null),
      },
    ],
  },
];

// ── Life ──────────────────────────────────────────────────────────────────────
const LIFE_FILTERS: InsuranceSubFilter[] = [
  {
    key: "life-insured-amount",
    label: "Insured amount",
    options: [
      {
        value: "under-100k",
        label: "Up to €100K",
        test: inNumericRange("coverageAmount", null, 100_000),
      },
      {
        value: "100k-500k",
        label: "€100K – €500K",
        test: inNumericRange("coverageAmount", 100_001, 500_000),
      },
      {
        value: "over-500k",
        label: "Over €500K",
        test: inNumericRange("coverageAmount", 500_001, null),
      },
    ],
  },
  {
    key: "life-family",
    label: "Family cover",
    options: [
      {
        value: "family",
        label: "Includes family",
        test: (o) =>
          (o.bestFor ?? []).some((b) => /\bfamily\b/i.test(b)) ||
          /\bfamily\b/i.test(o.title ?? ""),
      },
      {
        value: "single",
        label: "Individual only",
        test: (o) =>
          !(o.bestFor ?? []).some((b) => /\bfamily\b/i.test(b)) &&
          !/\bfamily\b/i.test(o.title ?? ""),
      },
    ],
  },
];

// ── Auto ──────────────────────────────────────────────────────────────────────
const AUTO_FILTERS: InsuranceSubFilter[] = [
  {
    key: "auto-liability",
    label: "Liability cover",
    options: [
      {
        value: "under-25m",
        label: "Up to €25M",
        test: inNumericRange("coverageAmount", null, 25_000_000),
      },
      {
        value: "25m-75m",
        label: "€25M – €75M",
        test: inNumericRange("coverageAmount", 25_000_001, 75_000_000),
      },
      {
        value: "over-75m",
        label: "Over €75M",
        test: inNumericRange("coverageAmount", 75_000_001, null),
      },
    ],
  },
];

// ── Device ────────────────────────────────────────────────────────────────────
const DEVICE_FILTERS: InsuranceSubFilter[] = [
  {
    key: "device-value",
    label: "Device value",
    options: [
      {
        value: "under-1k",
        label: "Up to €1,000",
        test: inNumericRange("coverageAmount", null, 1000),
      },
      {
        value: "1k-3k",
        label: "€1,000 – €3,000",
        test: inNumericRange("coverageAmount", 1001, 3000),
      },
      {
        value: "over-3k",
        label: "Over €3,000",
        test: inNumericRange("coverageAmount", 3001, null),
      },
    ],
  },
];

const BY_SUBTYPE: Record<InsuranceSubtype, InsuranceSubFilter[]> = {
  health: HEALTH_FILTERS,
  travel: TRAVEL_FILTERS,
  life: LIFE_FILTERS,
  auto: AUTO_FILTERS,
  device: DEVICE_FILTERS,
  home: [],
  other: [],
};

export function getInsuranceSubFilters(
  subtype: InsuranceSubtype | "",
): InsuranceSubFilter[] {
  if (!subtype) return [];
  return BY_SUBTYPE[subtype] ?? [];
}

// Returns true when the offer satisfies every active sub-filter. Non-
// insurance rows are ignored upstream — caller passes only insurance.
export function matchesInsuranceSubFilters(
  offer: MarketplaceOffer,
  active: Record<string, string>,
  subtype: InsuranceSubtype | "",
): boolean {
  const filters = getInsuranceSubFilters(subtype);
  for (const f of filters) {
    const selectedValue = active[f.key];
    if (!selectedValue) continue;
    const opt = f.options.find((o) => o.value === selectedValue);
    if (!opt) continue;
    if (!opt.test(offer)) return false;
  }
  return true;
}
