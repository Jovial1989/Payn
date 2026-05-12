"use client";

import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProviderLogo } from "@/components/provider-logo";
import { getOfferHref } from "@/lib/marketplace";
import { localePath } from "@/lib/locale";

type GoalId = "transfers" | "loans" | "cards" | "exchange" | "insurance" | "investments";

const placeholders = [
  "Send €500 to Spain",
  "Best savings account in Germany",
  "0% credit card UK",
  "Personal loan, €10,000, 36 months",
  "Cheapest EUR → GBP transfer",
];

const chips: { id: GoalId; label: string }[] = [
  { id: "transfers", label: "Send money" },
  { id: "loans", label: "Borrow" },
  { id: "investments", label: "Save" },
  { id: "cards", label: "Spend abroad" },
];

function RotatingPlaceholder() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % placeholders.length);
        setVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {placeholders[index]}
    </span>
  );
}

export function DiscoverHero({
  locale,
  onGoalSelect,
  continueOffer,
}: {
  locale: MarketplaceLocale;
  onGoalSelect: (goal: GoalId) => void;
  continueOffer?: MarketplaceOffer | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple keyword parse — route to the closest goal
    const q = query.toLowerCase();
    if (q.includes("send") || q.includes("transfer") || q.includes("remit")) return onGoalSelect("transfers");
    if (q.includes("loan") || q.includes("borrow") || q.includes("credit")) return onGoalSelect("loans");
    if (q.includes("card") || q.includes("cashback") || q.includes("spend")) return onGoalSelect("cards");
    if (q.includes("exchange") || q.includes("currency") || q.includes("eur") || q.includes("gbp")) return onGoalSelect("exchange");
    if (q.includes("invest") || q.includes("etf") || q.includes("stock") || q.includes("sav")) return onGoalSelect("investments");
    if (q.includes("insur") || q.includes("cover")) return onGoalSelect("insurance");
    // Default: show transfers
    onGoalSelect("transfers");
  };

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-line bg-white px-6 py-8 shadow-card sm:px-10 sm:py-12">
      {/* Continue card — top-right, only when returning user */}
      {continueOffer && (
        <Link
          href={localePath(locale, getOfferHref(continueOffer))}
          className="absolute right-6 top-6 hidden items-center gap-2 rounded-[16px] border border-line bg-bg-surface px-4 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:border-accent-emerald/40 hover:bg-white hover:text-accent-emerald-strong lg:flex"
        >
          <span className="text-ink-tertiary">↩</span>
          <span>
            You were comparing <strong className="text-ink">{continueOffer.providerName}</strong> · Continue →
          </span>
        </Link>
      )}

      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-emerald-strong">
          Financial marketplace · Europe
        </p>
        <h1 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.035em] text-ink sm:text-[2.5rem]">
          Find money tools that actually fit you.
        </h1>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-ink-secondary">
          Compare cards, loans, transfers and savings across Europe. See the real cost upfront.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="relative flex items-center rounded-[20px] border border-line bg-white shadow-card transition-all focus-within:border-accent-emerald/40 focus-within:shadow-[0_4px_16px_rgba(15,138,75,0.10)]">
            <svg
              className="ml-4 h-5 w-5 shrink-0 text-ink-tertiary"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M15 15l3 3" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent px-3 py-4 text-base font-medium text-ink outline-none placeholder:text-transparent"
              placeholder=" "
              aria-label="Search for a financial product"
            />
            {!query && (
              <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-base text-ink-tertiary">
                <RotatingPlaceholder />
              </span>
            )}
            <button
              type="submit"
              className="mr-2 rounded-[14px] bg-accent-emerald px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-emerald-strong"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick-start chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onGoalSelect(chip.id)}
              className="rounded-full border border-line bg-bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary transition-all hover:border-accent-emerald/40 hover:bg-white hover:text-accent-emerald-strong"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
