"use client";

import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react";
import type { ChatMessage } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export const PAYN_OPEN_CHAT_EVENT = "payn:open-chat";

const SHEET_MEDIA_QUERY = "(max-width: 1023px)";
const MAX_TEXTAREA_HEIGHT = 128;

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
  const [present, setPresent] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isSheetLayout, setIsSheetLayout] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const closeChat = useCallback(() => setOpen(false), []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
  }, []);

  const syncViewportHeight = useCallback(() => {
    if (typeof window === "undefined") return;

    const nextHeight = window.visualViewport?.height ?? window.innerHeight;
    setViewportHeight(Math.round(nextHeight));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(SHEET_MEDIA_QUERY);
    const handleChange = () => setIsSheetLayout(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const handleOpen = () => setOpen(true);

    window.addEventListener(PAYN_OPEN_CHAT_EVENT, handleOpen);

    return () => {
      window.removeEventListener(PAYN_OPEN_CHAT_EVENT, handleOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setPresent(true);

      const frame = window.requestAnimationFrame(() => {
        setVisible(true);
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    setVisible(false);

    const timeout = window.setTimeout(() => {
      setPresent(false);
    }, 220);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open]);

  useEffect(() => {
    if (!open || isSheetLayout) return;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 160);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open, isSheetLayout]);

  useEffect(() => {
    const textarea = inputRef.current;

    if (!textarea) return;

    textarea.style.height = "44px";
    textarea.style.height = `${Math.min(MAX_TEXTAREA_HEIGHT, Math.max(44, textarea.scrollHeight))}px`;
  }, [input, open]);

  useEffect(() => {
    if (!present) return;

    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: visible ? "smooth" : "auto",
    });
  }, [messages, loading, suggestions, present, visible]);

  useEffect(() => {
    if (!open || !isSheetLayout) {
      setViewportHeight(null);
      return;
    }

    syncViewportHeight();

    const viewport = window.visualViewport;

    window.addEventListener("resize", syncViewportHeight);
    viewport?.addEventListener("resize", syncViewportHeight);
    viewport?.addEventListener("scroll", syncViewportHeight);

    return () => {
      window.removeEventListener("resize", syncViewportHeight);
      viewport?.removeEventListener("resize", syncViewportHeight);
      viewport?.removeEventListener("scroll", syncViewportHeight);
    };
  }, [open, isSheetLayout, syncViewportHeight]);

  useEffect(() => {
    if (!open || !isSheetLayout) return;

    const { body, documentElement } = document;
    const scrollY = window.scrollY;
    const previousBodyStyles = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      left: body.style.left,
      right: body.style.right,
    };
    const previousHtmlStyles = {
      overflow: documentElement.style.overflow,
      overscrollBehavior: documentElement.style.overscrollBehavior,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.left = "0";
    body.style.right = "0";
    documentElement.style.overflow = "hidden";
    documentElement.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previousBodyStyles.overflow;
      body.style.position = previousBodyStyles.position;
      body.style.top = previousBodyStyles.top;
      body.style.width = previousBodyStyles.width;
      body.style.left = previousBodyStyles.left;
      body.style.right = previousBodyStyles.right;
      documentElement.style.overflow = previousHtmlStyles.overflow;
      documentElement.style.overscrollBehavior = previousHtmlStyles.overscrollBehavior;
      window.scrollTo({ top: scrollY, behavior: "auto" });
    };
  }, [open, isSheetLayout]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeChat();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeChat, open]);

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

  const handleTextareaKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if (isSheetLayout) return;

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void sendMessage(input);
      }
    },
    [input, isSheetLayout, sendMessage],
  );

  const launcherStyle: CSSProperties = {
    bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
    right: "calc(env(safe-area-inset-right, 0px) + 1rem)",
  };

  const sheetViewportStyle: CSSProperties | undefined = isSheetLayout
    ? {
        height: viewportHeight ? `${viewportHeight}px` : "100dvh",
      }
    : undefined;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black shadow-subtle transition-all duration-200 hover:bg-gray-800 sm:h-12 sm:w-12 ${
          open && isSheetLayout ? "pointer-events-none scale-95 opacity-0" : "opacity-100"
        }`}
        style={launcherStyle}
        aria-label="Open AI assistant"
        aria-expanded={open}
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

      {present && (
        <div
          className={
            isSheetLayout
              ? `fixed inset-0 z-[60] flex items-end justify-center bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 sm:p-4 ${
                  visible ? "opacity-100" : "opacity-0"
                }`
              : "fixed bottom-24 right-4 z-[60] flex transition-all duration-200 sm:right-6"
          }
          style={isSheetLayout ? sheetViewportStyle : undefined}
        >
          {isSheetLayout && (
            <button
              type="button"
              onClick={closeChat}
              className="absolute inset-0"
              aria-label="Close AI assistant"
            />
          )}

          <div
            role="dialog"
            aria-modal={isSheetLayout}
            aria-label="Payn AI assistant"
            className={`relative flex min-h-0 w-full flex-col overflow-hidden bg-white ${
              isSheetLayout
                ? "h-full max-sm:rounded-none max-sm:border-x-0 max-sm:border-b-0 sm:mb-4 sm:max-h-full sm:max-w-[720px] sm:rounded-[30px] sm:border sm:border-line sm:shadow-elevated"
                : "h-[min(560px,calc(100vh-7.5rem))] w-[min(420px,calc(100vw-2rem))] rounded-[28px] border border-line shadow-elevated"
            } ${
              isSheetLayout
                ? visible
                  ? "translate-y-0"
                  : "translate-y-6"
                : visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
            } transition-all duration-200 ease-out`}
          >
            <div
              className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-5 sm:py-4"
              style={isSheetLayout ? { paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.875rem)" } : undefined}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a4 4 0 014 4v1a1 1 0 001 1h1a4 4 0 010 8h-1a1 1 0 00-1 1v1a4 4 0 01-8 0v-1a1 1 0 00-1-1H6a4 4 0 010-8h1a1 1 0 001-1V6a4 4 0 014-4z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">Payn AI</p>
                <p className="truncate text-[11px] text-ink-tertiary">Offer guidance beta</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={clearConversation}
                    className="rounded-full px-3 py-1.5 text-[11px] font-medium text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
                  >
                    Clear
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeChat}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
                  aria-label="Close AI assistant"
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5"
              style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}
            >
              {messages.length === 0 && (
                <div className="flex h-full flex-col justify-center text-center max-sm:justify-start max-sm:pt-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bg-surface">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-tertiary" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                    </svg>
                  </div>
                  <p className="mt-3 text-base font-semibold text-ink">Ask me anything</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-ink-tertiary">
                    I can help you understand offers, compare products, or explain financial terms.
                  </p>
                  <div className="mt-5 grid gap-2.5">
                    {[
                      "What is APR?",
                      "How do transfer fees work?",
                      "Compare Revolut vs Wise",
                    ].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendMessage(q)}
                        className="w-full rounded-2xl border border-line px-4 py-3 text-left text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.length > 0 && (
                <div className="grid gap-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <p className="text-[11px] font-medium text-ink-tertiary">
                        {msg.role === "user" ? "You" : "Payn AI"}
                      </p>
                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 [overflow-wrap:anywhere] ${
                          msg.role === "user"
                            ? "bg-black text-white"
                            : "bg-bg-surface text-ink"
                        } whitespace-pre-wrap break-words`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex flex-col gap-1 items-start">
                      <p className="text-[11px] font-medium text-ink-tertiary">Payn AI</p>
                      <div className="max-w-[88%] rounded-2xl bg-bg-surface px-4 py-3">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-ink-tertiary" />
                          <div className="h-2 w-2 animate-pulse rounded-full bg-ink-tertiary" style={{ animationDelay: "150ms" }} />
                          <div className="h-2 w-2 animate-pulse rounded-full bg-ink-tertiary" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!loading && suggestions.length > 0 && messages.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendMessage(suggestion)}
                      className="rounded-full border border-line px-3 py-1.5 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              className="border-t border-line bg-white px-4 py-3 sm:px-5"
              style={isSheetLayout ? { paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.875rem)" } : undefined}
            >
              <p className="mb-2 text-[10px] leading-snug text-ink-tertiary">
                AI-generated guidance only — not financial advice. Always verify with the provider before making decisions.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendMessage(input);
                }}
                className="flex items-end gap-2"
              >
                <label htmlFor="payn-chat-input" className="sr-only">
                  Ask about offers, rates, or terms
                </label>
                <textarea
                  id="payn-chat-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="Ask about offers, rates, or terms..."
                  className="min-h-[44px] flex-1 resize-none overflow-y-auto rounded-2xl border border-line bg-bg-surface px-4 py-[11px] text-sm leading-5 text-ink placeholder:text-ink-tertiary focus:border-line-active focus:outline-none"
                  style={{ WebkitOverflowScrolling: "touch" }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white transition-colors hover:bg-gray-800 disabled:opacity-30"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2L7 9M14 2l-5 12-2-5-5-2 12-5z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
