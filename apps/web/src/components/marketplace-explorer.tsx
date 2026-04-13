"use client";

import type { MarketplaceLocale, MarketplaceMarket, MarketplaceOffer } from "@payn/types";
import clsx from "clsx";
import Link from "next/link";
import { startTransition, useCallback, useDeferredValue, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/button";
import { ComparisonTable, ComparisonTray } from "@/components/comparison-table";
import { InvestmentIntelligenceBlock } from "@/components/investment-intelligence-block";
import { OfferCard } from "@/components/offer-card";
import { Tag } from "@/components/tag";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { getCountryCurrency } from "@/lib/countries";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import {
  countOffersByCategory,
  defaultMarketplaceFilters,
  filterMarketplaceOffers,
  getFeatureOptions,
  getProviderOptions,
  getSubtypeOptions,
  type SortKey,
} from "@/lib/marketplace-engine";
import {
  explorerCategories,
  marketplaceCategories,
  roundOfferCount,
  type ExplorerCategory,
} from "@/lib/marketplace";
import { getUiCopy } from "@/lib/ui-copy";

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "apr", label: "APR (low to high)" },
  { value: "fees", label: "Fees (low to high)" },
  { value: "provider", label: "Provider (A-Z)" },
  { value: "updated", label: "Recently updated" },
];

function totalCategoryCount(counts: Record<(typeof marketplaceCategories)[number], number>) {
  return marketplaceCategories.reduce((sum, category) => sum + counts[category], 0);
}

function formatAmountLabel(value: number, locale: MarketplaceLocale, currency: string) {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency === "GBP" ? "GBP" : "EUR",
    maximumFractionDigits: 0,
  });

  return formatter.format(value);
}

export function MarketplaceExplorer({
  offers,
  initialMarket,
  initialCategory = "all",
  mode,
}: {
  offers: MarketplaceOffer[];
  initialMarket: MarketplaceMarket;
  initialCategory?: ExplorerCategory;
  mode: "home" | "category";
}) {
  const router = useRouter();
  const preferences = useMarketplacePreferences();
  const [selectedCategory, setSelectedCategory] = useState<ExplorerCategory>(initialCategory);
  const [filters, setFilters] = useState(defaultMarketplaceFilters);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const deferredQuery = useDeferredValue(filters.query);

  const dictionary = getDictionary(preferences.locale);
  const uiCopy = getUiCopy(preferences.locale);
  const activeFilters = { ...filters, query: deferredQuery };
  const categoryCounts = countOffersByCategory(offers, preferences.country);
  const visibleOffers = filterMarketplaceOffers({
    offers,
    country: preferences.country,
    category: selectedCategory,
    filters: activeFilters,
  });
  const totalCount = visibleOffers.length;
  const shownOffers = visibleOffers.slice(0, visibleCount);
  const hasMore = visibleCount < totalCount;
  const providerOptions = getProviderOptions(offers, preferences.country, selectedCategory);
  const featureOptions = getFeatureOptions(offers, preferences.country, selectedCategory);
  const subtypeOptions = getSubtypeOptions(offers, preferences.country, selectedCategory);
  const activeCategoryDescription =
    selectedCategory === "all"
      ? dictionary.explorer.description
      : dictionary.categoryDescriptions[selectedCategory];

  const updateCategory = (nextCategory: ExplorerCategory) => {
    setSelectedCategory(nextCategory);
    setFilters((current) => ({ ...defaultMarketplaceFilters, query: current.query }));
    setVisibleCount(PAGE_SIZE);

    if (mode === "category" && nextCategory !== "all") {
      startTransition(() => {
        router.push(localePath(preferences.locale, `/${nextCategory}`));
      });
    }
  };

  const updateCountry = (nextCountry: string) => {
    preferences.setCountry(nextCountry);
    setVisibleCount(PAGE_SIZE);

    if (mode === "category" && selectedCategory !== "all") {
      startTransition(() => {
        router.push(localePath(preferences.locale, `/${selectedCategory}`));
      });
    }
  };

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const compareOffers = offers.filter((o) => compareIds.has(o.id));

  return (
    <div className="grid gap-6">
      <section className="rounded-[32px] border border-line bg-white p-5 shadow-card sm:p-7">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
                {dictionary.explorer.eyebrow}
              </p>
              <h1 className="mt-3 text-h2 text-ink lg:text-h1">{dictionary.explorer.title}</h1>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-secondary">
                {activeCategoryDescription}
              </p>
            </div>
            {selectedCategory !== "all" && (
              <Link
                href={localePath(preferences.locale, `/${selectedCategory}`)}
                className={buttonStyles({ variant: "secondary", size: "md" })}
              >
                {dictionary.explorer.openCategoryPage}
              </Link>
            )}
          </div>

          <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
            <label className="grid gap-2 rounded-[24px] border border-line bg-bg-surface p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                {dictionary.filters.countryLabel}
              </span>
              <select
                value={preferences.country}
                onChange={(event) => updateCountry(event.target.value)}
                className="h-11 rounded-2xl border border-line bg-white px-4 text-sm font-medium text-ink outline-none transition-colors focus:border-black"
              >
                {preferences.availableCountries.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 rounded-[24px] border border-line bg-bg-surface p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                {dictionary.filters.searchLabel}
              </span>
              <input
                value={filters.query}
                onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                placeholder={dictionary.filters.searchPlaceholder}
                className="h-11 rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-tertiary focus:border-black"
              />
            </label>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-line bg-[#FBFBFA] p-4">
            <div className="flex flex-wrap gap-2">
              {explorerCategories.map((category) => {
                const count =
                  category === "all"
                    ? totalCategoryCount(categoryCounts)
                    : categoryCounts[category];

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => updateCategory(category)}
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                      selectedCategory === category
                        ? "bg-black text-white"
                        : "bg-white text-ink-secondary hover:bg-white hover:text-ink",
                    )}
                  >
                    <span>{dictionary.categories[category]}</span>
                    <span
                      className={clsx(
                        "rounded-full px-2 py-0.5 text-xs",
                        selectedCategory === category ? "bg-white/15 text-white" : "bg-bg-surface text-ink-tertiary",
                      )}
                    >
                      {roundOfferCount(count)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="grid gap-2">
                <span className="text-xs font-medium text-ink-secondary">{dictionary.filters.providerLabel}</span>
                <select
                  value={filters.provider}
                  onChange={(event) => setFilters((current) => ({ ...current, provider: event.target.value }))}
                  className="h-11 rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-black"
                >
                  <option value="">{dictionary.filters.anyProvider}</option>
                  {providerOptions.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-medium text-ink-secondary">{dictionary.filters.featureLabel}</span>
                <select
                  value={filters.feature}
                  onChange={(event) => setFilters((current) => ({ ...current, feature: event.target.value }))}
                  className="h-11 rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-black"
                >
                  <option value="">{dictionary.filters.anyFeature}</option>
                  {featureOptions.map((feature) => (
                    <option key={feature} value={feature}>
                      {feature}
                    </option>
                  ))}
                </select>
              </label>

              {(selectedCategory === "insurance" || selectedCategory === "investments") && (
                <label className="grid gap-2">
                  <span className="text-xs font-medium text-ink-secondary">{dictionary.filters.subtypeLabel}</span>
                  <select
                    value={filters.subtype}
                    onChange={(event) => setFilters((current) => ({ ...current, subtype: event.target.value }))}
                    className="h-11 rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-black"
                  >
                    <option value="">{dictionary.filters.anySubtype}</option>
                    {subtypeOptions.map((subtype) => (
                      <option key={subtype} value={subtype}>
                        {subtype}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {selectedCategory === "loans" && (
                <>
                  <label className="grid gap-2">
                    <span className="text-xs font-medium text-ink-secondary">{dictionary.filters.amountLabel}</span>
                    <div className="rounded-2xl border border-line bg-white px-4 py-3">
                        <div className="flex items-center justify-between text-sm font-semibold text-ink">
                        <span>
                          {formatAmountLabel(
                            filters.amount,
                            preferences.locale,
                            getCountryCurrency(preferences.country),
                          )}
                        </span>
                        <span className="text-xs font-medium text-ink-tertiary">
                          {getCountryCurrency(preferences.country)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={80000}
                        step={1000}
                        value={filters.amount}
                        onChange={(event) =>
                          setFilters((current) => ({ ...current, amount: Number(event.target.value) }))
                        }
                        className="mt-3 w-full"
                      />
                    </div>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-medium text-ink-secondary">{dictionary.filters.termLabel}</span>
                    <select
                      value={filters.term}
                      onChange={(event) => setFilters((current) => ({ ...current, term: Number(event.target.value) }))}
                      className="h-11 rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-black"
                    >
                      {[12, 24, 36, 48, 60, 72, 84].map((term) => (
                        <option key={term} value={term}>
                          {term} {uiCopy.common.months}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setFilters(defaultMarketplaceFilters);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={buttonStyles({ variant: "ghost", size: "md", fullWidth: true })}
              >
                {dictionary.filters.reset}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 rounded-[32px] bg-[#F5F5F7] p-4 sm:p-5">
        {selectedCategory === "investments" ? (
          <InvestmentIntelligenceBlock locale={preferences.locale} />
        ) : null}

        <div className="rounded-[28px] border border-[#E2E4E8] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-ink">
                Showing {shownOffers.length} of {totalCount} {dictionary.explorer.resultsLabel}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
                {dictionary.explorer.filterSummary}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone="success">{preferences.countryLabel}</Tag>
              <Tag tone="muted">
                {providerOptions.length} {dictionary.explorer.providersLabel}
              </Tag>
              <label className="inline-flex items-center gap-2 rounded-full bg-bg-surface px-3 py-1.5">
                <span className="text-xs font-semibold text-ink-tertiary">Sort:</span>
                <select
                  value={filters.sortBy}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, sortBy: event.target.value as SortKey }))
                  }
                  className="bg-transparent text-xs font-semibold text-ink outline-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        {shownOffers.length === 0 && (
          <div className="rounded-[28px] border border-[#E2E4E8] bg-white p-10 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bg-surface">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-tertiary">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <p className="mt-4 text-lg font-bold text-ink">{dictionary.explorer.emptyTitle}</p>
            <p className="mt-2 max-w-xl justify-self-center text-sm leading-relaxed text-ink-secondary">
              {dictionary.explorer.emptyDescription}
            </p>
            <button
              type="button"
              onClick={() => {
                setFilters(defaultMarketplaceFilters);
                setSelectedCategory("all");
              }}
              className={buttonStyles({ variant: "secondary", size: "md" }) + " mt-5"}
            >
              Reset all filters
            </button>
          </div>
        )}

        {shownOffers.map((offer, index) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            rank={index + 1}
            locale={preferences.locale}
            compareSelected={compareIds.has(offer.id)}
            onToggleCompare={toggleCompare}
          />
        ))}

        {hasMore && (
          <div className="flex flex-col items-center gap-2 py-4">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className={buttonStyles({ variant: "secondary", size: "md" })}
            >
              Show more results
            </button>
            <p className="text-xs text-ink-tertiary">
              Showing {shownOffers.length} of {totalCount}
            </p>
          </div>
        )}
      </section>

      <ComparisonTray
        count={compareIds.size}
        locale={preferences.locale}
        onOpen={() => setCompareOpen(true)}
        onClear={() => setCompareIds(new Set())}
      />

      {compareOpen && compareOffers.length >= 2 && (
        <ComparisonTable
          offers={compareOffers}
          locale={preferences.locale}
          onRemove={(id) => {
            toggleCompare(id);
            if (compareIds.size <= 2) {
              setCompareOpen(false);
            }
          }}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </div>
  );
}
