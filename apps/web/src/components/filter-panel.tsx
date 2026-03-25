"use client";

import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";
import clsx from "clsx";
import { useCallback, useState } from "react";

export interface FilterState {
  amount: number;
  term: number;
  creditScore: string | null;
  purpose: string | null;
  provider: string | null;
}

const defaultFilters: FilterState = {
  amount: 25000,
  term: 48,
  creditScore: null,
  purpose: null,
  provider: null,
};

const creditScoreOptions = [
  { label: "Excellent", detail: "720+" },
  { label: "Good", detail: "660 – 719" },
  { label: "Fair", detail: "600 – 659" },
  { label: "Building", detail: "Below 600" },
];

const purposeOptions: Record<MarketplaceCategory, string[]> = {
  loans: ["Debt consolidation", "Large purchases", "Home improvements", "Digital application", "Fast funding"],
  cards: ["Travel", "Cashback", "No FX fees", "BNPL", "Free card"],
  transfers: ["Best rates", "Remittances", "Fast delivery", "Free P2P", "Business payments"],
  exchange: ["Mid-market rate", "Rate alerts", "Business FX", "Multi-currency hold", "Free exchanges"],
};

function formatAmount(val: number) {
  if (val >= 1000) return `EUR ${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
  return `EUR ${val}`;
}

export function FilterPanel({
  category,
  offers,
  onFilter,
}: {
  category: MarketplaceCategory;
  offers: MarketplaceOffer[];
  onFilter: (filtered: MarketplaceOffer[]) => void;
}) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const isLoan = category === "loans";

  const providers = Array.from(new Set(offers.map((o) => o.providerName))).sort();

  const applyFilters = useCallback(
    (next: FilterState) => {
      let result = [...offers];

      // purpose / bestFor filter
      if (next.purpose) {
        result = result.filter((o) =>
          o.bestFor.some((b) => b.toLowerCase().includes(next.purpose!.toLowerCase())),
        );
      }

      // provider filter
      if (next.provider) {
        result = result.filter((o) => o.providerName === next.provider);
      }

      // amount filter (loans): exclude offers whose max amount is below slider
      if (isLoan) {
        result = result.filter((o) => {
          const amtMetric = o.metrics.find((m) => m.label === "Amount");
          if (!amtMetric) return true;
          const nums = amtMetric.value.match(/[\d,.]+/g);
          if (!nums || nums.length === 0) return true;
          const maxVal = parseFloat(nums[nums.length - 1].replace(/,/g, "")) * (amtMetric.value.includes("k") ? 1000 : 1);
          return maxVal >= next.amount;
        });
      }

      result.sort((a, b) => b.affiliatePriorityScore - a.affiliatePriorityScore);
      onFilter(result);
    },
    [offers, onFilter, isLoan],
  );

  const update = (patch: Partial<FilterState>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    applyFilters(next);
  };

  const reset = () => {
    setFilters(defaultFilters);
    applyFilters(defaultFilters);
  };

  const hasActiveFilter = filters.purpose !== null || filters.provider !== null || (isLoan && filters.amount !== 25000);

  return (
    <aside className="h-fit rounded-2xl border border-line bg-bg-elevated p-6 lg:sticky lg:top-20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-caption uppercase tracking-widest text-primary">Refine</p>
          <h2 className="mt-2 text-h3 text-ink">Filter results</h2>
        </div>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={reset}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary-soft"
          >
            Reset all
          </button>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
        Narrow offers by {isLoan ? "amount, purpose, and provider" : "use case and provider"}.
      </p>

      <div className="mt-6 grid gap-6">
        {/* Amount slider (loans only) */}
        {isLoan && (
          <section>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="amount" className="text-sm font-medium text-ink">
                Amount needed
              </label>
              <span className="rounded-md bg-bg-surface px-2.5 py-1 text-xs font-semibold tabular-nums text-primary">
                {formatAmount(filters.amount)}
              </span>
            </div>
            <input
              id="amount"
              type="range"
              min={1000}
              max={80000}
              step={1000}
              value={filters.amount}
              onChange={(e) => update({ amount: Number(e.target.value) })}
              className="mt-3 w-full accent-primary"
            />
            <div className="mt-1.5 flex items-center justify-between text-xs text-ink-tertiary">
              <span>EUR 1k</span>
              <span>EUR 80k</span>
            </div>
          </section>
        )}

        {/* Purpose / use-case */}
        <section>
          <p className="mb-3 text-sm font-medium text-ink">
            {isLoan ? "Purpose" : "Best for"}
          </p>
          <div className="grid gap-1.5">
            {purposeOptions[category].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => update({ purpose: filters.purpose === option ? null : option })}
                className={clsx(
                  "flex items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition-all duration-200",
                  filters.purpose === option
                    ? "border-line-active bg-primary-soft font-medium text-ink"
                    : "border-line bg-bg-surface text-ink-secondary hover:border-line-strong hover:text-ink",
                )}
              >
                <span>{option}</span>
                {filters.purpose === option && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary">
                    <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Provider filter */}
        <section>
          <label htmlFor="provider" className="mb-2 block text-sm font-medium text-ink">
            Provider
          </label>
          <select
            id="provider"
            value={filters.provider ?? ""}
            onChange={(e) => update({ provider: e.target.value || null })}
            className="h-11 w-full rounded-xl border border-line bg-bg-surface px-4 text-sm text-ink transition-colors focus:border-line-active focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All providers</option>
            {providers.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </section>
      </div>

      <div className="mt-6 border-t border-line pt-4">
        <p className="text-xs leading-5 text-ink-tertiary">
          Filters refine comparison views using provider data and Payn&apos;s ranking rules.
        </p>
      </div>
    </aside>
  );
}
