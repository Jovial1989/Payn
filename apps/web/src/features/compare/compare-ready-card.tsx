"use client";

import { useState } from "react";
import type { MarketplaceLocale } from "@payn/types";
import { useCompare } from "./compare-store";
import { CompareDrawer } from "./compare-drawer";
import { buttonStyles } from "@/components/button";

// ─── CompareReadyCard ─────────────────────────────────────────────────────────
//
// WEB.2 — Inline "ready-to-compare" card. Replaces the bottom-docked
// CompareBar (removed in MOB.10) with a regular section that lives in
// the page content of the Dashboard / Saved view. Mirrors the
// `_CompareReadyCard` Flutter widget on mobile.
//
//   • count == 0: not rendered.
//   • count == 1: muted variant ("Add 1 more · Compare disabled").
//   • count >= 2: emerald CTA opening the comparison drawer.
//
// Owns its own CompareDrawer state so the legacy bottom-bar can be
// deleted without leaving the drawer orphaned.

interface Props {
  locale: MarketplaceLocale;
}

export function CompareReadyCard({ locale }: Props) {
  const { slugs } = useCompare();
  const [open, setOpen] = useState(false);
  const count = slugs.length;
  if (count === 0) return null;

  const ready = count >= 2;

  return (
    <>
      <div
        className={[
          "flex items-center gap-3 rounded-[20px] border px-4 py-3 sm:px-5",
          ready
            ? "border-transparent bg-ink text-white shadow-elevated"
            : "border-line bg-bg-surface text-ink",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className="flex h-9 min-w-[36px] items-center justify-center rounded-full bg-accent-emerald px-2 text-[14px] font-extrabold text-white"
        >
          {count}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={[
              "text-[13.5px] font-extrabold leading-tight sm:text-[14.5px]",
              ready ? "text-white" : "text-ink",
            ].join(" ")}
          >
            {ready ? "Ready to compare" : "Add 1 more to compare"}
          </p>
          <p
            className={[
              "mt-0.5 text-[11.5px] leading-tight sm:text-[12.5px]",
              ready ? "text-white/72" : "text-ink-secondary",
            ].join(" ")}
          >
            {ready
              ? `See ${count} offers side by side`
              : "Pick one more saved offer below"}
          </p>
        </div>
        {ready ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={buttonStyles({ variant: "primary", size: "sm" })}
          >
            Compare
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
        ) : (
          <span className="inline-flex h-9 items-center rounded-full border border-line bg-white px-3 text-[12px] font-semibold text-ink-tertiary">
            Compare
          </span>
        )}
      </div>

      <CompareDrawer
        open={open}
        onClose={() => setOpen(false)}
        locale={locale}
      />
    </>
  );
}
