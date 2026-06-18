import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { env } from "@/lib/env";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// POST /api/admin/push/generate
// Body: { topic, screen?, audience_countries?, audience_languages? }
// Returns: { title, body }
export async function POST(request: Request) {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  if (!env.geminiApiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
  }

  const { topic, screen, audience_countries, audience_languages } = (
    await request.json().catch(() => ({}))
  ) as {
    topic?: string;
    screen?: string;
    audience_countries?: string[];
    audience_languages?: string[];
  };

  if (!topic?.trim()) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  const audienceHint = [
    audience_countries?.length ? `Countries: ${audience_countries.join(", ")}` : null,
    audience_languages?.length ? `Languages: ${audience_languages.join(", ")}` : null,
    screen ? `Opens screen: ${screen}` : null,
  ]
    .filter(Boolean)
    .join(". ");

  const prompt = `You are a copywriter for Payn, a European fintech comparison app (like MoneySupermarket but for Europe).
Write a mobile push notification for this topic: "${topic.trim()}".
${audienceHint ? `Context: ${audienceHint}.` : ""}

Rules:
- Title: max 50 chars, punchy, action-oriented, no clickbait
- Body: max 120 chars, concrete benefit, ends with a soft CTA
- Tone: direct, honest, friendly — never salesy or spammy
- Avoid: emojis, exclamation spam, "amazing deal!", fake urgency
- Output ONLY valid JSON: {"title":"...","body":"..."}`;

  try {
    // SEC-FIX PAYN-A02: API key moved to header — URL params appear in access logs
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.geminiApiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Gemini error: ${err.slice(0, 200)}` }, { status: 502 });
    }

    const data = await res.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip markdown code fences if Gemini wraps in ```json ... ```
    const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as { title?: string; body?: string };

    if (!parsed.title || !parsed.body) {
      return NextResponse.json({ error: "Unexpected Gemini response format" }, { status: 502 });
    }

    return NextResponse.json({
      title: parsed.title.slice(0, 50),
      body: parsed.body.slice(0, 120),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
