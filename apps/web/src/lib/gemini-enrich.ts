import { env } from "@/lib/env";

export interface EnrichmentResult {
  bullets?: string[];
  bestFor?: string[];
  metrics?: { label: string; value: string }[];
}

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function enrichOffer(offer: {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  providerName: string;
  metrics: { label: string; value: string }[];
  bestFor: string[];
}): Promise<EnrichmentResult> {
  if (!env.geminiApiKey) throw new Error("GEMINI_API_KEY not configured");

  const hasBullets = false;
  const hasBestFor = offer.bestFor.length > 0;
  const hasMetrics = offer.metrics.length > 0;

  if (hasBestFor && hasMetrics && !hasBullets) {
    // nothing to do if all non-bullet fields are populated
  }

  const prompt = buildPrompt(offer);

  const res = await fetch(`${GEMINI_URL}?key=${env.geminiApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 512,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

  try {
    const parsed = JSON.parse(raw) as EnrichmentResult;
    return {
      bullets: Array.isArray(parsed.bullets) ? parsed.bullets.slice(0, 5) : undefined,
      bestFor: Array.isArray(parsed.bestFor) ? parsed.bestFor.slice(0, 4) : undefined,
      metrics: Array.isArray(parsed.metrics) ? parsed.metrics.slice(0, 6) : undefined,
    };
  } catch {
    return {};
  }
}

function buildPrompt(offer: {
  title: string;
  subtitle: string;
  category: string;
  providerName: string;
  metrics: { label: string; value: string }[];
  bestFor: string[];
}): string {
  const existingMetrics = offer.metrics.map((m) => `${m.label}: ${m.value}`).join(", ");
  const existingBestFor = offer.bestFor.join(", ");

  return `You are a fintech product analyst. Given the following financial product, return a JSON object with:
- "bullets": array of 3-5 short benefit strings (max 12 words each), factual and specific
- "bestFor": array of 2-4 audience segments (e.g. "Freelancers", "EU residents", "First-time investors") — ONLY if the provided bestFor is empty
- "metrics": array of {label, value} key facts (e.g. APR, fees, limits) — ONLY if provided metrics are empty; max 4 items

Rules:
- Never invent specific numbers you cannot confirm from the product description
- Keep bullets factual: focus on features, not hype
- Return only valid JSON, no markdown, no explanation

Product:
Provider: ${offer.providerName}
Category: ${offer.category}
Title: ${offer.title}
Description: ${offer.subtitle}
Existing metrics: ${existingMetrics || "none"}
Existing bestFor: ${existingBestFor || "none"}`;
}
