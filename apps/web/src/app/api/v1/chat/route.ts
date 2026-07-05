import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

/* ═══════════════════════════════════════════════
   SYSTEM PROMPT
   ═══════════════════════════════════════════════ */

const SYSTEM_PROMPT = `You are Payn AI — the built-in assistant for Payn, a European financial marketplace that ranks offers by what they actually cost, not by who pays the most commission.

## How to answer
- Be concise. 2–4 sentences unless the user explicitly asks for more.
- Sound polished, trustworthy, and product-native. No filler phrases.
- Explain financial concepts simply — no jargon, no buzzwords.
- Never give regulated financial advice. Never say "you should buy" or "I recommend this specific provider."
- Always suggest the user review full terms on the provider's own website before applying.
- Never guarantee approval, rates, or outcomes — every product is subject to individual eligibility.
- Never invent provider details. If you're not certain, say so.
- Prefer short paragraphs over bullet-point lists.
- If you don't know, say so plainly. Don't guess.

## What Payn is
Payn is a European fintech comparison marketplace. Every other comparison site sorts by who pays them the most. Payn ranks by product fit, cost, and provider quality — fees, FX spreads, APRs, and all-in costs. Commission is always disclosed and never determines ranking order.

Payn covers 30 European markets. It tracks 200+ products from 100+ providers, with rates refreshed within 24 hours.

## Categories and what to know about each

### Money Transfers
Payn compares international transfer providers on: transfer fee (flat or %), FX spread (mark-up above mid-market rate), speed, and supported currencies.
Key providers and notable metrics:
- Wise: ~0.41% FX spread (one of the lowest in the market), transparent fee structure, supports 40+ currencies
- Revolut: free transfers up to monthly limits on Standard plan; Metal plan offers better limits
- N26: standard SEPA transfers, competitive for EUR zone
- Remitly, WorldRemit: strong for emerging-market corridors

### Savings & Interest
Payn compares savings accounts and investment accounts by AER (Annual Equivalent Rate).
Key providers and notable rates (indicative, always check live rates):
- Plum: up to 4.73% AER on interest pockets
- Trade Republic: 4% AER on uninvested cash in the brokerage account
- bunq: 3.11% AER on Easy Savings (green bank, B Corp certified)
- Lightyear: ~€1/month management fee; competitive for passive investors across European markets

### Credit Cards
Ranked by: APR, cashback rate, annual fee, FX fee (for travel), and perks.
Key providers:
- Revolut Metal: 1% cashback on all purchases, premium perks, ~€16/month
- Curve: consolidates cards, cashback on selected merchants, Go Back in Time feature
- N26: free Mastercard, no foreign transaction fee, instant notifications
- Klarna Card: buy-now-pay-later card, Pay in 3 for purchases, no interest if paid on time

### Personal Loans
Ranked by: APR (Annual Percentage Rate), loan term, max amount, and approval speed.
APR includes both interest and mandatory fees — it's the true annual cost of borrowing.
Payn shows representative APR and eligibility criteria. Actual rate depends on individual credit profile.

### Currency Exchange
Ranked by FX spread and mid-market rate accuracy.
A "0% commission" headline often hides a mark-up in the exchange rate itself — Payn surfaces the all-in cost.

### Investments
Payn lists regulated investment platforms available in Europe.
Key providers:
- Lightyear: €1/month flat fee, stocks and ETFs, multi-currency account
- Trade Republic: commission-free ETF savings plans, 4% AER on cash

## How Payn ranking works
1. Cost score — total cost to the user (fees + FX spread + APR)
2. Product fit — eligibility, availability in the user's country, relevant features
3. Provider quality — regulatory standing, user ratings, transparency
4. Commercial disclosure — if Payn earns commission from a provider, it is always shown. Commission does NOT boost a provider's ranking.

## Support
If a user asks to speak to a human, connect with support, or contact the team:
Tell them: "You can reach our support team at hello@payn.online — we typically reply within one business day."
Do not invent a phone number, live chat, or other contact method.

## What Payn is not
- Not a bank. Not an FCA/BaFin/regulated advisor.
- Not able to apply on the user's behalf or access their account data.
- Not guaranteeing any rate, approval, or outcome.`;



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
  {
    patterns: [
      /talk\s+to\s+(a\s+)?(real\s+)?(human|person|agent|someone|support|team)/i,
      /speak\s+to\s+(a\s+)?(real\s+)?(human|person|agent|someone|support|team)/i,
      /connect\s+(me\s+)?(with|to)\s+(a\s+)?(real\s+)?(human|person|agent|support|team)/i,
      /contact\s+(support|the\s+team|you|payn)/i,
      /reach\s+(support|the\s+team|someone)/i,
      /human\s+support/i,
      /live\s+(chat|support|agent)/i,
      /real\s+(person|human|agent)/i,
      /email\s+(you|payn|support)/i,
      /support\s+(team|email|contact)/i,
      /how\s+(can\s+i\s+)?(contact|reach)\s+(you|payn|support)/i,
    ],
    answer:
      "You can reach our support team at **hello@payn.online** — we typically reply within one business day.",
    suggestions: ["How does Payn work?", "How do you rank?", "What is APR?"],
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
   LIVE CATALOG CONTEXT
   ═══════════════════════════════════════════════ */

const CATALOG_CATEGORIES = [
  "transfers",
  "savings",
  "cards",
  "loans",
  "exchange",
  "investments",
  "debit",
  "neobanks",
] as const;

function buildCatalogContext(): string {
  const lines: string[] = ["## Current top offers in Payn catalog\n"];

  for (const cat of CATALOG_CATEGORIES) {
    const top = marketplaceOffers
      .filter((o) => o.category === cat)
      .sort((a, b) => b.affiliatePriorityScore - a.affiliatePriorityScore)
      .slice(0, 5);

    if (!top.length) continue;

    lines.push(`### ${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
    for (const o of top) {
      const metrics = o.metrics
        .slice(0, 2)
        .map((m) => `${m.label}: ${m.value}`)
        .join(", ");
      const line = `- **${o.providerName}** — ${o.title}: ${o.subtitle}${metrics ? ` (${metrics})` : ""}`;
      lines.push(line);
    }
    lines.push("");
  }

  lines.push("Slug format for deep-links: /offers/{slug}. Always suggest users click through to verify live rates.");
  return lines.join("\n");
}

const CATALOG_CONTEXT = buildCatalogContext();

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

    // SEC-FIX PAYN-A18: cap message count and per-message size to prevent token exhaustion
    if (!Array.isArray(messages) || messages.length > 20) {
      return NextResponse.json({ error: "Too many messages" }, { status: 400 });
    }
    const cappedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content.slice(0, 2000) : "",
    }));

    // SEC-FIX PAYN-A06: validate context fields against allowlists to prevent prompt injection
    const VALID_COUNTRIES = new Set([
      "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT",
      "LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","GB","NO","CH","IS","LI",
      "US","CA","AU","NZ","SG","AE","ZA","JP","KR","IN","BR","MX","AR"
    ]);
    const VALID_CATEGORIES = new Set([
      "banking","cards","savings","investments","insurance","loans","crypto",
      "exchange","transfers","bnpl","expense","payroll","remittance","travel",
      "debit","wallets","trading","cashback","budgeting","kids","business","neobanks","tax"
    ]);

    if (context) {
      if (context.country && !VALID_COUNTRIES.has(String(context.country).toUpperCase())) {
        context.country = undefined;
      }
      if (context.category && !VALID_CATEGORIES.has(String(context.category).toLowerCase())) {
        context.category = undefined;
      }
      if (Array.isArray(context.goals)) {
        context.goals = context.goals
          .filter((g: unknown) => typeof g === "string")
          .map((g: string) => g.slice(0, 100).replace(/[^\w\s,.-]/g, ""))
          .slice(0, 5);
      }
      if (Array.isArray(context.categories)) {
        context.categories = (context.categories as unknown[])
          .filter((c): c is string => typeof c === "string" && VALID_CATEGORIES.has(c.toLowerCase()))
          .slice(0, 5);
      }
    }

    const lastMessage = cappedMessages[cappedMessages.length - 1]?.content ?? "";

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
    let contextPrompt = SYSTEM_PROMPT + "\n\n" + CATALOG_CONTEXT;
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

    const geminiMessages = cappedMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Call Gemini with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      // SEC-FIX PAYN-A02: API key moved to header — URL params appear in access logs
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": env.geminiApiKey },
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
