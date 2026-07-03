"use client";

import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { DashboardCardsWorkspace } from "@/components/dashboard-cards-workspace";
import { DashboardCategoryWorkspace } from "@/components/dashboard-category-workspace";
import { DashboardInvestmentsWorkspace } from "@/components/dashboard-investments-workspace";
import { RateAlertButton } from "@/components/rate-alert-button";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { AnalyticsEvent, buildWebAnalyticsProperties } from "@/lib/analytics";
import {
  filterCategoryOffersForCountry,
  getCategoryOffersForCountrySelection,
  getCountrySelectorOptions,
} from "@/lib/countries";
import type { DashboardInsights, DashboardOfferInsight } from "@/lib/dashboard";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import type { MarketIntelligenceAssetId } from "@/lib/market-intelligence";

function mergeInsights(...buckets: DashboardOfferInsight[][]) {
  const seen = new Set<string>();
  const merged: DashboardOfferInsight[] = [];
  for (const bucket of buckets) {
    for (const item of bucket) {
      if (!seen.has(item.offer.id)) {
        seen.add(item.offer.id);
        merged.push(item);
      }
    }
  }
  return merged;
}

export function ProductCategoryView({
  category,
  allOffers,
}: {
  category: MarketplaceCategory;
  // Optional Supabase-sourced offer list passed down by the server page wrapper.
  // When present, it's used for category filtering — that's how AI-enriched
  // bullets reach guests. Falls back to the static catalog if absent.
  allOffers?: MarketplaceOffer[];
}) {
  const searchParams = useSearchParams();
  const { user, profile, loading } = useAuth();
  const preferences = useMarketplacePreferences();
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const productMarketScope = "eu_fallback";
  const discoverHref = localePath(preferences.locale, "/discover");
  const dashboardHref = localePath(preferences.locale, "/dashboard");
  const assetId = category === "investments" ? searchParams.get("asset") : null;

  const loadInsights = useCallback(async () => {
    if (!user) {
      setInsights(null);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch("/api/v1/dashboard", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (response.ok) {
        setInsights((await response.json()) as DashboardInsights);
      }
    } catch {
      // insights are optional
    } finally {
      clearTimeout(timeout);
    }
  }, [user]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  const countryOptions = useMemo(
    () => getCountrySelectorOptions({ includeGroups: false, locale: preferences.locale }),
    [preferences.locale],
  );

  const countryChip = (
    <div className="inline-flex items-center border border-line bg-white rounded-xl px-3 py-2 text-[13px] font-medium text-ink">
      <span className="mr-1.5">Showing results for</span>
      <select
        value={preferences.country}
        onChange={(e) => preferences.setCountry(e.target.value)}
        className="bg-transparent border-none outline-none cursor-pointer font-semibold text-ink"
        aria-label="Select country"
      >
        {countryOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.flag} {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const categoryOffers = allOffers
    ? filterCategoryOffersForCountry(allOffers, preferences.country, category, productMarketScope)
    : getCategoryOffersForCountrySelection(preferences.country, category, productMarketScope);
  const categoryInsights = insights
    ? mergeInsights(
        insights.recommended.filter((item) => item.offer.category === category),
        insights.bestValueToday.filter((item) => item.offer.category === category),
        insights.popularWithUsersLikeYou.filter((item) => item.offer.category === category),
        insights.trendingInMarket.filter((item) => item.offer.category === category),
      )
    : [];
  const pageView = (
    <AnalyticsPageView
      eventName={AnalyticsEvent.CategoryViewed}
      dedupeKey={`category:${category}:${assetId ?? "default"}`}
      properties={buildWebAnalyticsProperties({
        asset: assetId,
        category,
        country: preferences.country,
        language: preferences.locale,
        loggedIn: Boolean(user),
      })}
      ready={!loading}
    />
  );

  const alertButton = (
    <RateAlertButton
      category={category}
      country={preferences.country}
      countryLabel={preferences.countryLabel}
      locale={preferences.locale}
    />
  );

  const countryRow = (
    <div className="flex flex-wrap items-center gap-2">
      {countryChip}
      {alertButton}
    </div>
  );

  const dictionary = getDictionary(preferences.locale);
  const categoryTitle = dictionary.categories[category] ?? category;
  const categoryDescription = dictionary.categoryDescriptions[category] ?? "";

  const categoryHero = (
    // Compact on mobile — smaller title, less padding, and the description is
    // hidden (the title + country say enough) so the offers surface sooner.
    // Full editorial hero returns at sm+.
    <section className="rounded-[24px] bg-gradient-to-br from-[#0D1812] to-[#13181A] px-5 py-4 sm:rounded-[32px] sm:p-8">
      <p className="text-caption uppercase tracking-[0.28em] text-white/50">{preferences.countryLabel}</p>
      <h1 className="mt-2 max-w-3xl text-[1.6rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:mt-4 sm:text-h1">
        {categoryTitle}
      </h1>
      {categoryDescription ? (
        <p className="mt-3 hidden max-w-3xl text-[15px] leading-relaxed text-white/70 sm:mt-4 sm:block sm:text-base">
          {categoryDescription}
        </p>
      ) : null}
    </section>
  );

  if (category === "investments") {
    return (
      <div className="grid gap-5">
        {categoryHero}
        {countryRow}
        {pageView}
        <DashboardInvestmentsWorkspace
          key={`investments:${searchParams.get("asset") ?? "btc"}`}
          locale={preferences.locale}
          userId={user?.id ?? null}
          marketLabel={preferences.countryLabel}
          dashboardHref={user ? dashboardHref : undefined}
          discoverHref={discoverHref}
          initialAssetId={(searchParams.get("asset") as MarketIntelligenceAssetId | null) ?? undefined}
          offers={categoryOffers}
        />
      </div>
    );
  }

  if (category === "cards") {
    return (
      <div className="grid gap-5">
        {categoryHero}
        {countryRow}
        {pageView}
        <DashboardCardsWorkspace
          key="cards"
          locale={preferences.locale}
          userId={user?.id ?? null}
          marketLabel={preferences.countryLabel}
          offers={categoryOffers}
          discoverHref={discoverHref}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {categoryHero}
      {countryRow}
      {pageView}
      <DashboardCategoryWorkspace
        key={category}
        locale={preferences.locale}
        userId={user?.id ?? null}
        category={category}
        marketLabel={preferences.countryLabel}
        profile={profile ?? null}
        preferredCountry={preferences.country}
        onCountryChange={preferences.setCountry}
        offers={categoryOffers}
        insights={categoryInsights}
        discoverHref={discoverHref}
      />
    </div>
  );
}
