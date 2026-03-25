"use client";

import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";
import { useCallback, useState } from "react";
import { FilterPanel } from "@/components/filter-panel";
import { OfferCard } from "@/components/offer-card";
import { Tag } from "@/components/tag";

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

  const handleFilter = useCallback((next: MarketplaceOffer[]) => {
    setFiltered(next);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <FilterPanel category={category} offers={offers} onFilter={handleFilter} />

      <section className="grid gap-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-bg-elevated p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Ranked {label}</p>
            <p className="mt-0.5 text-xs text-ink-secondary">
              Compare products with transparent terms before visiting a provider.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag tone="success">{filtered.length} offers</Tag>
            <Tag tone="muted">{markets.size} markets</Tag>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-line bg-bg-elevated p-8 text-center">
            <p className="text-sm font-medium text-ink">No offers match your filters</p>
            <p className="mt-1 text-xs text-ink-secondary">Try adjusting your criteria above.</p>
          </div>
        )}

        {filtered.map((offer, index) => (
          <OfferCard key={offer.id} offer={offer} rank={index + 1} />
        ))}
      </section>
    </div>
  );
}
