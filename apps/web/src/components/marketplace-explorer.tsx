"use client";

import type { MarketplaceLocale, MarketplaceMarket, MarketplaceOffer } from "@payn/types";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useDeferredValue, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/button";
import { ComparisonTable, ComparisonTray } from "@/components/comparison-table";
import { InvestmentIntelligenceBlock } from "@/components/investment-intelligence-block";
import { OfferCard } from "@/components/offer-card";
import { OfferCardSkeleton } from "@/components/offer-card-skeleton";
import { Tag } from "@/components/tag";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import {
  AnalyticsEvent,
  buildWebAnalyticsProperties,
  trackAnalyticsEvent,
} from "@/lib/analytics";
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
  { value: "relevance", label: "Best match" },
  { value: "fees", label: "Lowest fee" },
  { value: "speed", label: "Fastest" },
  { value: "recommended", label: "Recommended" },
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

function buildEmptySuggestions(selectedCategory: ExplorerCategory, locale: MarketplaceLocale) {
  return [
    locale === "de" ? "Clear filters" : "Clear filters",
    selectedCategory === "all"
      ? locale === "de"
        ? "Open cards"
        : "Open cards"
      : locale === "de"
        ? "Show all categories"
        : "Show all categories",
    selectedCategory === "transfers"
      ? locale === "de"
        ? "Try exchange"
        : "Try exchange"
      : locale === "de"
        ? "Try transfers"
        : "Try transfers",
  ];
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
  const [isPending, startTransition] = useTransition();
  const { user, loading } = useAuth();
  const preferences = useMarketplacePreferences();
  const [selectedCategory, setSelectedCategory] = useState<ExplorerCategory>(initialCategory);
  const [filters, setFilters] = useState(defaultMarketplaceFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
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
  const isFiltering = deferredQuery !== filters.query || isPending;
  const emptySuggestions = buildEmptySuggestions(selectedCategory, preferences.locale);
  const summaryChips = useMemo(
    () =>
      [
        preferences.countryLabel,
        filters.provider,
        filters.feature,
        filters.subtype,
        filters.query ? `Search: ${filters.query}` : "",
      ].filter((value): value is string => Boolean(value)),
    [filters.feature, filters.provider, filters.query, filters.subtype, preferences.countryLabel],
  );

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
    const offer = offers.find((candidate) => candidate.id === id);
    const next = new Set(compareIds);
    const alreadySelected = next.has(id);

    if (alreadySelected) {
      next.delete(id);
    } else if (next.size < 3) {
      next.add(id);

      if (!loading && offer && next.size === 2) {
        trackAnalyticsEvent(AnalyticsEvent.CompareStarted, {
          ...buildWebAnalyticsProperties({
            category: offer.category,
            country: preferences.country,
            language: preferences.locale,
            loggedIn: Boolean(user),
            offerId: offer.id,
            provider: offer.providerName,
          }),
          compare_count: next.size,
        });
      }
    }

    setCompareIds(next);
  }, [compareIds, loading, offers, preferences.country, preferences.locale, user]);

  const compareOffers = offers.filter((o) => compareIds.has(o.id));

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <section className="section-shell p-5 sm:p-7">
        <div className="hero-orb hero-orb-emerald floating-layer left-[-12%] top-[-22%] h-[260px] w-[260px]" />
        <div className="hero-orb hero-orb-dark floating-layer-delayed right-[-10%] top-[2%] h-[220px] w-[220px]" />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
                {dictionary.explorer.eyebrow}
              </p>
              <h1 className="mt-3 text-h2 text-ink lg:text-h1">{dictionary.explorer.title}</h1>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-secondary">
                {activeCategoryDescription}
              </p>
            </div>
            <div className="surface-panel flex w-full max-w-[340px] items-center justify-between rounded-[24px] px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  Live ranking
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {roundOfferCount(totalCount)} options in {preferences.countryLabel}
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
          </div>

          <div className="surface-panel sticky top-[76px] z-20 -mx-2 rounded-[30px] p-2 sm:mx-0">
            {/* Category tabs */}
            <div className="flex snap-x gap-2 overflow-x-auto pb-1">
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
                    className="pill-chip shrink-0 snap-start text-sm font-semibold"
                    data-active={selectedCategory === category}
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

            {/* Search + country + filters toggle */}
            <div className="mt-2 flex gap-2">
              <input
                value={filters.query}
                onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                placeholder={dictionary.filters.searchPlaceholder}
                className="h-10 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-tertiary focus:border-accent-emerald"
              />
              <select
                value={preferences.country}
                onChange={(event) => updateCountry(event.target.value)}
                className="h-10 rounded-full border border-line bg-white px-3 text-sm font-medium text-ink outline-none transition-colors focus:border-accent-emerald"
              >
                {preferences.availableCountries.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className={clsx(
                  "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors",
                  filtersOpen || filters.provider || filters.feature || filters.subtype
                    ? "border-accent-emerald/30 bg-accent-emerald-soft text-accent-emerald-strong"
                    : "border-line bg-white text-ink-secondary hover:text-ink",
                )}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4h12M4 8h8M6 12h4" />
                </svg>
                {preferences.locale === "de" ? "Filter" : "Filters"}
              </button>
            </div>

            {/* Sort pills */}
            <div className="mt-2 flex snap-x gap-1.5 overflow-x-auto pb-1">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilters((current) => ({ ...current, sortBy: option.value }))}
                  className="pill-chip shrink-0 snap-start text-sm font-semibold"
                  data-active={filters.sortBy === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Collapsible advanced filters */}
            {filtersOpen && (
              <div className="mt-2 grid gap-2 border-t border-line pt-2 md:grid-cols-2 xl:grid-cols-4">
                <select
                  value={filters.provider}
                  onChange={(event) => setFilters((current) => ({ ...current, provider: event.target.value }))}
                  className="h-10 rounded-full border border-line bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-accent-emerald"
                >
                  <option value="">{dictionary.filters.anyProvider}</option>
                  {providerOptions.map((provider) => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>

                <select
                  value={filters.feature}
                  onChange={(event) => setFilters((current) => ({ ...current, feature: event.target.value }))}
                  className="h-10 rounded-full border border-line bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-accent-emerald"
                >
                  <option value="">{dictionary.filters.anyFeature}</option>
                  {featureOptions.map((feature) => (
                    <option key={feature} value={feature}>{feature}</option>
                  ))}
                </select>

                {(selectedCategory === "insurance" || selectedCategory === "investments") && (
                  <select
                    value={filters.subtype}
                    onChange={(event) => setFilters((current) => ({ ...current, subtype: event.target.value }))}
                    className="h-10 rounded-full border border-line bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-accent-emerald"
                  >
                    <option value="">{dictionary.filters.anySubtype}</option>
                    {subtypeOptions.map((subtype) => (
                      <option key={subtype} value={subtype}>{subtype}</option>
                    ))}
                  </select>
                )}

                {selectedCategory === "loans" && (
                  <>
                    <div className="rounded-full border border-line bg-white px-4 py-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-ink">
                        <span>{formatAmountLabel(filters.amount, preferences.locale, getCountryCurrency(preferences.country))}</span>
                        <span className="text-ink-tertiary">{getCountryCurrency(preferences.country)}</span>
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={80000}
                        step={1000}
                        value={filters.amount}
                        onChange={(event) => setFilters((current) => ({ ...current, amount: Number(event.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    <select
                      value={filters.term}
                      onChange={(event) => setFilters((current) => ({ ...current, term: Number(event.target.value) }))}
                      className="h-10 rounded-full border border-line bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-accent-emerald"
                    >
                      {[12, 24, 36, 48, 60, 72, 84].map((term) => (
                        <option key={term} value={term}>{term} {uiCopy.common.months}</option>
                      ))}
                    </select>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => { setFilters(defaultMarketplaceFilters); setVisibleCount(PAGE_SIZE); }}
                  className={buttonStyles({ variant: "ghost", size: "md" })}
                >
                  {dictionary.filters.reset}
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      <section className="grid gap-5 rounded-[36px] bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(245,247,244,0.92)_100%)] p-4 sm:p-5">
        {selectedCategory === "investments" ? (
          <InvestmentIntelligenceBlock locale={preferences.locale} />
        ) : null}

        <div className="surface-panel rounded-[30px] p-5 sm:p-6">
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
              {summaryChips.map((chip) => (
                <Tag key={chip} tone={chip === preferences.countryLabel ? "success" : "muted"}>
                  {chip}
                </Tag>
              ))}
              <Tag tone="blue">{SORT_OPTIONS.find((option) => option.value === filters.sortBy)?.label}</Tag>
            </div>
          </div>
        </div>

        {shownOffers.length === 0 && (
          <div className="premium-card rounded-[28px] p-10 text-center">
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
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilters(defaultMarketplaceFilters);
                  setSelectedCategory("all");
                }}
                className={buttonStyles({ variant: "secondary", size: "md" })}
              >
                {emptySuggestions[0]}
              </button>
              <button
                type="button"
                onClick={() => updateCategory(selectedCategory === "all" ? "cards" : "all")}
                className={buttonStyles({ variant: "ghost", size: "md" })}
              >
                {emptySuggestions[1]}
              </button>
              <button
                type="button"
                onClick={() => updateCategory(selectedCategory === "transfers" ? "exchange" : "transfers")}
                className={buttonStyles({ variant: "ghost", size: "md" })}
              >
                {emptySuggestions[2]}
              </button>
            </div>
          </div>
        )}

        {isFiltering
          ? Array.from({ length: Math.min(3, PAGE_SIZE) }).map((_, index) => (
              <OfferCardSkeleton key={`skeleton-${index}`} />
            ))
          : (
            <AnimatePresence mode="popLayout" initial={false}>
              {shownOffers.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
                  transition={{
                    duration: 0.38,
                    delay: Math.min(index * 0.04, 0.28),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <OfferCard
                    offer={offer}
                    rank={index + 1}
                    locale={preferences.locale}
                    compareSelected={compareIds.has(offer.id)}
                    onToggleCompare={toggleCompare}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

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
        onOpen={() => {
          trackAnalyticsEvent(AnalyticsEvent.CompareViewed, {
            ...buildWebAnalyticsProperties({
              category: selectedCategory === "all" ? null : selectedCategory,
              country: preferences.country,
              language: preferences.locale,
              loggedIn: Boolean(user),
            }),
            compare_count: compareOffers.length,
            offer_ids: compareOffers.map((offer) => offer.id),
            providers: compareOffers.map((offer) => offer.providerName),
          });
          setCompareOpen(true);
        }}
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
