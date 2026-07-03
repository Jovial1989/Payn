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
// STRAT.1 — the redirect now fires instantly (no forced countdown).
// The modal then holds a "left" state carrying the honest affiliate
// disclosure, so it's read at the handoff moment without an ad-style
// wait. If the launch itself throws (popup blocked, no provider URL,
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
  /** Override the dwell before the redirect fires. Default 0 — the
   *  handoff is instant. Exposed for tests / a brief beat if wanted. */
  dwellMs?: number;
}

// STRAT.1 — instant handoff: the redirect fires on mount with no forced
// countdown. The affiliate disclosure persists in the modal's "left"
// state instead of being gated behind a timer.
const DEFAULT_DWELL = 0;

export function ProviderTrustModal({
  providerName,
  onLaunch,
  onClose,
  dwellMs = DEFAULT_DWELL,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"connecting" | "left" | "blocked" | "error">(
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
          // The new tab is navigating to the provider now. Hold the modal
          // in the "left" state so the affiliate disclosure stays on the
          // Payn tab for when the user comes back.
          setPhase("left");
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
      if (result.kind === "ok") setPhase("left");
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
                <path d="M11 4h5v5" />
                <path d="M16 4l-7 7" />
                <path d="M14 11v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" />
              </svg>
            </div>
          ) : phase === "left" ? (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-emerald-soft"
              aria-hidden="true"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-accent-emerald-strong"
              >
                <path d="M4.5 10.5l3.5 3.5 7.5-8" />
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
              ? `Opening ${providerName}…`
              : phase === "left"
                ? `You're on your way to ${providerName}`
                : phase === "blocked"
                  ? "Your browser blocked the redirect"
                  : "We couldn't open the provider page"}
          </h3>

          {phase === "connecting" || phase === "left" ? (
            <div className="mt-2 flex flex-col gap-2.5">
              <p className="text-[13.5px] leading-relaxed text-ink-secondary">
                You finish signing up on {providerName}&rsquo;s own site — your
                details aren&rsquo;t shared with them until you do.
              </p>
              {/* STRAT.1 — the honest part, said out loud at the exact moment
                  it matters. Stays visible in the "left" state so the user
                  reads it when they tab back to Payn. */}
              <p className="rounded-2xl bg-bg-surface px-4 py-3 text-left text-[12.5px] leading-relaxed text-ink-secondary">
                Payn may earn a commission if you sign up. It never changes how
                we rank — we sort by what each option really costs, full stop.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-secondary">
              {phase === "blocked"
                ? "Your browser stopped a new tab from opening. Allow popups for payn.online, or open the link manually below."
                : (errorMessage ??
                  "The provider link isn't responding right now. Try again or copy the link to your browser manually.")}
            </p>
          )}

          {phase === "blocked" || phase === "error" ? (
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
          ) : phase === "left" ? (
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-[13px] font-semibold text-ink transition-colors hover:bg-bg-surface"
            >
              Back to results
            </button>
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
