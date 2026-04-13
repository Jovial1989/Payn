"use client";

import type { MarketplaceCategory } from "@payn/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/button";
import { DashboardLoadingState, DashboardSectionCard } from "@/components/dashboard-primitives";
import { DashboardOverviewWorkspace } from "@/components/dashboard-overview-workspace";
import { DashboardProfileWorkspace } from "@/components/dashboard-profile-workspace";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { getProductEntryActionLabel } from "@/components/product-entry-action";
import { useAuth } from "@/hooks/use-auth";
import {
  getCategoryOffersForCountrySelection,
  getOffersForCountrySelection,
} from "@/lib/countries";
import type { DashboardInsights } from "@/lib/dashboard";
import { localePath } from "@/lib/locale";
import { getDashboardHref, type DashboardView } from "@/lib/dashboard-navigation";
import { getUiCopy } from "@/lib/ui-copy";

const dashboardCategories: MarketplaceCategory[] = [
  "loans",
  "cards",
  "transfers",
  "exchange",
  "insurance",
  "investments",
];

type SettingsSavePayload = {
  first_name: string | null;
  last_name: string | null;
  user_type: "personal" | "freelancer" | "business";
  selected_categories: string[];
  goals: string[];
  home_country: string | null;
  market_scope: "local_only" | "eu_fallback" | "all_europe";
};

type DashboardAppViewProps = {
  view?: Extract<DashboardView, "dashboard" | "settings">;
};

export function DashboardAppView({ view = "dashboard" }: DashboardAppViewProps) {
  const router = useRouter();
  const { user, profile, loading, updateProfile, signOut, requestPasswordReset } = useAuth();
  const preferences = useMarketplacePreferences();
  const uiCopy = getUiCopy(preferences.locale);
  const productEntryActionLabel = getProductEntryActionLabel(preferences.locale);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const productMarketScope = "eu_fallback";
  const discoverHref = localePath(preferences.locale, "/discover");
  const dashboardHref = useCallback(
    (view: DashboardView) => getDashboardHref(view, preferences.locale),
    [preferences.locale],
  );
  const handleSettingsSave = useCallback(
    async (data: SettingsSavePayload) => {
      await updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        user_type: data.user_type,
        selected_categories: data.selected_categories,
        goals: data.goals,
        home_country: data.home_country,
        market_scope: data.market_scope,
        onboarding_completed: true,
      });
      if (data.home_country) {
        preferences.setCountry(data.home_country);
      }
    },
    [preferences, updateProfile],
  );
  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace(discoverHref);
  }, [discoverHref, router, signOut]);
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
      // dashboard insights are optional
    } finally {
      clearTimeout(timeout);
    }
  }, [user]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  const allOffers = useMemo(
    () => getOffersForCountrySelection(preferences.country, productMarketScope),
    [preferences.country],
  );

  if (loading) {
    return <DashboardLoadingState label={uiCopy.dashboard.loadingWorkspace} />;
  }

  if (!user) {
    return (
      <div className="grid gap-6">
        <DashboardSectionCard
          eyebrow={uiCopy.dashboard.guestEyebrow}
          title={uiCopy.dashboard.guestTitle}
          description={
            preferences.locale === "de"
              ? "Das Dashboard ist jetzt das Kontrollzentrum für angemeldete Nutzer. Discover und alle Produktseiten bleiben für Gäste offen, während dein Konto Entscheidungspfad, Einstellungen und Empfehlungen speichert."
              : "Dashboard is now the signed-in control center. Discover and every product page stay open to guests, while your account keeps the decision trail, settings, and recommendations."
          }
        >
          <div className="flex flex-wrap gap-3">
            <Link
              href={localePath(preferences.locale, "/login")}
              className={buttonStyles({ variant: "primary", size: "lg" })}
            >
              {uiCopy.auth.signIn}
            </Link>
            <Link
              href={discoverHref}
              className={buttonStyles({ variant: "secondary", size: "lg" })}
            >
              {productEntryActionLabel}
            </Link>
          </div>
        </DashboardSectionCard>
      </div>
    );
  }

  const username = user.email ? user.email.split("@")[0] : "Payn";
  const savedOffers = insights?.savedOffers ?? [];
  const watchedOffers = insights?.watchedOffers ?? [];
  const categoryCounts = Object.fromEntries(
    dashboardCategories.map((category) => [
      category,
      getCategoryOffersForCountrySelection(
        preferences.country,
        category,
        productMarketScope,
      ).length,
    ]),
  ) as Record<MarketplaceCategory, number>;

  let body: React.ReactNode;

  if (view === "settings") {
    body = (
      <DashboardProfileWorkspace
        key="settings"
        locale={preferences.locale}
        userId={user.id}
        email={user.email ?? ""}
        profile={profile ?? null}
        onSignOut={handleSignOut}
        onSave={handleSettingsSave}
        onRequestPasswordReset={requestPasswordReset}
      />
    );
  } else {
    body = (
      <DashboardOverviewWorkspace
        key="dashboard"
        locale={preferences.locale}
        username={username}
        profile={profile ?? null}
        marketLabel={preferences.countryLabel}
        marketOffers={allOffers}
        savedOffers={savedOffers}
        watchedOffers={watchedOffers}
        categoryCounts={categoryCounts}
        settingsHref={dashboardHref("settings")}
        discoverHref={discoverHref}
        categoryHref={(category) => dashboardHref(category)}
        investmentsHref={dashboardHref("investments")}
      />
    );
  }

  return <div className="grid gap-5">{body}</div>;
}
