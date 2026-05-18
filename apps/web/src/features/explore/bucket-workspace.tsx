"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";
import type { MarketplaceCategory, MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import { OfferRowAtlas } from "@/features/marketplace/offer-row-atlas";
import { sortOffers, type SortKey } from "@/lib/marketplace-engine";
import { getDictionary } from "@/lib/i18n";
import { InvestmentIntelligenceBlock } from "@/components/investment-intelligence-block";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "fees", label: "Lowest fees" },
  { value: "speed", label: "Fastest" },
  { value: "recommended", label: "Recommended" },
];

interface BucketWorkspaceProps {
  bucketSlug: string;
  bucketCategories: MarketplaceCategory[];
  offers: MarketplaceOffer[];
  locale: MarketplaceLocale;
  countryName: string;
  marketLabel: string;
}

export function BucketWorkspace({
  bucketSlug,
  bucketCategories,
  offers,
  locale,
  countryName,
  marketLabel,
}: BucketWorkspaceProps) {
  const dictionary = getDictionary(locale);
  const [sortBy, setSortBy] = useState<SortKey>("relevance");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory | "all">("all");
  const [activeProvider, setActiveProvider] = useState<string>("");

  // Only show categories that actually have offers in this country.
  const presentCategories = useMemo(() => {
    const seen = new Set(offers.map((o) => o.category));
    return bucketCategories.filter((c) => seen.has(c));
  }, [bucketCategories, offers]);

  // Provider list scoped to the currently-selected category so the dropdown
  // doesn't dangle providers that have no offers in the selected slice.
  const providerOptions = useMemo(() => {
    const scope = activeCategory === "all" ? offers : offers.filter((o) => o.category === activeCategory);
    return Array.from(new Set(scope.map((o) => o.providerName))).sort();
  }, [offers, activeCategory]);

  const filteredAndSorted = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    let filtered = offers;
    if (activeCategory !== "all") {
      filtered = filtered.filter((o) => o.category === activeCategory);
    }
    if (activeProvider) {
      filtered = filtered.filter((o) => o.providerName === activeProvider);
    }
    if (trimmed) {
      filtered = filtered.filter(
        (o) =>
          o.title.toLowerCase().includes(trimmed) ||
          o.providerName.toLowerCase().includes(trimmed) ||
          (o.subtitle ?? "").toLowerCase().includes(trimmed),
      );
    }
    return sortOffers(filtered, sortBy, "all");
  }, [offers, sortBy, query, activeCategory, activeProvider]);

  const investmentOffers = useMemo(
    () => offers.filter((o) => o.category === "investments"),
    [offers],
  );

  const hasAnyFilter = activeCategory !== "all" || activeProvider !== "" || query !== "";

  return (
    <div className="grid gap-6">
      {bucketSlug === "invest-and-grow" && investmentOffers.length > 0 && (
        <InvestmentIntelligenceBlock
          locale={locale}
          marketLabel={marketLabel}
          offers={investmentOffers}
        />
      )}

      {/* Category pills — collapses to nothing when the bucket has a single category */}
      {presentCategories.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <CategoryPill
            label="All"
            active={activeCategory === "all"}
            onClick={() => {
              setActiveCategory("all");
              setActiveProvider("");
            }}
          />
          {presentCategories.map((cat) => (
            <CategoryPill
              key={cat}
              label={dictionary.categories[cat] ?? cat}
              active={activeCategory === cat}
              onClick={() => {
                setActiveCategory(cat);
                setActiveProvider("");
              }}
            />
          ))}
        </div>
      )}

      {/* Search + provider + sort row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search providers, products, offers…"
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-tertiary outline-none focus:border-accent-emerald sm:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-3">
          {providerOptions.length > 1 && (
            <label className="flex items-center gap-2 text-sm text-ink-secondary">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                Provider
              </span>
              <select
                value={activeProvider}
                onChange={(event) => setActiveProvider(event.target.value)}
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-accent-emerald"
              >
                <option value="">All</option>
                {providerOptions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
          )}

          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              Sort
            </span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortKey)}
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-accent-emerald"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {hasAnyFilter && (
            <button
              type="button"
              onClick={() => {
                setActiveCategory("all");
                setActiveProvider("");
                setQuery("");
              }}
              className="rounded-xl bg-bg-surface px-3 py-2 text-xs font-semibold text-ink-secondary transition-colors hover:bg-bg-overlay hover:text-ink"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <p className="text-[12px] text-ink-tertiary">
        Showing {filteredAndSorted.length} of {offers.length} options in {countryName}
      </p>

      {filteredAndSorted.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white px-8 py-12 text-center">
          <p className="text-[15px] text-ink-secondary">
            {hasAnyFilter
              ? `No matches in ${countryName} with the current filters.`
              : `No options currently available in ${countryName} for this category.`}
          </p>
          {hasAnyFilter && (
            <button
              type="button"
              onClick={() => {
                setActiveCategory("all");
                setActiveProvider("");
                setQuery("");
              }}
              className="mt-3 text-[14px] font-medium text-accent-emerald hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {filteredAndSorted.map((offer) => (
            <OfferRowAtlas key={offer.id} offer={offer} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors",
        active
          ? "border-accent-emerald bg-accent-emerald-soft text-accent-emerald-strong"
          : "border-line bg-white text-ink-secondary hover:border-line-strong hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
