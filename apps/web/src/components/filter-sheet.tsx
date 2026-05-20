"use client";

import { useEffect, useRef, useState } from "react";

// ─── FilterSheet ───────────────────────────────────────────────────────────────
//
// Pill button + popover dropdown. Replaces the previous BottomSheet
// version which slid up from the bottom of the viewport — on desktop
// users click a pill at the top of the page and the sheet appeared
// hundreds of pixels below the cursor, behind a screen-wide blur
// backdrop, so it read as "nothing happened".
//
// Now:
//   • Click the pill → a popover opens anchored under the pill.
//   • Click outside (or hit Escape) → closes.
//   • Pick a row → onChange fires + popover closes.
//   • The active row gets the emerald check + bold styling so the
//     current state is unambiguous before close.
//
// Multi-select is a future extension — when needed, swap the row
// onClick to a checkbox toggle and add a sticky footer with Apply.

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  const displayValue = selected?.label ?? emptyLabel;

  // Outside-click + Escape close. Bind only while open so we don't leak
  // a global listener on every pill in the row.
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="group inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-ink shadow-subtle transition-all hover:-translate-y-px hover:border-accent-emerald/40 hover:shadow-card active:scale-[0.98]"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
          {label}
        </span>
        <span className="text-ink">{displayValue}</span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full z-30 mt-2 min-w-[240px] max-w-[320px] overflow-hidden rounded-2xl border border-line bg-white shadow-elevated"
        >
          <div className="border-b border-line px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              {label}
            </p>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto py-1">
            {options.map((opt) => {
              const isActive = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-bg-surface"
                  >
                    <div className="min-w-0">
                      <p
                        className={[
                          "text-[14px] leading-tight",
                          isActive
                            ? "font-bold text-accent-emerald-strong"
                            : "font-semibold text-ink",
                        ].join(" ")}
                      >
                        {opt.label}
                      </p>
                      {opt.hint && (
                        <p className="mt-0.5 text-[11px] text-ink-tertiary">
                          {opt.hint}
                        </p>
                      )}
                    </div>
                    {isActive ? (
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-emerald text-white">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M3 6.2L5 8 9 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    ) : (
                      <span className="inline-block h-5 w-5 shrink-0 rounded-full border border-line" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
