"use client";

import type { MarketplaceCategory, MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProviderLogo } from "@/components/provider-logo";
import { getOfferHref } from "@/lib/marketplace";
import { localePath } from "@/lib/locale";
import { discoverCopy as t } from "@/copy/discover.en";
import { parseSearch } from "@/lib/discover/parseSearch";

const placeholders = [...t.hero.searchPlaceholder];

const quickStart = [...t.hero.quickStart];

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
  onGoalSelect: (goal: MarketplaceCategory) => void;
  continueOffer?: MarketplaceOffer | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseSearch(query);
    if (parsed.goal) {
      onGoalSelect(parsed.goal as MarketplaceCategory);
    } else {
      onGoalSelect("transfers");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-line bg-white px-6 py-8 shadow-card sm:px-10 sm:py-12">
      {continueOffer && (
        <Link
          href={localePath(locale, getOfferHref(continueOffer))}
          className="absolute right-6 top-6 hidden items-center gap-2 rounded-[16px] border border-line bg-bg-surface px-4 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:border-accent-emerald/40 hover:bg-white hover:text-accent-emerald-strong lg:flex"
        >
          <span className="text-ink-tertiary">↩</span>
          <span>
            {t.hero.continueCard.prefix}{" "}
            <strong className="text-ink">{continueOffer.providerName}</strong>{" "}
            · {t.hero.continueCard.cta}
          </span>
        </Link>
      )}

      <div className="mx-auto max-w-[720px] text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-emerald-strong">
          {t.hero.eyebrow}
        </p>
        <h1 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.035em] text-ink sm:text-[2.5rem]">
          {t.hero.headline}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-ink-secondary">
          {t.hero.subhead}
        </p>

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

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="py-2 text-sm text-ink-tertiary">{t.hero.quickStartLabel}</span>
          {quickStart.map((chip) => (
            <button
              key={chip.goal}
              type="button"
              onClick={() => onGoalSelect(chip.goal as MarketplaceCategory)}
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
