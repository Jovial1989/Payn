import { env } from "@/lib/env";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Single entry point for Gemini calls across the app.
 *
 * `grounding: true` turns on Google Search grounding (the `google_search` tool)
 * so the model answers from real, current web results instead of training
 * memory — essential for discovering real offers/links. Grounding can't be
 * combined with forced-JSON mode, so when it's on we drop responseMimeType and
 * the caller must parse leniently with extractJson().
 */
export async function callGemini(
  prompt: string,
  {
    maxOutputTokens = 800,
    temperature = 0.15,
    grounding = false,
  }: { maxOutputTokens?: number; temperature?: number; grounding?: boolean } = {},
): Promise<string> {
  if (!env.geminiApiKey) throw new Error("GEMINI_API_KEY not configured");
  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens,
      // Forced JSON output is incompatible with the search tool; omit it when grounding.
      ...(grounding ? {} : { responseMimeType: "application/json" }),
    },
  };
  if (grounding) body.tools = [{ google_search: {} }];

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.geminiApiKey },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`);
  }
  const data = await res.json();
  // Grounded answers may split text across multiple parts — join them all.
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p: { text?: string }) => p?.text ?? "").join("").trim();
  return text || "{}";
}

/**
 * Tolerant JSON parser for grounded responses (which arrive as prose that may
 * wrap the JSON in ```fences``` or surround it with citation text). Returns the
 * first valid JSON value found, or null.
 */
export function extractJson(raw: string): unknown {
  if (!raw) return null;
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  try {
    return JSON.parse(s);
  } catch {
    /* fall through to brace-matching */
  }
  const start = s.search(/[{[]/);
  if (start < 0) return null;
  const open = s[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    if (s[i] === open) depth++;
    else if (s[i] === close) {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(s.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}
