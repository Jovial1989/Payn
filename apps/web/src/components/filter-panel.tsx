"use client";

import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";
import clsx from "clsx";
import { useCallback, useState } from "react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { formatCurrency } from "@/lib/format";
import { getMessages } from "@/lib/messages";

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

const purposeOptions: Record<MarketplaceCategory, string[]> = {
  loans:     ["Debt consolidation", "Large purchases", "Home improvements", "Digital application", "Fast funding"],
  cards:     ["Travel", "Cashback", "No FX fees", "BNPL", "Free card"],
  banking:   ["No monthly fee", "High-yield savings", "Multi-currency", "Mobile-first", "EU-wide"],
  transfers: ["Best rates", "Remittances", "Fast delivery", "Free P2P", "Business payments"],
  exchange:  ["Mid-market rate", "Rate alerts", "Business FX", "Multi-currency hold", "Free exchanges"],
  insurance: ["Health cover", "Travel cover", "Car cover", "Family protection", "Digital claims"],
  investments: ["Stocks", "ETF plans", "Long-term investing", "Low-cost trading", "Recurring buy"],
  crypto:    ["Buy crypto", "Crypto card", "Staking", "DeFi access", "Low fees"],
  business:  ["Multi-currency", "Team cards", "Invoicing", "Fast setup", "No hidden fees"],
  budgeting: ["Spending insights", "Savings goals", "Bill tracking", "Cashback", "Open banking"],
  kids:      ["Pocket money", "Parental controls", "Financial literacy", "Debit card", "Chores & rewards"],
  savings:   ["High interest", "Instant access", "Deposit protection", "No minimum", "EU-regulated"],
  trading:   ["Stocks", "ETFs", "Zero commission", "Fractional shares", "Recurring buy"],
  bnpl:      ["0% interest", "Flexible splits", "No new account", "Instant approval", "Pay in 30 days"],
  debit:     ["Multi-currency", "No FX fees", "Travel perks", "Free ATM", "Instant payments"],
  remittance:["Best rates", "Fast delivery", "Mobile money", "Cash pickup", "Large amounts"],
  travel:    ["No FX fees", "Travel insurance", "Lounge access", "Free ATM abroad", "Global acceptance"],
  cashback:  ["All spending", "Partner brands", "Flat rate", "No fee", "Points system"],
  wallets:   ["Online payments", "Multi-currency", "Instant transfers", "Low fees", "Crypto support"],
  payroll:   ["Remote teams", "Global payroll", "Contractor payments", "EOR", "Invoicing"],
  tax:       ["Self-assessment", "Fast filing", "Refund optimisation", "Accountant help", "Freelancers"],
  expense:   ["Company cards", "Receipt capture", "Accounting sync", "Budget limits", "Team spending"],
  neobanks:  ["Free account", "Multi-currency", "No credit check", "Instant setup", "Travel-friendly"],
};

function formatAmount(locale: string, val: number) {
  if (val >= 1000) {
    return `${formatCurrency(locale as never, val, "EUR").replace(/\s?€|EUR\s?/g, "").trim()}k`;
  }
  return formatCurrency(locale as never, val, "EUR");
}

// STRAT.4 — behavioural quick-pick pills get a small SVG glyph (never an
// emoji — emojis are font-dependent and off-brand) chosen from the pill's
// own wording, so "Travel" gets a compass, "Free ATM" a banknote, etc.
// Falls back to a check glyph for anything unmatched.
function PillIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  const s = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  let inner: React.ReactNode;
  if (/travel|abroad|lounge|global|accept/.test(l)) {
    inner = (
      <>
        <circle cx="7" cy="7" r="5" />
        <path d="M9.3 4.7L7.8 7.8 4.7 9.3 6.2 6.2z" />
      </>
    );
  } else if (/cashback|points|reward/.test(l)) {
    inner = (
      <>
        <path d="M3.5 10.5l7-7" />
        <circle cx="4.6" cy="4.6" r="1" />
        <circle cx="9.4" cy="9.4" r="1" />
      </>
    );
  } else if (/atm|cash|withdraw/.test(l)) {
    inner = (
      <>
        <rect x="1.8" y="3.5" width="10.4" height="7" rx="1.5" />
        <circle cx="7" cy="7" r="1.6" />
      </>
    );
  } else if (/fx|fee|free|hidden|no monthly/.test(l)) {
    inner = (
      <>
        <path d="M2.5 7.5V2.8h4.7L12 7.5 7.5 12z" />
        <circle cx="5" cy="5" r="0.7" />
      </>
    );
  } else if (/fast|instant|quick|setup|fund|delivery/.test(l)) {
    inner = <path d="M7.6 1.5L3.2 8h3.1l-1 4.5L11 5.5H7.1z" />;
  } else if (/interest|yield|saving|grow|invest|stock|etf|return|long-term/.test(l)) {
    inner = (
      <>
        <path d="M2 10l3-3 2.5 2.5L12 4" />
        <path d="M9.2 4H12v2.8" />
      </>
    );
  } else if (/multi-currency|exchange|rate|hold|transfer|remit|p2p|send|payment/.test(l)) {
    inner = (
      <>
        <path d="M2.5 5h7.5L8 3" />
        <path d="M11.5 9H4l2 2" />
      </>
    );
  } else if (/business|team|invoic|payroll|company|expense|contractor/.test(l)) {
    inner = (
      <>
        <rect x="2" y="4" width="10" height="7.5" rx="1.2" />
        <path d="M5 4V2.8h4V4" />
      </>
    );
  } else {
    inner = <path d="M3 7.3l2.6 2.6L11 4.2" />;
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" {...s}>
      {inner}
    </svg>
  );
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
  const { locale } = useMarketplacePreferences();
  const messages = getMessages(locale);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const isLoan = category === "loans";

  const providers = Array.from(new Set(offers.map((o) => o.providerName))).sort();

  const applyFilters = useCallback(
    (next: FilterState) => {
      let result = [...offers];

      if (next.purpose) {
        result = result.filter((o) =>
          o.bestFor.some((b) => b.toLowerCase().includes(next.purpose!.toLowerCase())),
        );
      }

      if (next.provider) {
        result = result.filter((o) => o.providerName === next.provider);
      }

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
    <aside className="h-fit rounded-3xl border border-line bg-white p-6 shadow-card lg:sticky lg:top-20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-tertiary">{messages.filters.eyebrow}</p>
          <h2 className="mt-2 text-h3 text-ink">{messages.filters.title}</h2>
        </div>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-bg-surface px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:bg-bg-overlay hover:text-ink"
          >
            {messages.filters.reset}
          </button>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
        {isLoan ? messages.filters.loanDescription : messages.filters.defaultDescription}
      </p>

      <div className="mt-6 grid gap-6">
        {isLoan && (
          <section>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="amount" className="text-sm font-medium text-ink">
                {messages.filters.amountNeeded}
              </label>
              <span className="rounded-full bg-bg-surface px-3 py-1 text-xs font-bold tabular-nums text-ink">
                {formatAmount(locale, filters.amount)}
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
              className="mt-3 w-full"
            />
            <div className="mt-1.5 flex items-center justify-between text-xs text-ink-tertiary">
              <span>EUR 1k</span>
              <span>EUR 80k</span>
            </div>
          </section>
        )}

        <section>
          <p className="mb-3 text-sm font-medium text-ink">
            {isLoan ? messages.filters.purpose : messages.filters.bestFor}
          </p>
          {/* STRAT.4 — behavioural quick-pick pills: horizontal, icon-led,
              single-select. They drive the same proven bestFor filter as
              before (applyFilters), just presented as warmer pills instead
              of a stacked checklist. */}
          <div className="flex flex-wrap gap-2">
            {purposeOptions[category].map((option) => {
              const active = filters.purpose === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => update({ purpose: active ? null : option })}
                  aria-pressed={active}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-all duration-200",
                    active
                      ? "border-accent-emerald/30 bg-accent-emerald-soft font-semibold text-accent-emerald-strong"
                      : "border-line bg-white font-medium text-ink-secondary hover:border-line-strong hover:text-ink",
                  )}
                >
                  <PillIcon label={option} />
                  {option}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <label htmlFor="provider" className="mb-2 block text-sm font-medium text-ink">
            {messages.filters.provider}
          </label>
          <select
            id="provider"
            value={filters.provider ?? ""}
            onChange={(e) => update({ provider: e.target.value || null })}
            className="h-11 w-full rounded-2xl border border-line bg-white px-4 text-sm text-ink transition-colors focus:border-accent-emerald/30 focus:outline-none focus:ring-2 focus:ring-accent-emerald/10"
          >
            <option value="">{messages.filters.allProviders}</option>
            {providers.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </section>
      </div>

      <div className="mt-6 border-t border-line pt-4">
        <p className="text-xs leading-5 text-ink-tertiary">
          {messages.filters.footer}
        </p>
      </div>
    </aside>
  );
}
