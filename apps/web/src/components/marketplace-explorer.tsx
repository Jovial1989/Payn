"use client";

import type { MarketplaceLocale, MarketplaceMarket, MarketplaceOffer } from "@payn/types";
import clsx from "clsx";
import Link from "next/link";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/button";
import { OfferCard } from "@/components/offer-card";
import { Tag } from "@/components/tag";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { getDictionary } from "@/lib/i18n";
import {
  countOffersByCategory,
  defaultMarketplaceFilters,
  filterMarketplaceOffers,
  getFeatureOptions,
  getProviderOptions,
  getSubtypeOptions,
} from "@/lib/marketplace-engine";
import {
  explorerCategories,
  getMarketCategoryHref,
  marketplaceCategories,
  marketDefinitions,
  roundOfferCount,
  type ExplorerCategory,
} from "@/lib/marketplace";

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
  const deferredQuery = useDeferredValue(filters.query);

  useEffect(() => {
    if (preferences.market !== initialMarket) {
      preferences.setMarket(initialMarket);
    }
    setSelectedCategory(initialCategory);
  }, [initialCategory, initialMarket]);

  const dictionary = getDictionary(preferences.locale);
  const activeFilters = { ...filters, query: deferredQuery };
  const categoryCounts = countOffersByCategory(offers, preferences.market);
  const visibleOffers = filterMarketplaceOffers({
    offers,
    market: preferences.market,
    category: selectedCategory,
    filters: activeFilters,
  });
  const shownOffers = mode === "home" && selectedCategory === "all" ? visibleOffers.slice(0, 12) : visibleOffers;
  const providerOptions = getProviderOptions(offers, preferences.market, selectedCategory);
  const featureOptions = getFeatureOptions(offers, preferences.market, selectedCategory);
  const subtypeOptions = getSubtypeOptions(offers, preferences.market, selectedCategory);
  const activeCategoryDescription =
    selectedCategory === "all"
      ? dictionary.explorer.description
      : dictionary.categoryDescriptions[selectedCategory];

  const updateCategory = (nextCategory: ExplorerCategory) => {
    setSelectedCategory(nextCategory);
    setFilters((current) => ({ ...defaultMarketplaceFilters, query: current.query }));

    if (mode === "category" && nextCategory !== "all") {
      startTransition(() => {
        router.push(getMarketCategoryHref(preferences.market, nextCategory));
      });
    }
  };

  const updateMarket = (nextMarket: MarketplaceMarket) => {
    preferences.setMarket(nextMarket);

    if (mode === "category" && selectedCategory !== "all") {
      startTransition(() => {
        router.push(getMarketCategoryHref(nextMarket, selectedCategory));
      });
    }
  };

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
                href={getMarketCategoryHref(preferences.market, selectedCategory)}
                className={buttonStyles({ variant: "secondary", size: "md" })}
              >
                {dictionary.explorer.openCategoryPage}
              </Link>
            )}
          </div>

          <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
            <label className="grid gap-2 rounded-[24px] border border-line bg-bg-surface p-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                {dictionary.filters.countryLabel}
              </span>
              <select
                value={preferences.market}
                onChange={(event) => updateMarket(event.target.value as MarketplaceMarket)}
                className="h-11 rounded-2xl border border-line bg-white px-4 text-sm font-medium text-ink outline-none transition-colors focus:border-black"
              >
                {Object.entries(dictionary.markets).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 rounded-[24px] border border-line bg-bg-surface p-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
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
                        "rounded-full px-2 py-0.5 text-[11px]",
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
                            marketDefinitions[preferences.market].currency,
                          )}
                        </span>
                        <span className="text-xs font-medium text-ink-tertiary">
                          {marketDefinitions[preferences.market].currency}
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
                          {term} months
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}

              <button
                type="button"
                onClick={() => setFilters(defaultMarketplaceFilters)}
                className={buttonStyles({ variant: "ghost", size: "md", fullWidth: true })}
              >
                {dictionary.filters.reset}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-[28px] border border-line bg-white p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-ink">
                {shownOffers.length} {dictionary.explorer.resultsLabel}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
                {dictionary.explorer.filterSummary}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tag tone="success">{dictionary.markets[preferences.market]}</Tag>
              <Tag tone="muted">
                {providerOptions.length} {dictionary.explorer.providersLabel}
              </Tag>
              <Tag tone="muted">
                {dictionary.explorer.filteredFrom} {roundOfferCount(visibleOffers.length)}
              </Tag>
            </div>
          </div>
        </div>

        {shownOffers.length === 0 && (
          <div className="rounded-[28px] border border-line bg-white p-10 text-center shadow-card">
            <p className="text-lg font-bold text-ink">{dictionary.explorer.emptyTitle}</p>
            <p className="mt-2 max-w-xl justify-self-center text-sm leading-relaxed text-ink-secondary">
              {dictionary.explorer.emptyDescription}
            </p>
          </div>
        )}

        {shownOffers.map((offer, index) => (
          <OfferCard key={offer.id} offer={offer} rank={index + 1} locale={preferences.locale} />
        ))}
      </section>
    </div>
  );
}
