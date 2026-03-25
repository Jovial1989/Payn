"use client";

import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";
import { useCallback, useState } from "react";
import { FilterPanel } from "@/components/filter-panel";
import { OfferCard } from "@/components/offer-card";
import { Tag } from "@/components/tag";

function roundCount(n: number): string {
  if (n <= 5) return `${n}`;
  if (n < 15) return `${Math.floor(n / 5) * 5}+`;
  return `${Math.floor(n / 10) * 10}+`;
}

export function CategoryPageContent({
  category,
  offers,
  label,
}: {
  category: MarketplaceCategory;
  offers: MarketplaceOffer[];
  label: string;
}) {
  const [filtered, setFiltered] = useState(offers);
  const markets = new Set(filtered.flatMap((o) => o.countryCodes));
  const hasActiveFilter = filtered.length !== offers.length;

  const handleFilter = useCallback((next: MarketplaceOffer[]) => {
    setFiltered(next);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <FilterPanel category={category} offers={offers} onFilter={handleFilter} />

      <section className="grid gap-4">
        <div className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-ink">
              {hasActiveFilter
                ? `${filtered.length} matching ${label}`
                : `Ranked ${label}`}
            </p>
            <p className="mt-0.5 text-xs text-ink-secondary">
              {hasActiveFilter
                ? `Filtered from ${roundCount(offers.length)} total offers`
                : "Compare products with transparent terms before visiting a provider."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag tone="success">{roundCount(filtered.length)} offers</Tag>
            <Tag tone="muted">{markets.size} markets</Tag>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="rounded-3xl border border-line bg-white p-10 text-center shadow-card">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bg-surface">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-tertiary" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-bold text-ink">No offers match your filters</p>
            <p className="mt-2 text-sm text-ink-secondary">Try adjusting your criteria or reset filters to see all offers.</p>
          </div>
        )}

        {filtered.map((offer, index) => (
          <OfferCard key={offer.id} offer={offer} rank={index + 1} />
        ))}
      </section>
    </div>
  );
}
