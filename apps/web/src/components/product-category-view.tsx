"use client";

import type { MarketplaceCategory } from "@payn/types";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardCardsWorkspace } from "@/components/dashboard-cards-workspace";
import { DashboardCategoryWorkspace } from "@/components/dashboard-category-workspace";
import { DashboardInvestmentsWorkspace } from "@/components/dashboard-investments-workspace";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import {
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

export function ProductCategoryView({ category }: { category: MarketplaceCategory }) {
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const preferences = useMarketplacePreferences();
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const productMarketScope = "eu_fallback";
  const discoverHref = localePath(preferences.locale, "/discover");
  const dashboardHref = localePath(preferences.locale, "/dashboard");

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

  const categoryOffers = getCategoryOffersForCountrySelection(
    preferences.country,
    category,
    productMarketScope,
  );
  const categoryInsights = insights
    ? mergeInsights(
        insights.recommended.filter((item) => item.offer.category === category),
        insights.bestValueToday.filter((item) => item.offer.category === category),
        insights.popularWithUsersLikeYou.filter((item) => item.offer.category === category),
        insights.trendingInMarket.filter((item) => item.offer.category === category),
      )
    : [];

  if (category === "investments") {
    return (
      <div className="grid gap-5">
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
