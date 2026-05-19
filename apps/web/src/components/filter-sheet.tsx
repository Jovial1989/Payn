"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/bottom-sheet";

// ─── FilterSheet ───────────────────────────────────────────────────────────────
//
// Replaces the native <select> pattern on catalogue filters with a
// premium button + bottom-sheet combo. Works the same on mobile and
// desktop — premium products don't have a different filter UI on each
// viewport (Revolut, Stripe, Linear all use the same control surface).
//
// Behaviour:
//   • The button shows the current label + chevron.
//   • Click opens a BottomSheet with all options as radio rows.
//   • Tapping a row immediately applies + closes (no extra "Apply" tap).
//   • The selected row gets the emerald check + active styling so the
//     state is unambiguous before close.
//
// Multi-select is a future extension — when needed, accept an `array`
// `value` shape and add a sticky footer with Reset/Apply.

interface FilterOption {
  value: string;
  label: string;
  /** Optional sub-line (e.g. "12 offers"). */
  hint?: string;
}

interface FilterSheetProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  /** Optional "All" sentinel label override. Defaults to the option whose
   *  value is empty-string. */
  emptyLabel?: string;
}

export function FilterSheet({
  label,
  value,
  options,
  onChange,
  emptyLabel = "All",
}: FilterSheetProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const displayValue = selected?.label ?? emptyLabel;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-ink shadow-subtle transition-all hover:-translate-y-px hover:border-accent-emerald/40 hover:shadow-card active:scale-[0.98]"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
          {label}
        </span>
        <span className="text-ink">{displayValue}</span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={label}
      >
        <ul className="grid">
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 border-b border-line py-3.5 text-left transition-colors hover:bg-bg-surface"
                >
                  <div className="min-w-0">
                    <p
                      className={[
                        "text-[15px] leading-tight",
                        isActive ? "font-bold text-accent-emerald-strong" : "font-semibold text-ink",
                      ].join(" ")}
                    >
                      {opt.label}
                    </p>
                    {opt.hint && (
                      <p className="mt-0.5 text-[12px] text-ink-tertiary">{opt.hint}</p>
                    )}
                  </div>
                  {isActive ? (
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-emerald text-white">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M3 6.2L5 8 9 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : (
                    <span className="inline-block h-6 w-6 shrink-0 rounded-full border border-line" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </>
  );
}
