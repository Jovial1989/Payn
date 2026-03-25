import { NextResponse } from "next/server";
import { env } from "@/lib/env";

const SYSTEM_PROMPT = `You are Payn AI, a helpful financial assistant for the Payn European financial marketplace.

Payn helps users compare loans, credit cards, money transfers, and currency exchange across regulated European providers.

Your role:
- Help users understand financial products
- Explain differences between offers
- Clarify terms like APR, fees, spreads, FX rates
- Suggest which product category might suit their needs
- Be concise, accurate, and trustworthy
- Never give specific financial advice or tell users what to buy
- Always recommend they review full terms on the provider's website

Tone: Professional, clear, helpful. Like a knowledgeable friend who works in fintech.
Keep responses short (2-4 sentences) unless the user asks for detail.`;

export async function POST(request: Request) {
  try {
    const { messages, context } = await request.json();

    if (!env.geminiApiKey) {
      return NextResponse.json(
        {
          reply:
            "AI assistant is not configured yet. Please check back later, or browse our offers directly.",
        },
        { status: 200 },
      );
    }

    // Build context-aware prompt
    let contextPrompt = SYSTEM_PROMPT;
    if (context?.category) {
      contextPrompt += `\n\nThe user is currently browsing: ${context.category}`;
    }
    if (context?.country) {
      contextPrompt += `\nUser's country: ${context.country}`;
    }
    if (context?.goals?.length) {
      contextPrompt += `\nUser priorities: ${context.goals.join(", ")}`;
    }

    const geminiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: contextPrompt }] },
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        { reply: "I'm having trouble connecting right now. Try again in a moment." },
        { status: 200 },
      );
    }

    const result = await response.json();
    const reply =
      result.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I couldn't generate a response. Please try rephrasing your question.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "Something went wrong. Please try again." },
      { status: 200 },
    );
  }
}
