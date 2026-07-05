"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
// P2.7 — When the option list is long (≥12 rows) we auto-add a search
// input at the top of the popover. Provider and "Focus" dropdowns
// were the main offenders (60+ providers, scroll-only). Now the user
// can type "rev" → see Revolut, Revtech, etc.
//
// Multi-select is a future extension — when needed, swap the row
// onClick to a checkbox toggle and add a sticky footer with Apply.

const SEARCH_THRESHOLD = 12;

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
  /** Force the search box on/off. Defaults to auto (≥12 options). */
  searchable?: boolean;
}

export function FilterSheet({
  label,
  value,
  options,
  onChange,
  emptyLabel = "All",
  searchable,
}: FilterSheetProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selected = options.find((o) => o.value === value);
  const displayValue = selected?.label ?? emptyLabel;
  const showSearch = searchable ?? options.length >= SEARCH_THRESHOLD;

  // Filter options against the typed query — fuzzy contains, case-
  // insensitive. The first row ("All providers" / "All categories")
  // stays pinned at the top even when a query is active, so the user
  // can always clear the filter without retyping.
  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o, i) => {
      // Pin the empty-value row at the top, regardless of label match.
      if (i === 0 && o.value === "") return true;
      return o.label.toLowerCase().includes(q);
    });
  }, [options, query]);

  // Outside-click + Escape close. Bind only while open so we don't leak
  // a global listener on every pill in the row.
  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
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
    // Auto-focus the search input on open so the user can type
    // immediately. Tiny timeout because the input isn't mounted on the
    // same frame as setOpen(true).
    if (showSearch) {
      const t = window.setTimeout(() => searchInputRef.current?.focus(), 40);
      return () => {
        document.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("keydown", handleKey);
        window.clearTimeout(t);
      };
    }
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, showSearch]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-ink shadow-subtle transition-all hover:-translate-y-px hover:border-accent-emerald/40 hover:shadow-card active:scale-[0.98]"
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
          // RESP.3 — On 375px viewport, the previous fixed 340px max
          // pushed the popover off-screen when a pill sat near the
          // right edge. Cap to viewport minus a 16px safety margin so
          // the popover always fits no matter which pill triggered
          // it; sm+ relaxes back to a generous 360px.
          className="absolute left-0 top-full z-30 mt-2 min-w-[220px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-line bg-white shadow-elevated sm:min-w-[260px] sm:max-w-[360px]"
        >
          <div className="border-b border-line px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              {label}
            </p>
          </div>

          {showSearch && (
            <div className="border-b border-line px-3 py-2">
              <div className="flex items-center gap-2 rounded-full bg-bg-surface px-3 py-1.5">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="text-ink-tertiary"
                >
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}…`}
                  className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-ink-tertiary focus:outline-none"
                  aria-label={`Search ${label.toLowerCase()}`}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="text-ink-tertiary transition-colors hover:text-ink"
                    aria-label="Clear search"
                  >
                    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          <ul className="max-h-[60vh] overflow-y-auto py-1">
            {filteredOptions.length === 0 && (
              <li>
                <p className="px-4 py-6 text-center text-[13px] text-ink-tertiary">
                  No matches for &ldquo;{query}&rdquo;
                </p>
              </li>
            )}
            {filteredOptions.map((opt) => {
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
