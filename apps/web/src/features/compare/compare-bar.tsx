"use client";

import { useState } from "react";
import type { MarketplaceLocale } from "@payn/types";
import { useCompare } from "./compare-store";
import { CompareDrawer } from "./compare-drawer";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { ProviderLogo } from "@/components/provider-logo";
import { buttonStyles } from "@/components/button";

// ─── Compare bar ─────────────────────────────────────────────────────────────
//
// Sticky pill at the bottom of the viewport whenever the compare set
// is non-empty. Shows the selected provider logos as a quick visual
// stack, lets the user drop individual entries, and opens the
// CompareDrawer on click. Hides itself when empty so it doesn't take
// up screen real estate.
//
// Sits above the MobileBottomNav (~64px) and the AffiliateDisclosure
// banner (~48px) so it doesn't get covered. On desktop we anchor it
// to the bottom-right rather than centred so it doesn't fight the
// catalogue scroll.

interface CompareBarProps {
  locale: MarketplaceLocale;
}

export function CompareBar({ locale }: CompareBarProps) {
  const { slugs, clear, max } = useCompare();
  const [open, setOpen] = useState(false);

  if (slugs.length === 0) return null;

  const offers = slugs
    .map((s) => marketplaceOffers.find((o) => o.slug === s))
    .filter(Boolean) as Array<{ providerName: string; title: string; slug: string }>;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-3"
        style={{
          bottom: "calc(72px + env(safe-area-inset-bottom))",
        }}
      >
        <div className="pointer-events-auto flex w-full max-w-[680px] items-center gap-3 rounded-full border border-line bg-white/95 px-3 py-2 shadow-floating backdrop-blur-md sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary sm:block">
              Compare
            </p>
            <div className="flex -space-x-2">
              {offers.map((o) => (
                <div
                  key={o.slug}
                  title={`${o.providerName} — ${o.title}`}
                  className="rounded-full border-2 border-white"
                >
                  <ProviderLogo providerName={o.providerName} size="sm" />
                </div>
              ))}
              {Array.from({ length: max - offers.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-line bg-bg-surface text-[10px] font-bold text-ink-tertiary"
                  aria-hidden="true"
                >
                  +
                </div>
              ))}
            </div>
            <p className="text-[12px] font-medium text-ink-secondary sm:text-[13px]">
              {offers.length} of {max}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={clear}
              className="hidden h-9 items-center rounded-full px-3 text-[12px] font-medium text-ink-tertiary transition-colors hover:text-ink sm:inline-flex"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={buttonStyles({ variant: "primary", size: "sm" })}
              disabled={offers.length < 2}
              title={offers.length < 2 ? "Add another offer to compare" : undefined}
            >
              Compare
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <CompareDrawer
        open={open}
        onClose={() => setOpen(false)}
        locale={locale}
      />
    </>
  );
}
