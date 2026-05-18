"use client";

import { useMemo, useState } from "react";
import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import { OfferRowAtlas } from "@/features/marketplace/offer-row-atlas";
import { sortOffers, type SortKey } from "@/lib/marketplace-engine";
import { InvestmentIntelligenceBlock } from "@/components/investment-intelligence-block";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "fees", label: "Lowest fees" },
  { value: "speed", label: "Fastest" },
  { value: "recommended", label: "Recommended" },
];

interface BucketWorkspaceProps {
  bucketSlug: string;
  offers: MarketplaceOffer[];
  locale: MarketplaceLocale;
  countryName: string;
  marketLabel: string;
}

export function BucketWorkspace({
  bucketSlug,
  offers,
  locale,
  countryName,
  marketLabel,
}: BucketWorkspaceProps) {
  const [sortBy, setSortBy] = useState<SortKey>("relevance");
  const [query, setQuery] = useState("");

  const filteredAndSorted = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const filtered = trimmed
      ? offers.filter(
          (o) =>
            o.title.toLowerCase().includes(trimmed) ||
            o.providerName.toLowerCase().includes(trimmed) ||
            (o.subtitle ?? "").toLowerCase().includes(trimmed),
        )
      : offers;
    // Pass "all" as the category — buckets aggregate several categories so we
    // don't want sortOffers to early-return on category sameness.
    return sortOffers(filtered, sortBy, "all");
  }, [offers, sortBy, query]);

  // For the "Invest & grow" bucket only, surface the asset-switcher + chart
  // that has historically lived on /investments. We pass the bucket's
  // investment-category offers as `offers` so the chart's provider matches
  // pick up the AI-enriched Supabase data.
  const investmentOffers = useMemo(
    () => offers.filter((o) => o.category === "investments"),
    [offers],
  );

  return (
    <div className="grid gap-6">
      {bucketSlug === "invest-and-grow" && investmentOffers.length > 0 && (
        <InvestmentIntelligenceBlock
          locale={locale}
          marketLabel={marketLabel}
          offers={investmentOffers}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search providers, products, offers…"
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-tertiary outline-none focus:border-accent-emerald sm:max-w-sm"
        />
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
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white px-8 py-12 text-center">
          <p className="text-[15px] text-ink-secondary">
            {query
              ? `No matches for "${query}" in ${countryName}.`
              : `No options currently available in ${countryName} for this category.`}
          </p>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-3 text-[14px] font-medium text-accent-emerald hover:underline"
            >
              Clear search
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
