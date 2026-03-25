"use client";

import type { ChatMessage } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

function detectPageCategory(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const path = window.location.pathname;
  if (path.startsWith("/loans")) return "loans";
  if (path.startsWith("/cards")) return "cards";
  if (path.startsWith("/transfers")) return "transfers";
  if (path.startsWith("/exchange")) return "exchange";
  return undefined;
}

export function ChatWidget() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setSuggestions([]);
      setLoading(true);

      try {
        const res = await fetch("/api/v1/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            context: {
              category: detectPageCategory(),
              country: profile?.home_country,
              goals: profile?.goals,
              categories: profile?.selected_categories,
            },
          }),
        });

        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.reply,
            timestamp: Date.now(),
          },
        ]);

        if (data.suggestions?.length) {
          setSuggestions(data.suggestions);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Connection issue. Please try again.",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, profile],
  );

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black shadow-elevated transition-all hover:bg-gray-800 hover:shadow-card-hover"
        aria-label="Open AI assistant"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[400px] flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-elevated">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-line px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 014 4v1a1 1 0 001 1h1a4 4 0 010 8h-1a1 1 0 00-1 1v1a4 4 0 01-8 0v-1a1 1 0 00-1-1H6a4 4 0 010-8h1a1 1 0 001-1V6a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-ink">Payn AI</p>
              <p className="text-[11px] text-ink-tertiary">Powered by Gemini</p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setSuggestions([]);
                }}
                className="rounded-full px-3 py-1 text-[11px] font-medium text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-surface">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-tertiary" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">Ask me anything</p>
                <p className="mt-1 text-xs text-ink-tertiary">
                  I can help you understand offers, compare products, or explain financial terms.
                </p>
                <div className="mt-4 grid w-full gap-2">
                  {[
                    "What is APR?",
                    "How do transfer fees work?",
                    "Compare Revolut vs Wise",
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="rounded-xl border border-line px-3 py-2.5 text-left text-xs font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "ml-auto bg-black text-white"
                      : "bg-bg-surface text-ink"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {loading && (
                <div className="max-w-[85%] rounded-2xl bg-bg-surface px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-ink-tertiary" />
                    <div className="h-2 w-2 animate-pulse rounded-full bg-ink-tertiary" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 animate-pulse rounded-full bg-ink-tertiary" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {!loading && suggestions.length > 0 && messages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="rounded-full border border-line px-3 py-1.5 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-line px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about offers, rates, or terms..."
                className="h-10 flex-1 rounded-xl border border-line bg-bg-surface px-4 text-sm text-ink placeholder:text-ink-tertiary focus:border-line-active focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white transition-colors hover:bg-gray-800 disabled:opacity-30"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2L7 9M14 2l-5 12-2-5-5-2 12-5z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
