import { callGemini } from "@/lib/gemini-client";

export interface SuggestedLinks {
  suggested_urls: string[];  // 3–5 HTTPS URLs to try, most likely first
  reasoning: string;
}

/**
 * Ask Gemini to suggest corrected product page URLs on the provider's website.
 * Used when the existing affiliate link is dead or points to the wrong page.
 */
export async function suggestCorrectedLinks(offer: {
  title: string;
  subtitle: string;
  category: string;
  providerName: string;
  existingAffiliateLink: string;
  metrics: { label: string; value: string }[];
}): Promise<SuggestedLinks> {
  const metrics = offer.metrics.slice(0, 5).map(m => `${m.label}: ${m.value}`).join("; ");

  const prompt = `You are a fintech researcher. A product offer in our database has a broken or mismatched affiliate link.
Your job is to suggest the most likely correct URL(s) on the provider's official website where this specific product is described.

OFFER DETAILS:
  Provider   : ${offer.providerName}
  Category   : ${offer.category}
  Title      : ${offer.title}
  Description: ${offer.subtitle}
  Key metrics: ${metrics || "none"}
  Broken link: ${offer.existingAffiliateLink}

TASK:
1. Identify the provider's primary domain from the broken link or from the provider name.
2. Determine the product type from category + title + description (e.g. "kids debit card", "business account", "savings ISA").
3. Suggest 4–6 HTTPS URLs where this specific product is most likely described on the provider's website.

URL ideas to try (adapt to the provider's site structure):
- /products/<product-slug>
- /<locale>/<product-slug>  (try /gb/, /uk/, /eu/, /en/, /de/ variants if the broken link was in /us/)
- /personal/<product-type>
- /<product-name-slug>
- /features  →  /personal or /card or /account (if the broken link was a generic /features page)
- If the broken link appears to be US-specific (contains /us/), prefer UK/EU path variants

Return JSON:
{
  "suggested_urls": ["https://...", "https://...", "https://...", "https://..."],
  "reasoning": "1-2 sentences: what product type you inferred and why these paths"
}

Rules:
- Only suggest URLs on the provider's own domain (not affiliate/tracking/redirect URLs)
- All URLs must start with https://
- Most likely URL first
- Return only valid JSON, no markdown`;

  try {
    const raw = await callGemini(prompt);
    const parsed = JSON.parse(raw) as Partial<SuggestedLinks>;
    return {
      suggested_urls: Array.isArray(parsed.suggested_urls)
        ? parsed.suggested_urls
            .filter((u): u is string => typeof u === "string" && u.startsWith("https://"))
            .slice(0, 5)
        : [],
      reasoning: String(parsed.reasoning ?? ""),
    };
  } catch {
    return { suggested_urls: [], reasoning: "Failed to parse Gemini response" };
  }
}

export interface OfferUpdatePayload {
  affiliate_link: string;
  title: string;
  subtitle: string;
  metrics: { label: string; value: string }[];
  attributes: Record<string, unknown>;
  // product_offers.status enum: 'active' = live/published. ("ok" is NOT valid.)
  status: "active";
  changes: string[];  // human-readable list of what changed
  confidence: number; // 0–1
  page_title: string;
}

/**
 * Given a live page's text content, extract updated offer data.
 * Returns a patch object ready to be written to product_offers.
 */
export async function extractOfferUpdateFromPage(
  offer: {
    title: string;
    subtitle: string;
    category: string;
    providerName: string;
    metrics: { label: string; value: string }[];
    attributes: Record<string, unknown>;
  },
  pageText: string,
  newUrl: string,
): Promise<OfferUpdatePayload> {
  const metrics = offer.metrics.map(m => `${m.label}: ${m.value}`).join("; ");
  const attrs = Object.entries(offer.attributes)
    .slice(0, 10)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");

  const prompt = `You are a fintech data engineer updating a product offer record from a live provider page.

CURRENT OFFER IN DATABASE:
  Provider  : ${offer.providerName}
  Category  : ${offer.category}
  Title     : ${offer.title}
  Subtitle  : ${offer.subtitle}
  Metrics   : ${metrics || "none"}
  Attributes: ${attrs || "none"}

LIVE PAGE TEXT (stripped HTML, first 5000 chars):
${pageText.slice(0, 5000)}

Your task: extract updated offer data from the live page.
- Keep title/subtitle concise and accurate to what the page says
- Update metrics to match live values (interest rates, fees, limits, etc.)
- Add any new key attributes visible on the page
- Only change fields where the page clearly shows different info
- List every field you changed in "changes"

Return JSON:
{
  "title": "...",
  "subtitle": "...",
  "metrics": [{"label": "...", "value": "..."}, ...],
  "attributes": {"key": "value", ...},
  "changes": ["Updated APY from 3.5% to 4.1%", "Corrected fee from €2 to €2.99", ...],
  "confidence": 0.85,
  "page_title": "exact title of the page"
}

Rules:
- Return only valid JSON, no markdown
- metrics array: max 8 items, keep existing labels if possible
- attributes object: max 15 keys
- changes: list only actual differences, not re-confirmations
- confidence: 0–1 based on how clearly the page matches this product`;

  try {
    const raw = await callGemini(prompt);
    const parsed = JSON.parse(raw) as Partial<OfferUpdatePayload>;
    return {
      affiliate_link: newUrl,
      title: String(parsed.title ?? offer.title),
      subtitle: String(parsed.subtitle ?? offer.subtitle),
      metrics: Array.isArray(parsed.metrics)
        ? parsed.metrics.slice(0, 8).map(m => ({
            label: String(m.label ?? ""),
            value: String(m.value ?? ""),
          }))
        : offer.metrics,
      attributes: (parsed.attributes && typeof parsed.attributes === "object")
        ? parsed.attributes as Record<string, unknown>
        : offer.attributes,
      status: "active",
      changes: Array.isArray(parsed.changes) ? parsed.changes.map(String) : [],
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
      page_title: String(parsed.page_title ?? ""),
    };
  } catch {
    return {
      affiliate_link: newUrl,
      title: offer.title,
      subtitle: offer.subtitle,
      metrics: offer.metrics,
      attributes: offer.attributes,
      status: "active",
      changes: [],
      confidence: 0,
      page_title: "",
    };
  }
}
