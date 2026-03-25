import { NextResponse } from "next/server";
import { env } from "@/lib/env";

/* ═══════════════════════════════════════════════
   SYSTEM PROMPT
   ═══════════════════════════════════════════════ */

const SYSTEM_PROMPT = `You are Payn AI, the built-in assistant for Payn - a European financial marketplace.

Payn helps users compare loans, credit cards, money transfers, and currency exchange from regulated European providers.

How to answer:
- Be concise. 2-4 sentences unless the user asks for detail.
- Sound polished, trustworthy, and product-native.
- Explain financial concepts clearly without jargon.
- Never give regulated financial advice. Never say "you should buy" or "I recommend this provider".
- Always suggest the user review full terms on the provider website.
- Never guarantee approval, rates, or outcomes.
- Never invent provider details you are not certain about.
- Avoid bullet-point dumps. Use short paragraphs.
- Avoid generic motivational language.
- If you don't know, say so plainly.

About Payn:
- Offers are ranked by product fit, cost, and provider quality.
- Commission is always disclosed. Compensation does not determine ranking order.
- Categories: loans, credit cards, money transfers, currency exchange.
- Providers include Revolut, Wise, N26, Klarna, bunq, Curve, ING, Santander, and others.
- Available across multiple European markets.`;

/* ═══════════════════════════════════════════════
   FAST-PATH LOCAL ANSWERS
   ═══════════════════════════════════════════════ */

interface FastPathEntry {
  patterns: RegExp[];
  answer: string;
  suggestions: string[];
}

const FAST_PATHS: FastPathEntry[] = [
  {
    patterns: [/what\s+is\s+(an?\s+)?apr/i, /apr\s+mean/i, /explain\s+apr/i],
    answer:
      "APR (Annual Percentage Rate) is the total yearly cost of borrowing, including interest and fees, expressed as a percentage. A lower APR means a cheaper loan. When comparing loans on Payn, APR is one of the key ranking factors.",
    suggestions: ["How do loan fees work?", "What's a good APR?", "Compare loan providers"],
  },
  {
    patterns: [/what\s+is\s+(a\s+)?transfer\s+fee/i, /transfer\s+fees?\s+(work|mean|explain)/i, /how\s+do\s+transfer\s+fees\s+work/i],
    answer:
      "A transfer fee is the charge for sending money internationally. It can be a flat fee, a percentage of the amount, or built into the exchange rate as a markup. On Payn, we show the total cost so you can compare transparently.",
    suggestions: ["Compare transfer providers", "What is a FX spread?", "Cheapest way to send money"],
  },
  {
    patterns: [/what\s+is\s+(a\s+)?(fx|foreign\s+exchange)\s+spread/i, /spread\s+mean/i, /exchange\s+rate\s+markup/i],
    answer:
      "An FX spread is the difference between the mid-market exchange rate and the rate you actually get. It's how many providers make money on currency exchange. A smaller spread means a better deal for you.",
    suggestions: ["Compare exchange rates", "Best exchange providers", "What is mid-market rate?"],
  },
  {
    patterns: [/what\s+is\s+(a\s+)?cashback/i, /cashback\s+(mean|work|explain)/i],
    answer:
      "Cashback is a reward where you earn back a percentage of your spending. For example, 1% cashback on a card means you get back 1 cent for every euro spent. It's one of the benefits we highlight when ranking credit cards.",
    suggestions: ["Best cashback cards", "Compare credit cards", "What are card rewards?"],
  },
  {
    patterns: [/debit\s+vs?\s+credit/i, /difference\s+(between\s+)?debit\s+(and|vs)/i, /credit\s+vs?\s+debit/i],
    answer:
      "A debit card spends money directly from your bank account. A credit card lets you borrow and pay later, usually with a monthly bill. Credit cards often offer rewards and purchase protection, but charge interest if you don't pay in full.",
    suggestions: ["Compare credit cards", "Best debit cards", "What is APR?"],
  },
  {
    patterns: [/what\s+is\s+(a\s+)?fixed\s+(exchange\s+)?rate/i, /fixed\s+rate\s+(mean|explain)/i],
    answer:
      "A fixed exchange rate locks in a specific rate for a set period, protecting you from currency fluctuations. Some providers let you lock rates in advance, which is useful for large planned transfers.",
    suggestions: ["Compare exchange providers", "What is FX spread?", "Best rates available"],
  },
  {
    patterns: [/what\s+(affects?|determines?)\s+apr/i, /how\s+is\s+apr\s+(set|calculated|determined)/i],
    answer:
      "APR is determined by the base interest rate, your credit profile, loan amount, and term length. Providers also factor in fees. A strong credit history and shorter loan terms typically result in lower APRs.",
    suggestions: ["Compare loan rates", "What is a good APR?", "How do loans work?"],
  },
  {
    patterns: [/what\s+is\s+(an?\s+)?overdraft/i, /overdraft\s+(mean|explain|work)/i],
    answer:
      "An overdraft lets you spend more than your account balance, up to an agreed limit. It's essentially a short-term borrowing facility. Overdrafts typically charge interest or daily fees, so they're best used sparingly.",
    suggestions: ["Compare loans", "What is APR?", "Best bank accounts"],
  },
  {
    patterns: [/loan\s+overview/i, /how\s+do\s+loans\s+work/i, /explain\s+loans/i, /what\s+are\s+loans/i],
    answer:
      "A personal loan gives you a lump sum that you repay in fixed monthly installments over a set term. Key factors are the APR, loan amount, term length, and any fees. On Payn, loans are ranked by total borrowing cost and provider quality.",
    suggestions: ["Compare loan rates", "What affects APR?", "Best loan providers"],
  },
  {
    patterns: [/how\s+does\s+payn\s+(work|rank)/i, /how\s+do\s+you\s+rank/i, /ranking\s+(method|how)/i],
    answer:
      "Payn ranks offers by product fit, cost, and provider quality. When we earn commission from a provider, we disclose it - but compensation alone never determines ranking order. Every factor is visible so you can see why an offer scores the way it does.",
    suggestions: ["Is Payn free?", "Which providers are listed?", "How is commission handled?"],
  },
];

function matchFastPath(message: string): FastPathEntry | null {
  const trimmed = message.trim();
  for (const entry of FAST_PATHS) {
    for (const pattern of entry.patterns) {
      if (pattern.test(trimmed)) return entry;
    }
  }
  return null;
}

/* ═══════════════════════════════════════════════
   CONTEXT-AWARE SUGGESTIONS
   ═══════════════════════════════════════════════ */

function getSuggestions(category?: string): string[] {
  switch (category) {
    case "loans":
      return ["What affects my APR?", "Compare loan providers", "How do loan fees work?"];
    case "cards":
      return ["Best cashback cards?", "Debit vs credit card", "What are card rewards?"];
    case "transfers":
      return ["Cheapest transfer option?", "How do transfer fees work?", "Wise vs Revolut"];
    case "exchange":
      return ["What is FX spread?", "Best exchange rates?", "Fixed vs variable rate"];
    default:
      return ["How does Payn work?", "Compare providers", "What is APR?"];
  }
}

/* ═══════════════════════════════════════════════
   ROUTE HANDLER
   ═══════════════════════════════════════════════ */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: { role: string; content: string }[] = body.messages ?? [];
    const context: {
      category?: string;
      country?: string;
      goals?: string[];
      categories?: string[];
      selectedFilters?: Record<string, unknown>;
    } = body.context ?? {};

    const lastMessage = messages[messages.length - 1]?.content ?? "";

    // ── Fast-path: local instant answers ──
    const fastMatch = matchFastPath(lastMessage);
    if (fastMatch) {
      return NextResponse.json({
        reply: fastMatch.answer,
        suggestions: fastMatch.suggestions,
        source: "fastpath",
      });
    }

    // ── Gemini: real AI response ──
    if (!env.geminiApiKey) {
      return NextResponse.json({
        reply:
          "The AI assistant is being set up. In the meantime, browse our offers directly or check the category pages for detailed comparisons.",
        suggestions: getSuggestions(context.category),
        source: "fallback",
      });
    }

    // Build context-enriched system prompt
    let contextPrompt = SYSTEM_PROMPT;
    if (context.category) {
      contextPrompt += `\n\nThe user is currently browsing the ${context.category} category. Focus your answers on ${context.category}-related topics.`;
    }
    if (context.country) {
      contextPrompt += `\nUser's country: ${context.country}. Prefer information relevant to this market when possible.`;
    }
    if (context.goals?.length) {
      contextPrompt += `\nUser priorities: ${context.goals.join(", ")}. Tailor suggestions toward these goals.`;
    }
    if (context.categories?.length) {
      contextPrompt += `\nUser's selected categories: ${context.categories.join(", ")}.`;
    }

    const geminiMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Call Gemini with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: contextPrompt }] },
            contents: geminiMessages,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 400,
              topP: 0.9,
            },
          }),
          signal: controller.signal,
        },
      );
    } catch (err) {
      clearTimeout(timeout);
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      console.error("Gemini fetch error:", isAbort ? "Request timed out" : err);
      return NextResponse.json({
        reply: "I'm having trouble connecting right now. Please try again in a moment.",
        suggestions: getSuggestions(context.category),
        source: "fallback",
      });
    }
    clearTimeout(timeout);

    if (!response.ok) {
      const status = response.status;
      console.error(`Gemini API error: HTTP ${status}`);
      return NextResponse.json({
        reply: "I'm having trouble connecting right now. Please try again in a moment.",
        suggestions: getSuggestions(context.category),
        source: "fallback",
      });
    }

    const result = await response.json();
    const reply =
      result.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I couldn't generate a response. Please try rephrasing your question.";

    return NextResponse.json({
      reply,
      suggestions: getSuggestions(context.category),
      source: "gemini",
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      reply: "Something went wrong. Please try again.",
      suggestions: [],
      source: "fallback",
    });
  }
}
