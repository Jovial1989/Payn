"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import type { MarketplaceLocale } from "@payn/types";
import { useCompare } from "./compare-store";
import { CompareDrawer } from "./compare-drawer";
import { marketplaceCategories } from "@/lib/marketplace";

// PASS A — the `/explore/<bucket>` vocabulary is retired; the canonical
// category surface is the flat `/<category>` route (locale-rewritten to
// `/en/<category>`). Match the flat category path as a whole final
// segment so the chip still hides on category pages (which host the
// `ComparePickStrip`) but not on, say, `/offers/<slug>` containing a
// category word inside the slug.
const FLAT_CATEGORY_PATH = new RegExp(
  `/(?:${marketplaceCategories.join("|")})(?:/|\\?|$)`,
);

// ─── CompareHeaderChip ───────────────────────────────────────────────────────
//
// WEB.3 — Global Compare indicator that rides the top header. Hidden
// when the compare set is empty; appears the moment a user taps "+"
// on any offer card so they can see the action registered. Tapping
// opens the comparison drawer in place (no navigation away), which is
// the right ergonomics on desktop where there is no bottom nav badge
// to fall back on.
//
//   • count == 1 → grey "Compare · 1" chip (disabled-looking).
//   • count >= 2 → emerald "Compare · 3" chip (active).
//
// Mirrors the Saved-tab badge in `MobileBottomNav` so the discovery
// cue is in the chrome on both desktop and mobile.

interface Props {
  locale: MarketplaceLocale;
}

export function CompareHeaderChip({ locale }: Props) {
  const { slugs } = useCompare();
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const count = slugs.length;
  if (count === 0) return null;
  // WEB.5 — Hide the chip on the flat category routes (/en/cards, …)
  // because those pages already host the `ComparePickStrip` directly
  // above the offer list. Two simultaneous Compare CTAs duplicate the
  // affordance and the detailed strip wins (it shows logos + Clear +
  // count). On every other page (Dashboard, PDP, About, etc.) the chip
  // is the only global indicator so it stays.
  if (FLAT_CATEGORY_PATH.test(pathname)) return null;

  const ready = count >= 2;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open compare — ${count} of 3 picked`}
        className={[
          "hidden items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors lg:inline-flex",
          ready
            ? "border-transparent bg-ink text-white hover:bg-ink/90"
            : "border-line bg-bg-surface text-ink hover:bg-bg-overlay",
        ].join(" ")}
      >
        <span
          className={[
            "flex h-6 min-w-[24px] items-center justify-center rounded-full text-[11px] font-extrabold leading-none",
            ready
              ? "bg-accent-emerald text-white"
              : "bg-accent-emerald text-white",
          ].join(" ")}
        >
          {count}
        </span>
        <span>Compare</span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M3 5l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <CompareDrawer
        open={open}
        onClose={() => setOpen(false)}
        locale={locale}
      />
    </>
  );
}
