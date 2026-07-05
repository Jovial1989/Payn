import type { MarketplaceOffer } from "@payn/types";
import { rankOffer } from "@/features/marketplace/offer-ranking";

interface VerdictBarProps {
  offer: MarketplaceOffer;
  categoryMarket: MarketplaceOffer[];
}

// ─── VerdictBar ────────────────────────────────────────────────────────────────
//
// A small 3-cell horizontal panel that sits under the PDP hero metric and
// answers the question "is this actually good?" in plain English. Killer
// addition over the v1 PDP which only stated a number ("Up to 1%") without
// context — the user audit explicitly called this out.
//
// Three cells:
//   1. PAYN SCORE — 0-100 + 6-segment bar + "verified" check when typed
//      attributes drove the score (same component family as the catalogue
//      row, so the language reads consistent across surfaces).
//   2. WHERE THIS RANKS — plain text percentile, e.g. "5th of 28 cards on
//      cost · cheaper than 23 cards." Computed from the same ranking helper.
//   3. ELIGIBILITY — country availability + the most actionable attribute
//      we have (currently country only — eligibility-by-income etc. is
//      future work once we capture those fields on the offer).
//
// Renders nothing when fewer than two siblings exist in the market — there
// is no meaningful percentile from a single offer.
export function VerdictBar({ offer, categoryMarket }: VerdictBarProps) {
  if (categoryMarket.length < 2) return null;

  const sameCategory = categoryMarket.filter((o) => o.category === offer.category);
  if (sameCategory.length < 2) return null;

  const ranking = rankOffer(offer, sameCategory);

  // Plain-English position. We compute the rank index by sorting siblings
  // by score (when typed) or by best-rank-count (fallback). Tie-breaks
  // alphabetically by slug so the displayed rank is stable across renders.
  const scoredSiblings = sameCategory
    .map((o) => ({
      slug: o.slug,
      score: rankOffer(o, sameCategory).score ?? -1,
    }))
    .sort((a, b) => (b.score - a.score) || a.slug.localeCompare(b.slug));
  const position = scoredSiblings.findIndex((s) => s.slug === offer.slug) + 1;
  const totalRanked = scoredSiblings.filter((s) => s.score >= 0).length;
  const beatenCount = Math.max(0, totalRanked - position);

  const ordinal = ordinalString(position);
  const categoryLabel = humanCategory(offer.category, sameCategory.length);

  // Country eligibility. "EU"/"ALL" → pan-European; otherwise list the
  // first three country codes uppercased.
  const eligibility = readableEligibility(offer.countryCodes);

  // When there is no market-best award to announce, we drop the cell
  // entirely rather than print "No standout — solid all-rounder" under
  // an "Award" eyebrow. Reading "Award: nothing" demotivates the user
  // and contradicts the eyebrow — the cell should only appear when it
  // has something concrete to celebrate.
  const hasAward = Boolean(ranking.award);

  return (
    <div
      className={`grid gap-px overflow-hidden rounded-2xl border border-line bg-line ${
        hasAward ? "lg:grid-cols-3" : "lg:grid-cols-2"
      }`}
    >
      {hasAward && (
        <div className="bg-white p-4">
          <p className="eyebrow-cap" data-tone="emerald">
            Award
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent-emerald px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-white shadow-[0_4px_12px_rgba(15,138,75,0.22)]">
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M5 0.5l1.2 2.5 2.8.4-2 2 .5 2.8L5 6.9 2.5 8.2l.5-2.8-2-2 2.8-.4L5 .5z" fill="currentColor" />
            </svg>
            {ranking.award}
          </p>
          <p className="mt-3 text-[12px] leading-snug text-ink-secondary">
            Market-best on a single typed metric across this category.
          </p>
        </div>
      )}

      {/* ── Cell 2: Where this ranks ── */}
      <div className="bg-white p-4">
        <p className="eyebrow-cap">Where this ranks</p>
        {totalRanked > 1 ? (
          <>
            <p className="mt-2 text-[1.5rem] font-extrabold tabular-nums tracking-tight-2 text-ink">
              {ordinal}
              <span className="ml-1 text-base text-ink-tertiary">
                of {totalRanked}
              </span>
            </p>
            <p className="mt-2 text-[12px] leading-snug text-ink-secondary">
              {beatenCount > 0
                ? `Better than ${beatenCount} ${categoryLabel} on cost.`
                : `Behind every other ${categoryLabel} in this market.`}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-ink-tertiary">
            One of a kind in this market.
          </p>
        )}
      </div>

      {/* ── Cell 3: Eligibility ── */}
      <div className="bg-white p-4">
        <p className="eyebrow-cap">Where you can apply</p>
        <p className="mt-2 text-[1rem] font-bold tracking-tight-1 text-ink">
          {eligibility.headline}
        </p>
        <p className="mt-2 text-[12px] leading-snug text-ink-secondary">
          {eligibility.body}
        </p>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ordinalString(n: number): string {
  if (n <= 0) return "—";
  const s = ["th", "st", "nd", "rd"] as const;
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

const CATEGORY_NOUN: Record<string, [string, string]> = {
  cards:       ["card", "cards"],
  debit:       ["debit card", "debit cards"],
  travel:      ["travel card", "travel cards"],
  cashback:    ["cashback card", "cashback cards"],
  loans:       ["loan", "loans"],
  bnpl:        ["plan", "plans"],
  transfers:   ["transfer service", "transfer services"],
  exchange:    ["exchange", "exchanges"],
  remittance:  ["remittance service", "remittance services"],
  banking:     ["account", "accounts"],
  neobanks:    ["neobank", "neobanks"],
  wallets:     ["wallet", "wallets"],
  savings:     ["savings option", "savings options"],
  investments: ["platform", "platforms"],
  trading:     ["platform", "platforms"],
  crypto:      ["exchange", "exchanges"],
  insurance:   ["policy", "policies"],
  business:    ["business account", "business accounts"],
  payroll:     ["service", "services"],
  tax:         ["tool", "tools"],
  expense:     ["tool", "tools"],
  budgeting:   ["app", "apps"],
  kids:        ["product", "products"],
};

function humanCategory(category: string, count: number): string {
  const [singular, plural] = CATEGORY_NOUN[category] ?? ["product", "products"];
  return count === 1 ? singular : plural;
}

const COUNTRY_NAMES: Record<string, string> = {
  AT: "Austria", BE: "Belgium", BG: "Bulgaria", CH: "Switzerland",
  CY: "Cyprus",  CZ: "Czechia", DE: "Germany",  DK: "Denmark",
  EE: "Estonia", ES: "Spain",   FI: "Finland",  FR: "France",
  GR: "Greece",  HR: "Croatia", HU: "Hungary",  IE: "Ireland",
  IS: "Iceland", IT: "Italy",   LT: "Lithuania", LU: "Luxembourg",
  LV: "Latvia",  MT: "Malta",   NL: "Netherlands", NO: "Norway",
  PL: "Poland",  PT: "Portugal", RO: "Romania",
  SE: "Sweden",  SI: "Slovenia", SK: "Slovakia",
  UK: "United Kingdom", GB: "United Kingdom",
};

function readableEligibility(countryCodes: string[]): {
  headline: string;
  body: string;
} {
  if (countryCodes.includes("EU") || countryCodes.includes("ALL")) {
    return {
      headline: "Pan-European",
      body: "Available across the EU and EEA.",
    };
  }
  const upper = countryCodes.map((c) => c.toUpperCase());
  if (upper.length === 1) {
    return {
      headline: COUNTRY_NAMES[upper[0]] ?? upper[0],
      body: "Single-market product — check residency rules before applying.",
    };
  }
  const first = upper.slice(0, 3).map((c) => COUNTRY_NAMES[c] ?? c);
  const extra = upper.length - first.length;
  return {
    headline: first.join(" · "),
    body:
      extra > 0
        ? `Plus ${extra} more ${extra === 1 ? "market" : "markets"} in Europe.`
        : "Eligibility limited to the listed markets.",
  };
}
