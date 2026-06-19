import { env } from "@/lib/env";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Single entry point for Gemini calls across the app. Always requests JSON.
 * Callers parse the returned string themselves (and should tolerate `"{}"`).
 */
export async function callGemini(
  prompt: string,
  { maxOutputTokens = 800, temperature = 0.15 }: { maxOutputTokens?: number; temperature?: number } = {},
): Promise<string> {
  if (!env.geminiApiKey) throw new Error("GEMINI_API_KEY not configured");
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.geminiApiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
}
