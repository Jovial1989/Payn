"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// ─── ProviderTrustModal ─────────────────────────────────────────────────────
//
// WEB.9 — Trust transition shown between the user tapping a provider
// CTA and the actual external redirect firing. Mirrors the Flutter
// MOB.14 behaviour: an immediate, calm beat that reads
//
//   🔒 Securely connecting you to {provider}…
//
// while a 1.5s timer ticks down. The redirect fires automatically at
// the end of the dwell — we never ask the user to confirm a second
// time. If the launch itself throws (popup blocked, no provider URL,
// fetch failure), the modal flips to an error state with a retry
// button + a "Copy link" fallback.
//
// Portaled to document.body so the modal escapes any ancestor with a
// `backdrop-filter` / `transform` / `filter` that would otherwise
// trap `position: fixed` (same pitfall as the Compare drawer fix in
// WEB.4 — see that comment for details).

export type TrustModalLaunchResult =
  | { kind: "ok" }
  | { kind: "blocked" }
  | { kind: "error"; message?: string };

interface Props {
  providerName: string;
  /** The actual redirect work. Should attempt `window.open` or its
   *  equivalent and return ok/blocked/error so the modal knows what to
   *  show. The modal fires this exactly once, ~1.5s after mount, and
   *  again on retry. */
  onLaunch: () => Promise<TrustModalLaunchResult> | TrustModalLaunchResult;
  onClose: () => void;
  /** Override the dwell. 1500ms is the spec; exposed for tests. */
  dwellMs?: number;
}

const DEFAULT_DWELL = 1500;

export function ProviderTrustModal({
  providerName,
  onLaunch,
  onClose,
  dwellMs = DEFAULT_DWELL,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"connecting" | "blocked" | "error">(
    "connecting",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Body scroll lock + Escape closes the modal.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Fire the launch once on mount after the dwell. The async wrapper
  // makes sure a `Promise.reject` in the consumer's onLaunch shows up
  // as an "error" phase rather than a silent unhandled rejection.
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (cancelled) return;
      try {
        const result = await onLaunch();
        if (cancelled) return;
        if (result.kind === "ok") {
          // window.open succeeded — close the modal so the user lands
          // on the underlying page when they tab back from the new
          // window.
          onClose();
        } else if (result.kind === "blocked") {
          setPhase("blocked");
        } else {
          setErrorMessage(result.message ?? null);
          setPhase("error");
        }
      } catch (e) {
        if (cancelled) return;
        setErrorMessage(
          typeof e === "object" && e !== null && "message" in e
            ? String((e as { message: unknown }).message)
            : null,
        );
        setPhase("error");
      }
    }, dwellMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // We intentionally run this only once per mount — re-running on
    // every prop change would cause a redirect loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = async () => {
    setPhase("connecting");
    setErrorMessage(null);
    try {
      const result = await onLaunch();
      if (result.kind === "ok") onClose();
      else if (result.kind === "blocked") setPhase("blocked");
      else {
        setErrorMessage(result.message ?? null);
        setPhase("error");
      }
    } catch (e) {
      setErrorMessage(
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : null,
      );
      setPhase("error");
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop. Click-through dismisses (only matters during the
          error/blocked phases; the connecting phase auto-closes on
          success anyway). */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Connecting to ${providerName}`}
        className="fixed left-1/2 top-1/2 z-[80] w-[min(420px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-line bg-white p-6 shadow-elevated sm:p-7"
      >
        <div className="flex flex-col items-center text-center">
          {phase === "connecting" ? (
            <div
              className="relative flex h-14 w-14 items-center justify-center"
              aria-hidden="true"
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-accent-emerald-soft" />
              <span className="absolute inset-1 rounded-full bg-accent-emerald-soft" />
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative text-accent-emerald-strong"
              >
                <rect x="4.5" y="9" width="11" height="7.5" rx="2" />
                <path d="M7.5 9V7a2.5 2.5 0 0 1 5 0v2" />
              </svg>
            </div>
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-surface"
              aria-hidden="true"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-ink"
              >
                <circle cx="10" cy="10" r="7.5" />
                <path d="M10 6.5v4" />
                <path d="M10 13.5h0.01" />
              </svg>
            </div>
          )}

          <h3 className="mt-4 text-[18px] font-bold tracking-[-0.01em] text-ink">
            {phase === "connecting"
              ? `Securely connecting you to ${providerName}…`
              : phase === "blocked"
                ? "Your browser blocked the redirect"
                : "We couldn't open the provider page"}
          </h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-secondary">
            {phase === "connecting"
              ? "You're leaving Payn. Your data isn't shared with the provider until you act on their site."
              : phase === "blocked"
                ? "Your browser stopped a new tab from opening. Allow popups for payn.online, or open the link manually below."
                : (errorMessage ??
                  "The provider link isn't responding right now. Try again or copy the link to your browser manually.")}
          </p>

          {phase !== "connecting" ? (
            <div className="mt-5 flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={retry}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent-emerald px-5 text-[13px] font-bold text-white shadow-[0_4px_10px_rgba(15,138,75,0.20)] transition-colors hover:bg-accent-emerald-strong"
              >
                Try again
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2.5 6h7M6.5 3l3 3-3 3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-full px-3 text-[12.5px] font-medium text-ink-tertiary transition-colors hover:text-ink"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="mt-5 text-[12px] font-medium text-ink-tertiary transition-colors hover:text-ink"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
