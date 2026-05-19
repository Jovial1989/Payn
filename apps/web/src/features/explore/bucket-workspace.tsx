"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";
import type { MarketplaceCategory, MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import { OfferRowAtlas } from "@/features/marketplace/offer-row-atlas";
import { sortOffers, type SortKey } from "@/lib/marketplace-engine";
import { getDictionary } from "@/lib/i18n";
import { countryToBaseCurrency } from "@/lib/country-currency";
import { InvestmentIntelligenceBlock } from "@/components/investment-intelligence-block";
import { FilterSheet } from "@/components/filter-sheet";
import { CategoryPill } from "@/components/category-pill";
import {
  inferInsuranceSubtype,
  INSURANCE_SUBTYPE_LABELS,
  INSURANCE_SUBTYPE_ORDER,
  type InsuranceSubtype,
} from "./insurance-subtypes";
import {
  inferTransferSpeed,
  TRANSFER_SPEED_LABELS,
  TRANSFER_SPEED_ORDER,
  type TransferSpeed,
} from "./transfer-speed";

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
  /** ISO country code (e.g. "FR") — used to flag offers priced in a
   *  non-base currency. Optional for backwards compatibility. */
  country?: string;
  countryName: string;
  marketLabel: string;
}

export function BucketWorkspace({
  bucketSlug,
  bucketCategories,
  offers,
  locale,
  country,
  countryName,
  marketLabel,
}: BucketWorkspaceProps) {
  const baseCurrency = countryToBaseCurrency(country);
  const dictionary = getDictionary(locale);
  const [sortBy, setSortBy] = useState<SortKey>("relevance");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory | "all">("all");
  const [activeProvider, setActiveProvider] = useState<string>("");
  // Insurance subtype filter — only meaningful when the bucket contains
  // insurance offers and there are enough of them to need slicing (single-
  // digit catalogues read fine without an extra filter).
  const [activeInsuranceSubtype, setActiveInsuranceSubtype] = useState<
    InsuranceSubtype | ""
  >("");
  // Transfer speed filter — same gate logic, applies to money-movement
  // categories (transfers / exchange / remittance).
  const [activeTransferSpeed, setActiveTransferSpeed] = useState<
    TransferSpeed | ""
  >("");

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

  // Subtype counts and visibility — computed against the bucket's full
  // insurance slice so a chosen Type still shows the others' offer counts
  // (handy for "what else is in here?" decisions before resetting).
  const insuranceOffers = useMemo(
    () => offers.filter((o) => o.category === "insurance"),
    [offers],
  );
  const showInsuranceSubtype =
    bucketCategories.includes("insurance") &&
    insuranceOffers.length >= 6 &&
    (activeCategory === "all" || activeCategory === "insurance");

  const insuranceSubtypeCounts = useMemo(() => {
    const counts: Record<InsuranceSubtype, number> = {
      health: 0, travel: 0, life: 0, auto: 0, device: 0, home: 0, other: 0,
    };
    for (const o of insuranceOffers) counts[inferInsuranceSubtype(o)]++;
    return counts;
  }, [insuranceOffers]);

  // Same shape for transfers.
  const transferOffers = useMemo(
    () =>
      offers.filter(
        (o) =>
          o.category === "transfers" ||
          o.category === "exchange" ||
          o.category === "remittance",
      ),
    [offers],
  );
  const showTransferSpeed =
    transferOffers.length >= 8 &&
    (activeCategory === "all" ||
      activeCategory === "transfers" ||
      activeCategory === "exchange" ||
      activeCategory === "remittance");
  const transferSpeedCounts = useMemo(() => {
    const counts: Record<TransferSpeed, number> = {
      instant: 0, fast: 0, "multi-day": 0, unknown: 0,
    };
    for (const o of transferOffers) counts[inferTransferSpeed(o)]++;
    return counts;
  }, [transferOffers]);

  const filteredAndSorted = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    let filtered = offers;
    if (activeCategory !== "all") {
      filtered = filtered.filter((o) => o.category === activeCategory);
    }
    if (activeProvider) {
      filtered = filtered.filter((o) => o.providerName === activeProvider);
    }
    if (activeInsuranceSubtype) {
      // Apply subtype only to insurance rows; non-insurance rows in mixed
      // buckets (kids, budgeting under "protect") pass through unchanged.
      filtered = filtered.filter(
        (o) =>
          o.category !== "insurance" ||
          inferInsuranceSubtype(o) === activeInsuranceSubtype,
      );
    }
    if (activeTransferSpeed) {
      filtered = filtered.filter((o) => {
        if (
          o.category !== "transfers" &&
          o.category !== "exchange" &&
          o.category !== "remittance"
        ) {
          return true;
        }
        return inferTransferSpeed(o) === activeTransferSpeed;
      });
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
  }, [
    offers,
    sortBy,
    query,
    activeCategory,
    activeProvider,
    activeInsuranceSubtype,
    activeTransferSpeed,
  ]);

  const investmentOffers = useMemo(
    () => offers.filter((o) => o.category === "investments"),
    [offers],
  );

  const hasAnyFilter =
    activeCategory !== "all" ||
    activeProvider !== "" ||
    activeInsuranceSubtype !== "" ||
    activeTransferSpeed !== "" ||
    query !== "";

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
            groupId={`bucket-${bucketSlug}`}
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
              groupId={`bucket-${bucketSlug}`}
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

        {/* Filter row — native <select>s replaced with FilterSheet pill
            buttons that open a BottomSheet. Premium-product feel, same
            interaction on mobile and desktop, no browser-default dropdown
            styling leaking through. */}
        <div className="flex flex-wrap items-center gap-3">
          {showInsuranceSubtype && (
            <FilterSheet
              label="Insurance type"
              value={activeInsuranceSubtype}
              onChange={(v) => setActiveInsuranceSubtype(v as InsuranceSubtype | "")}
              options={[
                {
                  value: "",
                  label: "All types",
                  hint: `${insuranceOffers.length} options`,
                },
                ...INSURANCE_SUBTYPE_ORDER.filter(
                  (k) => insuranceSubtypeCounts[k] > 0,
                ).map((k) => ({
                  value: k,
                  label: INSURANCE_SUBTYPE_LABELS[k],
                  hint: `${insuranceSubtypeCounts[k]} ${insuranceSubtypeCounts[k] === 1 ? "offer" : "offers"}`,
                })),
              ]}
            />
          )}

          {showTransferSpeed && (
            <FilterSheet
              label="Speed"
              value={activeTransferSpeed}
              onChange={(v) => setActiveTransferSpeed(v as TransferSpeed | "")}
              options={[
                {
                  value: "",
                  label: "Any speed",
                  hint: `${transferOffers.length} options`,
                },
                ...TRANSFER_SPEED_ORDER.filter(
                  (k) => transferSpeedCounts[k] > 0,
                ).map((k) => ({
                  value: k,
                  label: TRANSFER_SPEED_LABELS[k],
                  hint: `${transferSpeedCounts[k]} ${transferSpeedCounts[k] === 1 ? "offer" : "offers"}`,
                })),
              ]}
            />
          )}

          {providerOptions.length > 1 && (
            <FilterSheet
              label="Provider"
              value={activeProvider}
              onChange={setActiveProvider}
              options={[
                { value: "", label: "All providers", hint: `${providerOptions.length} options` },
                ...providerOptions.map((p) => ({ value: p, label: p })),
              ]}
            />
          )}

          <FilterSheet
            label="Sort"
            value={sortBy}
            onChange={(v) => setSortBy(v as SortKey)}
            options={SORT_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
          />

          {hasAnyFilter && (
            <button
              type="button"
              onClick={() => {
                setActiveCategory("all");
                setActiveProvider("");
                setActiveInsuranceSubtype("");
                setActiveTransferSpeed("");
                setQuery("");
              }}
              className="inline-flex h-10 items-center rounded-full bg-bg-surface px-4 text-[12px] font-semibold text-ink-secondary transition-colors hover:bg-bg-overlay hover:text-ink"
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
                setActiveInsuranceSubtype("");
                setActiveTransferSpeed("");
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
            <OfferRowAtlas
              key={offer.id}
              offer={offer}
              locale={locale}
              // Full bucket market — `offers`, not `filteredAndSorted` —
              // so the score and award compare against every offer in the
              // category market, not just what survived the current filters.
              marketContext={offers}
              baseCurrency={baseCurrency ?? undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// CategoryPill moved to a shared component at @/components/category-pill —
// see the import at the top of this file. The local stub used to live
// here; consolidating means future polish lands once across BucketWorkspace,
// DashboardCardsWorkspace and DashboardCategoryWorkspace.
