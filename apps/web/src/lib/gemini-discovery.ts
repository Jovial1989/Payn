import type { MarketplaceCategory } from "@payn/types";
import { callGemini, extractJson } from "@/lib/gemini-client";

// ─── Gemini research for offer discovery ─────────────────────────────────────
//
// Two jobs:
//   • researchProgramOffer  — turn a FinanceAds program we're partnered with
//                             into a structured catalog offer (provider, domain,
//                             category, conditions).
//   • discoverMarketOffers  — surface real providers in a category we don't yet
//                             list, for review/monetisation.
//
// Guardrail: financial terms must be conservative. We tell Gemini to prefer
// ranges / qualitative values over invented precise numbers, and we never
// auto-publish anything below a high confidence bar (enforced by the caller).

const CATEGORIES: MarketplaceCategory[] = [
  "loans", "cards", "banking", "transfers", "exchange", "insurance",
  "investments", "crypto", "business", "budgeting", "kids", "savings",
  "trading", "bnpl", "debit", "remittance", "travel", "cashback",
  "wallets", "payroll", "tax", "expense", "neobanks",
];

export type GeminiOfferDraft = {
  providerName: string;
  providerDomain: string; // bare domain, e.g. "wise.com"
  category: MarketplaceCategory;
  title: string;
  subtitle: string;
  countryCodes: string[];
  metrics: { label: string; value: string }[];
  bestFor: string[];
  searchTags: string[];
  confidence: number; // 0–1
  reasoning: string;
};

const CONDITIONS_RULES = `
RULES FOR FINANCIAL DATA (important — this is a regulated comparison site):
- Do NOT invent precise rates, fees or APRs. If you are not confident of an exact
  current figure, use a qualitative value ("low FX fees", "no monthly fee") or a
  range, or omit that metric. Never fabricate a number.
- countryCodes: ISO-3166 alpha-2 UPPERCASE (e.g. "GB", "DE", "FR"), or "EU" for
  pan-European, or "INTERNATIONAL". Use what genuinely applies.
- category MUST be exactly one of: ${CATEGORIES.join(", ")}.
- providerDomain: the provider's real primary website domain only (no path,
  no tracking/affiliate domain), e.g. "revolut.com".
- confidence (0–1): how sure you are this provider + product + domain are correct
  and current. Be honest; 0.5 if unsure.

SEARCH FIRST (grounding is enabled): Use Google Search to confirm every provider
actually exists, is still operating, and serves the stated market. Take the
providerDomain from the real search results — never guess it. Do NOT invent
providers or domains; if search doesn't confirm one, leave it out. A wrong or
dead domain is worse than fewer results.

- Return the JSON object/array. Prose around it is tolerated, but the JSON must be valid.`;

function sanitizeDraft(raw: unknown): GeminiOfferDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const providerName = String(o.providerName ?? "").trim();
  const providerDomain = String(o.providerDomain ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
  const category = String(o.category ?? "") as MarketplaceCategory;
  if (!providerName || !providerDomain) return null;
  if (!CATEGORIES.includes(category)) return null;

  const toStrArray = (v: unknown, max: number) =>
    Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean).slice(0, max) : [];

  const metrics = Array.isArray(o.metrics)
    ? (o.metrics as unknown[])
        .map((m) => {
          const mm = (m ?? {}) as Record<string, unknown>;
          return { label: String(mm.label ?? "").trim(), value: String(mm.value ?? "").trim() };
        })
        .filter((m) => m.label && m.value)
        .slice(0, 6)
    : [];

  return {
    providerName,
    providerDomain,
    category,
    title: String(o.title ?? providerName).trim().slice(0, 120),
    subtitle: String(o.subtitle ?? "").trim().slice(0, 320),
    countryCodes: toStrArray(o.countryCodes, 8).map((c) => c.toUpperCase()),
    metrics,
    bestFor: toStrArray(o.bestFor, 4),
    searchTags: toStrArray(o.searchTags, 8).map((t) => t.toLowerCase()),
    confidence: Math.min(1, Math.max(0, Number(o.confidence) || 0)),
    reasoning: String(o.reasoning ?? "").slice(0, 400),
  };
}

/** Turn one FinanceAds program into a structured catalog offer draft. */
export async function researchProgramOffer(input: {
  programName: string;
  country: string | null;
  commission: string;
  descriptionShort: string | null;
}): Promise<GeminiOfferDraft | null> {
  const prompt = `You are a fintech catalog researcher for a European money-comparison site.
We hold an affiliate partnership (via the FinanceAds network) with the program below.
Identify the REAL provider behind it and produce a structured product offer.

FINANCEADS PROGRAM:
  Name        : ${input.programName}
  Country     : ${input.country ?? "unknown"}
  Commission  : ${input.commission}
  Description : ${input.descriptionShort ?? "none"}

Note: program names often carry network suffixes like "INT", "International", or a
country code — strip those to find the real brand (e.g. "Wise International" → Wise,
"GoHenry UK" → GoHenry, "Hilton Honors Debit Card" → Hilton).

Return JSON:
{
  "providerName": "...",
  "providerDomain": "brand.com",
  "category": "one of the allowed categories",
  "title": "concise product name",
  "subtitle": "1-2 sentence plain-English description of the product",
  "countryCodes": ["GB","EU"],
  "metrics": [{"label":"FX fee","value":"from 0.41%"}],
  "bestFor": ["...", "..."],
  "searchTags": ["...","..."],
  "confidence": 0.0,
  "reasoning": "1 sentence: who this is and why this category"
}
${CONDITIONS_RULES}`;

  try {
    const parsed = extractJson(await callGemini(prompt, { maxOutputTokens: 1500, grounding: true }));
    return sanitizeDraft(parsed);
  } catch {
    return null;
  }
}

/** Surface real providers in a category we don't yet list. */
export async function discoverMarketOffers(input: {
  category: MarketplaceCategory;
  country: string;
  existingProviders: string[];
  limit?: number;
}): Promise<GeminiOfferDraft[]> {
  const limit = Math.min(Math.max(input.limit ?? 6, 1), 12);
  const exclusion = input.existingProviders.slice(0, 200).join(", ") || "none";
  const prompt = `You are a fintech catalog researcher for a European money-comparison site.
List up to ${limit} REAL, currently-operating providers offering "${input.category}" products
available to consumers in ${input.country === "EU" ? "Europe" : input.country}.

EXCLUDE any provider already in our catalog (do not return these): ${exclusion}

Only include providers that genuinely exist and have a live public website right now.
Quality over quantity — return fewer if you are unsure.

Return JSON:
{
  "offers": [
    {
      "providerName": "...",
      "providerDomain": "brand.com",
      "category": "${input.category}",
      "title": "concise product name",
      "subtitle": "1-2 sentence plain-English description",
      "countryCodes": ["${input.country}"],
      "metrics": [{"label":"...","value":"..."}],
      "bestFor": ["...","..."],
      "searchTags": ["...","..."],
      "confidence": 0.0,
      "reasoning": "1 sentence"
    }
  ]
}
${CONDITIONS_RULES}`;

  try {
    const parsed = extractJson(await callGemini(prompt, { maxOutputTokens: 3000, grounding: true }));
    const offers = Array.isArray((parsed as { offers?: unknown[] })?.offers)
      ? (parsed as { offers: unknown[] }).offers
      : Array.isArray(parsed)
        ? (parsed as unknown[])
        : [];
    return offers.map(sanitizeDraft).filter((d): d is GeminiOfferDraft => d !== null);
  } catch {
    return [];
  }
}

/**
 * Self-correction: a proposed URL for `providerName` failed verification
 * (`reason`). Ask grounded Gemini for the correct, currently-working official
 * URL — searched, not guessed. The caller MUST still verify the returned URL.
 */
export async function correctProviderUrl(input: {
  providerName: string;
  providerDomain: string;
  category: string;
  badUrl: string;
  reason: string;
}): Promise<string | null> {
  const prompt = `Use Google Search. We link users to "${input.providerName}" (${input.category}) but this URL is broken (${input.reason}):
  ${input.badUrl}
Provider's official domain: ${input.providerDomain || "find it"}

Find the SINGLE best currently-working public URL on ${input.providerName}'s OWN official website for this product — or their homepage if no stable product page exists. Confirm it via search; do not guess.

Return JSON only: {"url":"https://...","confidence":0.0}
- https only, on the provider's own official domain (no tracking/affiliate/redirect domains).
- If search can't confirm a working URL, return {"url":"","confidence":0}.`;
  try {
    const parsed = extractJson(await callGemini(prompt, { maxOutputTokens: 600, grounding: true })) as
      | { url?: string }
      | null;
    const url = String(parsed?.url ?? "").trim();
    return url.startsWith("https://") ? url : null;
  } catch {
    return null;
  }
}
