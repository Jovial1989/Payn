"use client";

import { useState } from "react";
import type { MarketplaceLocale } from "@payn/types";
import { useCompare } from "./compare-store";
import { CompareDrawer } from "./compare-drawer";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { ProviderLogo } from "@/components/provider-logo";

// ─── ComparePickStrip ─────────────────────────────────────────────────────────
//
// WEB.4 — Slim sticky strip mounted right above the offer list on
// `/explore/<bucket>` pages. Shows the count + tiny provider-logo
// stack + Compare button. Sticky so it stays in view while the user
// scrolls the list; height collapses to 0 when the compare set is
// empty so the strip leaves no trace until needed.
//
// Replaces the floating bottom CompareBar (removed in MOB.10) and
// complements the global `CompareHeaderChip` in the top nav — that
// chip is for "global state at a glance"; this strip is for "you're
// actively building a shortlist on this page, here's what's in it".

interface Props {
  locale: MarketplaceLocale;
}

export function ComparePickStrip({ locale }: Props) {
  const { slugs, remove, clear } = useCompare();
  const [open, setOpen] = useState(false);

  if (slugs.length === 0) return null;

  const offers = slugs
    .map((s) => marketplaceOffers.find((o) => o.slug === s))
    .filter(Boolean) as Array<{
      slug: string;
      providerName: string;
      title: string;
    }>;
  const count = offers.length;
  const ready = count >= 2;

  return (
    <>
      {/* sticky top-X needs an offset that clears the inner-header on
          dashboard surfaces (~64–72px) and the marketing-site header
          (~64–72px). 76px gives ~4px breathing room on both. */}
      <div className="sticky top-[76px] z-20">
        <div
          className={[
            "flex items-center gap-3 rounded-[14px] border bg-white px-3 py-2 shadow-[0_8px_24px_rgba(15,23,32,0.08)] sm:px-4",
            ready ? "border-accent-emerald/40" : "border-line",
          ].join(" ")}
        >
          <span
            aria-hidden="true"
            className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-accent-emerald px-1.5 text-[12px] font-extrabold text-white"
          >
            {count}
          </span>

          {/* Tiny provider-logo stack — gives the user visual confirmation
              of which offers are in the set. Hidden below sm so the strip
              stays compact on phones. */}
          <div className="hidden -space-x-2 sm:flex">
            {offers.map((o) => (
              <button
                key={o.slug}
                type="button"
                onClick={() => remove(o.slug)}
                title={`Remove ${o.title} from compare`}
                className="rounded-full border-2 border-white transition-transform hover:-translate-y-0.5"
              >
                <ProviderLogo providerName={o.providerName} size="sm" />
              </button>
            ))}
          </div>

          <p className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink-secondary sm:text-[13px]">
            {ready ? "Ready to compare" : `Pick ${3 - count} more for a richer comparison`}
          </p>

          <button
            type="button"
            onClick={clear}
            className="hidden h-8 items-center rounded-full px-2.5 text-[11.5px] font-medium text-ink-tertiary transition-colors hover:text-ink sm:inline-flex"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={!ready}
            className={[
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-bold transition-colors disabled:cursor-not-allowed",
              ready
                ? "bg-ink text-white hover:bg-ink/90"
                : "bg-bg-surface text-ink-tertiary",
            ].join(" ")}
          >
            Compare
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M3 5l3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
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
