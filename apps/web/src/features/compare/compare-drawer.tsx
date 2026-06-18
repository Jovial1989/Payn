"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import { ProviderLogo } from "@/components/provider-logo";
import { Tag } from "@/components/tag";
import { useCompare } from "./compare-store";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { extractMetricNumber } from "@/features/marketplace/offer-ranking";
import { buttonStyles } from "@/components/button";
import { localePath } from "@/lib/locale";
import { getOfferHref } from "@/lib/marketplace";

// ─── Compare drawer ──────────────────────────────────────────────────────────
//
// Slide-up panel with a side-by-side comparison table. Opens when the
// user clicks "Compare" on the sticky CompareBar. Closes via the
// backdrop click, the × button, or Escape.
//
// Per-metric winner highlighting:
//   • For every metric label that appears in 2+ of the compared offers,
//     pick the value that wins on the comparable axis. Lower-is-better
//     ("fee", "premium", "apr", "spread") → lowest number wins.
//     Higher-is-better ("rate", "cashback", "coverage") → highest wins.
//     For ambiguous labels we don't crown a winner — just render the
//     values neutrally.

interface CompareDrawerProps {
  open: boolean;
  onClose: () => void;
  locale: MarketplaceLocale;
}

export function CompareDrawer({ open, onClose, locale }: CompareDrawerProps) {
  const { slugs, remove, clear } = useCompare();
  // WEB.4 — Track when we're mounted on the client so the portal call
  // doesn't run during SSR (document is undefined there). One-shot
  // useEffect flip — no state churn after first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while open + close on Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const offers = useMemo(
    () => slugs
      .map((s) => marketplaceOffers.find((o) => o.slug === s))
      .filter((o): o is MarketplaceOffer => Boolean(o)),
    [slugs],
  );

  // Build a union of metric labels in offer-order so the comparison rows
  // preserve the most-prominent metric (offer.metrics[0]) at top.
  const metricLabels = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    for (const o of offers) {
      for (const m of o.metrics) {
        if (!seen.has(m.label)) {
          seen.add(m.label);
          order.push(m.label);
        }
      }
    }
    return order;
  }, [offers]);

  if (!open || !mounted) return null;

  // WEB.4 — Portal to document.body. The dashboard's inner header has
  // a `backdrop-blur-md` ancestor which (per spec) creates a containing
  // block for descendant `position: fixed` elements — that was why the
  // drawer "opened" but rendered offscreen (or zero-height) inside the
  // dashboard workspace: it was being trapped behind the inner-header
  // backdrop. Portaling to body lifts it out of any ancestor stacking
  // context so it always overlays the whole viewport.
  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Compare offers"
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-3xl border border-line bg-white shadow-floating"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Compare
            </p>
            <h2 className="mt-0.5 text-[18px] font-bold tracking-tight-1 text-ink">
              {offers.length} {offers.length === 1 ? "offer" : "offers"} side by side
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {offers.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="text-[12px] font-medium text-ink-tertiary hover:text-ink"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close compare"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>
        </div>

        {offers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[15px] text-ink-secondary">
              Hit the Compare icon on any offer in the catalogue to start a side-by-side.
            </p>
          </div>
        ) : (
          <div className="overflow-auto px-5 py-5 sm:px-6">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 min-w-[140px] bg-white pb-3 pr-4 text-left align-bottom" />
                  {offers.map((offer) => (
                    <th
                      key={offer.id}
                      className="min-w-[200px] pb-3 pl-4 pr-4 text-left align-bottom"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <ProviderLogo providerName={offer.providerName} size="sm" />
                          <button
                            type="button"
                            onClick={() => remove(offer.slug)}
                            aria-label={`Remove ${offer.title} from compare`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                              <path d="M3 3l6 6M9 3l-6 6" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-[12px] text-ink-tertiary">{offer.providerName}</p>
                        <p className="text-[14px] font-bold tracking-tight-1 text-ink">{offer.title}</p>
                        {offer.bestFor?.[0] && (
                          <Tag tone="muted">{offer.bestFor[0]}</Tag>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metricLabels.map((label, rowIdx) => {
                  const cells = offers.map((o) => o.metrics.find((m) => m.label === label));
                  const direction = metricDirection(label);
                  const winnerIdx = pickWinnerIndex(cells, direction);
                  return (
                    <tr key={label} className={rowIdx % 2 === 0 ? "bg-bg-surface" : undefined}>
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-inherit py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary"
                      >
                        {label}
                      </th>
                      {cells.map((cell, i) => (
                        <td
                          key={`${label}-${i}`}
                          className={[
                            "py-3 pl-4 pr-4 text-[14px] tabular-nums",
                            winnerIdx === i
                              ? "font-extrabold text-accent-emerald-strong"
                              : "font-medium text-ink",
                          ].join(" ")}
                        >
                          {cell ? (
                            cell.value
                          ) : (
                            // TASK-307 (PR-V3-04). Em-dash replaced
                            // with explicit "Not offered" + native
                            // `title` tooltip so the user knows
                            // whether the cell is empty because the
                            // provider doesn't include this metric
                            // (the common case) or because the data
                            // is genuinely missing. Brief V3 §2.2.
                            <span
                              className="cursor-help italic text-ink-tertiary"
                              title="This product doesn't include this metric — either it's not part of the offer or the provider doesn't publish it."
                            >
                              Not offered
                            </span>
                          )}
                          {winnerIdx === i && cell && (
                            <span className="ml-1.5 inline-block align-middle text-[9px] font-bold uppercase tracking-[0.12em] text-accent-emerald-strong">
                              ★ Best
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* WEB.5 — Per-offer "See details" buttons used to be the
                secondary (white) variant, which read as the LESS
                important action on the screen — the user reported
                they didn't realise they were the next step. Switched
                to primary (emerald) so the eye knows exactly where
                to go after the side-by-side. */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {offers.map((offer) => (
                <Link
                  key={offer.id}
                  href={localePath(locale, getOfferHref(offer))}
                  prefetch
                  className={`${buttonStyles({ variant: "primary", size: "sm" })} justify-center`}
                >
                  See {offer.providerName} details
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Decide whether smaller numeric values win for this metric label or
// larger ones do. Conservative — returns null for ambiguous labels so we
// don't accidentally crown the wrong cell.
type Direction = "lower" | "higher" | null;

function metricDirection(label: string): Direction {
  const l = label.toLowerCase();
  if (/\b(fee|cost|apr|spread|premium|deductible|excess|markup)\b/.test(l)) {
    return "lower";
  }
  if (/\b(rate|cashback|yield|return|coverage|cover|amount|limit|countries|currencies|days|term)\b/.test(l)) {
    return "higher";
  }
  return null;
}

function pickWinnerIndex(
  cells: Array<{ value: string } | undefined>,
  direction: Direction,
): number | null {
  if (!direction) return null;
  let bestIdx: number | null = null;
  let bestNum: number | null = null;
  for (let i = 0; i < cells.length; i++) {
    const v = cells[i]?.value;
    if (!v) continue;
    const n = extractMetricNumber(v);
    if (n === null) continue;
    if (bestNum === null) { bestIdx = i; bestNum = n; continue; }
    if (direction === "lower" ? n < bestNum : n > bestNum) {
      bestIdx = i;
      bestNum = n;
    }
  }
  return bestIdx;
}
