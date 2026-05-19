import type { MarketplaceOffer } from "@payn/types";

// ─── Insurance subtype inference ──────────────────────────────────────────────
//
// Insurance is a single MarketplaceCategory but holds wildly different
// products: health, travel, life, auto, device, home. They have different
// metrics (Outpatient/Inpatient for health vs Trip length/Region for travel
// vs Liability/Collision for auto), which is why the catalogue columns
// looked broken — five column shapes were sharing one grid.
//
// Until we add a real `subcategory` field to the schema, infer subtype from
// title + bestFor + subtitle, with a provider-brand fallback for the
// offers whose copy doesn't name the type explicitly (Alan, Bupa, Genki).
//
// Order in PATTERNS matters: more specific keywords first ("device" before
// "auto" so "Device Auto Plan" wouldn't be wrong; "travel" before "health"
// so nomad/expat-travel products don't get classified as health on the
// word "care"). The first matching pattern wins.

export type InsuranceSubtype =
  | "health"
  | "travel"
  | "life"
  | "auto"
  | "device"
  | "home"
  | "other";

const PATTERNS: Array<[InsuranceSubtype, RegExp]> = [
  ["device", /\b(device|phone|laptop|gadget|electronics|tablet)\b/i],
  ["auto", /\b(auto|car|vehicle|motor)\b/i],
  ["home", /\b(home|property|renters?|tenants?|household)\b/i],
  ["life", /\b(life|funeral|term[- ]life|family\s+protection)\b/i],
  [
    "travel",
    /\b(travel|trip|nomad|tourist|abroad|adventure|long[- ]stays?|expat|remote\s+work|cross[- ]border|frequent\s+trips?)\b/i,
  ],
  [
    "health",
    /\b(health|medical|hospital|wellness|primary\s+care|outpatient|inpatient|expat\s+care)\b/i,
  ],
];

// Brand hints for offers whose own copy doesn't name the subtype.
// Conservative — only include providers whose brand is unambiguously a
// single subtype (Alan = health-only French neoinsurer, Bupa Global =
// global health, Genki = travel/expat insurance, Lemonade = home/renters).
const PROVIDER_HINTS: Record<string, InsuranceSubtype> = {
  Alan: "health",
  Bupa: "health",
  "Bupa Global": "health",
  Cigna: "health",
  "Cigna Global": "health",
  Genki: "travel",
  SafetyWing: "travel",
  "World Nomads": "travel",
  Heymondo: "travel",
  Admiral: "travel",
  "Insured Nomads": "travel",
  PassportCard: "travel",
  Lemonade: "home",
};

export function inferInsuranceSubtype(offer: MarketplaceOffer): InsuranceSubtype {
  if (offer.category !== "insurance") return "other";

  const haystack = [
    offer.title ?? "",
    ...(offer.bestFor ?? []),
    offer.subtitle ?? "",
  ].join(" ");

  for (const [subtype, re] of PATTERNS) {
    if (re.test(haystack)) return subtype;
  }

  const hint = PROVIDER_HINTS[offer.providerName];
  if (hint) return hint;

  return "other";
}

export const INSURANCE_SUBTYPE_LABELS: Record<InsuranceSubtype, string> = {
  health: "Health",
  travel: "Travel",
  life: "Life",
  auto: "Auto",
  device: "Device",
  home: "Home & Property",
  other: "Other",
};

// Display order in the filter UI — most-common first so the dropdown
// reads logically without having to count.
export const INSURANCE_SUBTYPE_ORDER: InsuranceSubtype[] = [
  "health",
  "travel",
  "life",
  "auto",
  "device",
  "home",
  "other",
];
