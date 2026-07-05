import { env } from "@/lib/env";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export interface ReconcileVerdict {
  match: boolean;
  confidence: number; // 0–1
  page_title: string;
  issues: string[];
  suggested_status: "ok" | "needs_review" | "archived";
}

/**
 * Ask Gemini to compare an offer record against the live page content
 * scraped from the affiliate link. Returns a structured verdict.
 */
export async function reconcileOfferWithPage(
  offer: {
    title: string;
    subtitle: string;
    category: string;
    providerName: string;
    affiliateLink: string;
    metrics: { label: string; value: string }[];
    attributes: Record<string, unknown>;
  },
  pageText: string,
): Promise<ReconcileVerdict> {
  if (!env.geminiApiKey) throw new Error("GEMINI_API_KEY not configured");

  const prompt = buildPrompt(offer, pageText);

  // SEC-FIX PAYN-009: API key moved from URL query param to header (avoids log exposure)
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.geminiApiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 600,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

  try {
    const parsed = JSON.parse(raw) as Partial<ReconcileVerdict>;
    const match = Boolean(parsed.match);
    return {
      match,
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
      page_title: String(parsed.page_title ?? ""),
      issues: Array.isArray(parsed.issues) ? parsed.issues.slice(0, 6).map(String) : [],
      suggested_status:
        parsed.suggested_status === "archived"
          ? "archived"
          : match
            ? "ok"
            : "needs_review",
    };
  } catch {
    return {
      match: false,
      confidence: 0,
      page_title: "",
      issues: ["Could not parse Gemini response"],
      suggested_status: "needs_review",
    };
  }
}

function buildPrompt(
  offer: {
    title: string;
    subtitle: string;
    category: string;
    providerName: string;
    affiliateLink: string;
    metrics: { label: string; value: string }[];
    attributes: Record<string, unknown>;
  },
  pageText: string,
): string {
  const metrics = offer.metrics.map((m) => `${m.label}: ${m.value}`).join("; ");
  const attrs = Object.entries(offer.attributes)
    .slice(0, 10)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");

  return `You are a fintech data quality auditor. Verify whether the product offer stored in our database matches the actual product page on the provider's website.

OFFER IN DATABASE:
  Provider : ${offer.providerName}
  Category : ${offer.category}
  Title    : ${offer.title}
  Subtitle : ${offer.subtitle}
  Link     : ${offer.affiliateLink}
  Metrics  : ${metrics || "none"}
  Attributes: ${attrs || "none"}

LIVE PAGE TEXT (stripped HTML, first 4500 chars):
${pageText.slice(0, 4500)}

Return a single JSON object with these fields:
  "match"            : boolean — true if the page describes the same product
  "confidence"       : number 0–1 — certainty of your verdict
  "page_title"       : string — what product/page the URL actually shows
  "issues"           : string[] — specific discrepancies found
                       e.g. ["Fee raised from €2.99 to €3.49",
                              "Page shows Business account, not Personal",
                              "Product discontinued / redirected to homepage"]
  "suggested_status" : "ok" | "needs_review" | "archived"
                       Use "archived" if the page 404s or product is gone.

Rules:
  - Be specific in issues; reference exact numbers/names when possible.
  - If the page is a generic homepage or error page, set match=false and suggested_status="needs_review".
  - Return only valid JSON. No markdown, no explanation outside the JSON.`;
}
