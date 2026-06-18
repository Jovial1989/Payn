"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { localePath } from "@/lib/locale";
// WEB.2 — `useCompare` import dropped along with the docked CompareBar.
// Banner sits at its single static offset above the nav again.

// ─── AffiliateDisclosureBanner ─────────────────────────────────────────────────
//
// Sticky, dismissible "we earn a commission" notice. Replaces the inline
// disclosure that used to clutter card surfaces and the conversion funnel.
//
// Behaviour:
//   • Pinned bottom of viewport, hidden under the mobile bottom-nav on
//     small screens (sits ABOVE it via `bottom-[64px]` on mobile, flush
//     bottom on desktop).
//   • Dismissible. Acknowledgement cached in localStorage with a 30-day
//     expiry — appears once per month, never twice in the same session.
//   • Backdrop blur + white/85 so content shows through; this is a
//     notice, not a curtain.
//   • Z-index: 30 (above content, below modals/sheets and below the
//     PdpStickySummary which sits at 30; ladder keeps it below).
//
// Single source of truth — every page in the app picks it up via the
// shell, so we no longer scatter "We earn commission" sentences across
// cards and PDPs.

const STORAGE_KEY = "payn-aff-ack";
const TTL_DAYS = 30;

function readAck(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

function writeAck() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* silent — storage disabled / quota; banner will re-appear next visit */
  }
}

export function AffiliateDisclosureBanner() {
  const shouldReduce = useReducedMotion();
  const { locale } = useMarketplacePreferences();
  const [visible, setVisible] = useState(false);

  // Defer mount-time check so SSR doesn't render the banner unexpectedly
  // and we don't trigger CLS as it appears.
  useEffect(() => {
    const ts = readAck();
    const stale = !ts || Date.now() - ts > TTL_DAYS * 24 * 60 * 60 * 1000;
    // Small delay so the banner doesn't fight with above-the-fold content.
    const timer = window.setTimeout(() => setVisible(stale), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    writeAck();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          key="aff-banner"
          role="region"
          aria-label="Affiliate disclosure"
          initial={shouldReduce ? { opacity: 0 } : { y: 60, opacity: 0 }}
          animate={shouldReduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={shouldReduce ? { opacity: 0 } : { y: 60, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+80px)] z-30 rounded-2xl border border-line bg-white/90 px-4 py-3 shadow-elevated backdrop-blur-xl md:inset-x-4 md:bottom-3 md:py-2.5"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <p className="min-w-0 text-[12px] leading-snug text-ink-secondary">
              <span className="font-semibold text-ink">
                Payn earns a commission on some links.
              </span>{" "}
              It doesn't change our ranking.{" "}
              <Link
                href={localePath(locale, "/how-we-make-money")}
                className="underline decoration-line-strong underline-offset-2 transition-colors hover:text-ink hover:decoration-ink"
              >
                How we make money →
              </Link>
            </p>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
