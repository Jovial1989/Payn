"use client";

import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/button";
import { DashboardInvestmentsWorkspace } from "@/components/dashboard-investments-workspace";
import { DashboardOfferTile } from "@/components/dashboard-offer-tile";
import {
  DashboardEmptyState,
  DashboardLoadingState,
  DashboardSectionCard,
} from "@/components/dashboard-primitives";
import { DashboardOverviewWorkspace } from "@/components/dashboard-overview-workspace";
import { ProviderLogo } from "@/components/provider-logo";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import type { DashboardInsights, DashboardOfferInsight } from "@/lib/dashboard";
import { resolveProfileMarket } from "@/lib/dashboard";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import {
  getActiveDashboardView,
  getDashboardHref,
  type DashboardView,
} from "@/lib/dashboard-navigation";
import { matchesOfferMarket } from "@/lib/marketplace";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { getGoalLabel, getUiCopy, getUserTypeOptions } from "@/lib/ui-copy";

const dashboardCategories: MarketplaceCategory[] = [
  "loans",
  "cards",
  "transfers",
  "exchange",
  "insurance",
  "investments",
];

// ─── Data helpers ───

function getMarketOffers(market: string) {
  return marketplaceOffers.filter((offer) =>
    matchesOfferMarket(offer, market as import("@payn/types").MarketplaceMarket),
  );
}

function getCategoryOffers(market: string, category: MarketplaceCategory) {
  return getMarketOffers(market).filter((offer) => offer.category === category);
}

function getUniqueProviders(offers: MarketplaceOffer[]) {
  const seen = new Set<string>();
  return offers.filter((offer) => {
    if (seen.has(offer.providerName)) return false;
    seen.add(offer.providerName);
    return true;
  }).map((offer) => offer.providerName);
}

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

function toOfferInsight(offer: MarketplaceOffer): DashboardOfferInsight {
  return {
    offer,
    activityScore: 0,
    saveCount: 0,
    providerClickCount: 0,
    offerViewCount: 0,
  };
}

function getCrossCategoryTopPicks(args: {
  market: string;
  insights: DashboardInsights | null;
}) {
  const scopedOffers = getMarketOffers(args.market);
  const fallbackByCategory = new Map<MarketplaceCategory, MarketplaceOffer>();

  for (const offer of scopedOffers) {
    if (!fallbackByCategory.has(offer.category)) {
      fallbackByCategory.set(offer.category, offer);
    }
  }

  const ranked =
    args.insights
      ? mergeInsights(
          args.insights.recommended,
          args.insights.bestValueToday,
          args.insights.popularWithUsersLikeYou,
          args.insights.trendingInMarket,
        )
      : scopedOffers.map(toOfferInsight);

  const picks: DashboardOfferInsight[] = [];
  const usedIds = new Set<string>();

  for (const category of dashboardCategories) {
    const candidate =
      ranked.find((item) => item.offer.category === category && !usedIds.has(item.offer.id)) ??
      (fallbackByCategory.get(category) ? toOfferInsight(fallbackByCategory.get(category)!) : null);

    if (!candidate || usedIds.has(candidate.offer.id)) {
      continue;
    }

    usedIds.add(candidate.offer.id);
    picks.push(candidate);
  }

  return picks;
}

// ─── Profile editor ───

const interestOptions = dashboardCategories;

const useCaseOptions = [
  "travel",
  "savings",
  "crypto",
  "international_transfers",
  "investing",
  "insurance",
  "everyday_banking",
] as const;

function ProfileEditor({
  email,
  userType,
  marketLabel,
  selectedCategories,
  goals,
  onSave,
}: {
  email: string;
  userType: string;
  marketLabel: string;
  selectedCategories: string[];
  goals: string[];
  onSave: (data: { user_type: string; selected_categories: string[]; goals: string[] }) => void;
}) {
  const [editType, setEditType] = useState(userType);
  const [editCategories, setEditCategories] = useState<string[]>(
    selectedCategories.length > 0 ? selectedCategories : [...dashboardCategories],
  );
  const [editGoals, setEditGoals] = useState<string[]>(goals);
  const [saving, setSaving] = useState(false);
  const { locale } = useMarketplacePreferences();
  const dictionary = getDictionary(locale);
  const uiCopy = getUiCopy(locale);
  const userTypes = getUserTypeOptions(locale);
  const { signOut } = useAuth();
  const router = useRouter();
  const username = email.split("@")[0];
  const initials = username.slice(0, 2).toUpperCase();

  const toggleCategory = (cat: string) => {
    setEditCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const toggleGoal = (goal: string) => {
    setEditGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    onSave({
      user_type: editType,
      selected_categories: editCategories,
      goals: editGoals,
    });
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
  };

  return (
    <div className="grid gap-5">
      <DashboardSectionCard eyebrow={uiCopy.dashboard.accountEyebrow} title={uiCopy.dashboard.accountTitle}>
        <div className="grid gap-4">
          <div className="flex flex-col gap-4 rounded-[24px] bg-bg-surface px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-ink">{username}</p>
                <p className="mt-1 truncate text-sm text-ink-secondary">{email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={localePath(locale, "/")} className={buttonStyles({ variant: "ghost", size: "sm" })}>
                {uiCopy.common.backToSite}
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.replace(localePath(locale, "/"));
                  router.refresh();
                }}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                {uiCopy.common.signOut}
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] bg-bg-surface px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                {uiCopy.dashboard.emailLabel}
              </p>
              <p className="mt-2 text-sm font-bold text-ink">{email}</p>
            </div>
            <div className="rounded-[24px] bg-bg-surface px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                {uiCopy.dashboard.marketLabel}
              </p>
              <p className="mt-2 text-sm font-bold text-ink">{marketLabel}</p>
            </div>
          </div>
        </div>
      </DashboardSectionCard>

      <DashboardSectionCard eyebrow={uiCopy.dashboard.profileTypeEyebrow} title={uiCopy.dashboard.profileTypeTitle}>
        <div className="grid gap-2 sm:grid-cols-3">
          {userTypes.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setEditType(option.id)}
              className={`rounded-[20px] border px-4 py-4 text-left transition-all ${
                editType === option.id
                  ? "border-black bg-black/[0.03]"
                  : "border-line hover:border-line-strong"
              }`}
            >
              <p className="text-sm font-bold text-ink">{option.label}</p>
            </button>
          ))}
        </div>
      </DashboardSectionCard>

      <DashboardSectionCard eyebrow={uiCopy.dashboard.interestsEyebrow} title={uiCopy.dashboard.interestsTitle}>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                editCategories.includes(cat)
                  ? "border-black bg-black text-white"
                  : "border-line text-ink-secondary hover:border-line-strong"
              }`}
            >
              {dictionary.categories[cat]}
            </button>
          ))}
        </div>
      </DashboardSectionCard>

      <DashboardSectionCard eyebrow={uiCopy.dashboard.useCasesEyebrow} title={uiCopy.dashboard.useCasesTitle}>
        <div className="flex flex-wrap gap-2">
          {useCaseOptions.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                editGoals.includes(goal)
                  ? "border-black bg-black text-white"
                  : "border-line text-ink-secondary hover:border-line-strong"
              }`}
            >
              {getGoalLabel(locale, goal)}
            </button>
          ))}
        </div>
      </DashboardSectionCard>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-11 rounded-full bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? uiCopy.dashboard.savingPreferences : uiCopy.dashboard.savePreferences}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ───

export default function DashboardPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeView = useMemo(
    () => getActiveDashboardView(pathname, searchParams.get("view")),
    [pathname, searchParams],
  );

  const { user, profile, loading, updateProfile } = useAuth();
  const preferences = useMarketplacePreferences();
  const dictionary = getDictionary(preferences.locale);
  const uiCopy = getUiCopy(preferences.locale);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);

  const dashboardMarket = profile ? resolveProfileMarket(profile.home_country) : preferences.market;
  const marketLabel = dictionary.markets[dashboardMarket];
  const exploreHref = localePath(preferences.locale, "/explore");
  const userTypeLabels = useMemo(
    () => Object.fromEntries(getUserTypeOptions(preferences.locale).map((option) => [option.id, option.label])),
    [preferences.locale],
  );
  const dashboardHref = useCallback(
    (view: DashboardView) => getDashboardHref(view, preferences.locale),
    [preferences.locale],
  );

  const loadInsights = useCallback(async () => {
    if (!user) return;
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
      // Insights are optional
    } finally {
      clearTimeout(timeout);
    }
  }, [user]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  const userLabel = useMemo(() => {
    if (!profile?.user_type) return null;
    return userTypeLabels[profile.user_type] ?? profile.user_type;
  }, [profile, userTypeLabels]);

  const allOffers = useMemo(() => getMarketOffers(dashboardMarket), [dashboardMarket]);

  const activeCategory =
    activeView !== "investments" && dashboardCategories.includes(activeView as MarketplaceCategory)
    ? (activeView as MarketplaceCategory)
    : null;

  // --- Auth loading ---
  if (loading) {
    return <DashboardLoadingState label={uiCopy.dashboard.loadingWorkspace} />;
  }

  // --- Not signed in ---
  if (!user) {
    return (
      <div className="grid gap-6">
        <DashboardSectionCard
          eyebrow={uiCopy.dashboard.guestEyebrow}
          title={uiCopy.dashboard.guestTitle}
          description={uiCopy.dashboard.guestDescription}
        >
          <div className="flex flex-wrap gap-3">
            <Link href={localePath(preferences.locale, "/login")} className={buttonStyles({ variant: "primary", size: "lg" })}>
              {uiCopy.auth.signIn}
            </Link>
            <Link href={localePath(preferences.locale, "/signup")} className={buttonStyles({ variant: "secondary", size: "lg" })}>
              {dictionary.nav.compareOptions}
            </Link>
          </div>
        </DashboardSectionCard>
      </div>
    );
  }

  const username = user.email ? user.email.split("@")[0] : "Payn";
  const savedOffers = insights?.savedOffers ?? [];
  const watchedOffers = insights?.watchedOffers ?? [];
  const providerCount = getUniqueProviders(allOffers).length;
  const compareReadyCount = Math.min(insights?.loyalty.savedCount ?? 0, 3);
  const topPicks = getCrossCategoryTopPicks({
    market: dashboardMarket,
    insights,
  });
  const categoryCounts = Object.fromEntries(
    dashboardCategories.map((category) => [category, getCategoryOffers(dashboardMarket, category).length]),
  ) as Record<MarketplaceCategory, number>;
  const investmentInsights = insights
    ? mergeInsights(
        insights.recommended.filter((item) => item.offer.category === "investments"),
        insights.bestValueToday.filter((item) => item.offer.category === "investments"),
        insights.popularWithUsersLikeYou.filter((item) => item.offer.category === "investments"),
        insights.trendingInMarket.filter((item) => item.offer.category === "investments"),
      )
    : [];
  const investmentWorkspaceOffers =
    investmentInsights.length > 0
      ? investmentInsights.slice(0, 6)
      : getCategoryOffers(dashboardMarket, "investments").slice(0, 6).map(toOfferInsight);

  // --- Previous summary card has moved into the overview-only workspace ---

  // ─── Category view ───

  const renderCategoryView = (category: MarketplaceCategory) => {
    const offers = getCategoryOffers(dashboardMarket, category);
    const providers = getUniqueProviders(offers);

    const insightOffers = insights
      ? mergeInsights(
          insights.recommended.filter((i) => i.offer.category === category),
          insights.bestValueToday.filter((i) => i.offer.category === category),
          insights.trendingInMarket.filter((i) => i.offer.category === category),
        )
      : [];

    const displayOffers =
      insightOffers.length > 0
        ? insightOffers
        : offers.slice(0, 6).map(toOfferInsight);

    return (
      <div className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] bg-bg-surface px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">{uiCopy.dashboard.stats.available}</p>
            <p className="mt-1 text-2xl font-bold text-ink">{offers.length}</p>
          </div>
          <div className="rounded-[22px] bg-bg-surface px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">{uiCopy.dashboard.stats.providers}</p>
            <p className="mt-1 text-2xl font-bold text-ink">{providers.length}</p>
          </div>
          <div className="rounded-[22px] bg-bg-surface px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">{uiCopy.dashboard.stats.saved}</p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {insights?.savedOffers.filter((o) => o.category === category).length ?? 0}
            </p>
          </div>
        </div>

        <DashboardSectionCard
          eyebrow={uiCopy.dashboard.categoriesEyebrow}
          title={dictionary.categories[category]}
          action={
            <Link href={exploreHref} className={buttonStyles({ variant: "secondary", size: "sm" })}>
              {uiCopy.dashboard.openExplore}
            </Link>
          }
        >
          {displayOffers.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {displayOffers.map((item) => (
                <DashboardOfferTile key={item.offer.id} offer={item.offer} insight={item} />
              ))}
            </div>
          ) : (
            <DashboardEmptyState
              title={uiCopy.dashboard.noCategoryTitle}
              description={uiCopy.dashboard.noCategoryDescription}
              href={exploreHref}
              cta={uiCopy.dashboard.openExplore}
            />
          )}
        </DashboardSectionCard>

        <DashboardSectionCard eyebrow={uiCopy.dashboard.providersEyebrow} title={uiCopy.dashboard.providersTitle}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {providers.slice(0, 9).map((name) => (
              <div key={name} className="flex items-center gap-3 rounded-[18px] bg-bg-surface px-4 py-3">
                <ProviderLogo providerName={name} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-ink">{name}</p>
                  <p className="mt-0.5 text-xs text-ink-tertiary">
                    {offers.filter((o) => o.providerName === name).length} {uiCopy.common.products}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DashboardSectionCard>
      </div>
    );
  };

  // ─── Profile view ───

  const renderProfileView = () => (
    <ProfileEditor
      email={user.email ?? ""}
      userType={profile?.user_type ?? "personal"}
      marketLabel={marketLabel}
      selectedCategories={profile?.selected_categories ?? []}
      goals={profile?.goals ?? []}
      onSave={(data) => {
        updateProfile({
          user_type: data.user_type as "personal" | "freelancer" | "business",
          selected_categories: data.selected_categories,
          goals: data.goals,
          onboarding_completed: true,
        });
      }}
    />
  );

  // ─── View routing ───

  let body: React.ReactNode;

  if (activeView === "investments") {
    body = (
      <DashboardInvestmentsWorkspace
        locale={preferences.locale}
        marketLabel={marketLabel}
        userLabel={userLabel}
        dashboardHref={dashboardHref("dashboard")}
        exploreHref={exploreHref}
        offers={investmentWorkspaceOffers}
      />
    );
  } else if (activeCategory) {
    body = renderCategoryView(activeCategory);
  } else if (activeView === "profile") {
    body = renderProfileView();
  } else {
    body = (
      <DashboardOverviewWorkspace
        locale={preferences.locale}
        username={username}
        userLabel={userLabel}
        marketLabel={marketLabel}
        allOfferCount={allOffers.length}
        providerCount={providerCount}
        savedCount={insights?.loyalty.savedCount ?? 0}
        compareReadyCount={compareReadyCount}
        topPicks={topPicks}
        savedOffers={savedOffers}
        watchedOffers={watchedOffers}
        categoryCounts={categoryCounts}
        profileHref={dashboardHref("profile")}
        exploreHref={exploreHref}
        investmentsHref={dashboardHref("investments")}
        categoryHref={(category) => dashboardHref(category)}
      />
    );
  }

  return <div className="grid gap-5">{body}</div>;
}
