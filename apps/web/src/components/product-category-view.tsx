"use client";

import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { DashboardCardsWorkspace } from "@/components/dashboard-cards-workspace";
import { DashboardCategoryWorkspace } from "@/components/dashboard-category-workspace";
import { DashboardInvestmentsWorkspace } from "@/components/dashboard-investments-workspace";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { AnalyticsEvent, buildWebAnalyticsProperties } from "@/lib/analytics";
import {
  filterCategoryOffersForCountry,
  getCategoryOffersForCountrySelection,
} from "@/lib/countries";
import type { DashboardInsights, DashboardOfferInsight } from "@/lib/dashboard";
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

  if (category === "investments") {
    return (
      <div className="grid gap-5">
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
