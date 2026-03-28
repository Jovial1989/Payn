"use client";

import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/button";
import { DashboardOfferTile } from "@/components/dashboard-offer-tile";
import { ProviderLogo } from "@/components/provider-logo";
import { Tag } from "@/components/tag";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import type { DashboardInsights, DashboardOfferInsight } from "@/lib/dashboard";
import { resolveProfileMarket } from "@/lib/dashboard";
import { localePath } from "@/lib/locale";
import {
  getDashboardHref,
  normalizeDashboardView,
  type DashboardView,
} from "@/lib/dashboard-navigation";
import { MarketplaceExplorer } from "@/components/marketplace-explorer";
import { marketDefinitions, matchesOfferMarket, normalizeDisplayText } from "@/lib/marketplace";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

const categoryLabels: Record<MarketplaceCategory, string> = {
  loans: "Loans",
  cards: "Cards",
  transfers: "Transfers",
  exchange: "Exchange",
  insurance: "Insurance",
  investments: "Investments",
};

const dashboardCategories = Object.keys(categoryLabels) as MarketplaceCategory[];

// ─── Shared UI ───

function EmptyState({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-line-strong bg-white p-5">
      <p className="text-base font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{description}</p>
      <Link href={href} className={buttonStyles({ variant: "secondary", size: "md" }) + " mt-4"}>
        {cta}
      </Link>
    </div>
  );
}

function LoadingState({ label = "Loading dashboard" }: { label?: string }) {
  return (
    <div className="rounded-[28px] border border-line bg-white p-10 shadow-subtle">
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-tertiary border-t-black" />
        <p className="text-sm text-ink-secondary">{label}</p>
      </div>
    </div>
  );
}

function SectionCard({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-line bg-white p-5 shadow-subtle sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">{eyebrow}</p>
          <h2 className="mt-3 text-h3 text-ink">{title}</h2>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

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

// ─── Profile editor ───

const userTypes = [
  { id: "personal", label: "Personal" },
  { id: "freelancer", label: "Freelancer" },
  { id: "business", label: "Business" },
] as const;

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
  const { signOut } = useAuth();

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
      <SectionCard eyebrow="Account" title="Your account">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Email</p>
            <p className="mt-2 text-sm font-bold text-ink">{email}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Market</p>
            <p className="mt-2 text-sm font-bold text-ink">{marketLabel}</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={async () => {
              await signOut();
              window.location.href = localePath(locale, "/");
            }}
            className={buttonStyles({ variant: "ghost", size: "md" })}
          >
            Sign out
          </button>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Profile type" title="How you use Payn">
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
      </SectionCard>

      <SectionCard eyebrow="Interests" title="Categories you care about">
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
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard eyebrow="Use cases" title="What you use financial products for">
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
              {normalizeDisplayText(goal.replace(/_/g, " "))}
            </button>
          ))}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-11 rounded-full bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save preferences"}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ───

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const activeView = useMemo(
    () => normalizeDashboardView(searchParams.get("view")),
    [searchParams],
  );

  const { user, profile, loading, updateProfile } = useAuth();
  const preferences = useMarketplacePreferences();
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const dashboardMarket = profile ? resolveProfileMarket(profile.home_country) : preferences.market;
  const marketLabel = marketDefinitions[dashboardMarket].label;

  const loadInsights = useCallback(async () => {
    if (!user) return;
    setInsightsLoading(true);
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
      setInsightsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  const userLabel = useMemo(() => {
    if (!profile?.user_type) return null;
    return profile.user_type === "personal"
      ? "Personal"
      : profile.user_type === "freelancer"
        ? "Freelancer"
        : "Business";
  }, [profile]);

  const allOffers = useMemo(() => getMarketOffers(dashboardMarket), [dashboardMarket]);

  const activeCategory = dashboardCategories.includes(activeView as MarketplaceCategory)
    ? (activeView as MarketplaceCategory)
    : null;

  // --- Auth loading ---
  if (loading) {
    return <LoadingState label="Loading your workspace" />;
  }

  // --- Not signed in ---
  if (!user) {
    return (
      <div className="grid gap-6">
        <SectionCard
          eyebrow="Dashboard"
          title="Sign in to access your Payn workspace"
          description="Compare loans, cards, transfers, exchange, insurance, and investments in one place."
        >
          <div className="flex flex-wrap gap-3">
            <Link href={localePath(preferences.locale, "/login")} className={buttonStyles({ variant: "primary", size: "lg" })}>
              Sign in
            </Link>
            <Link href={localePath(preferences.locale, "/signup")} className={buttonStyles({ variant: "secondary", size: "lg" })}>
              Get started
            </Link>
          </div>
        </SectionCard>
      </div>
    );
  }

  // ─── Summary bar (always visible) ───

  const preferencesLine = [
    marketLabel,
    userLabel,
    ...(profile?.selected_categories ?? []).slice(0, 3).map((c) => normalizeDisplayText(c)),
  ]
    .filter(Boolean)
    .join(" · ");

  const renderSummary = () => (
    <section className="rounded-[28px] border border-line bg-white p-5 shadow-subtle sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Summary</p>
          <h1 className="mt-2 text-h3 text-ink">
            Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-sm text-ink-secondary">{preferencesLine}</p>
            <Link
              href={getDashboardHref("profile")}
              className="text-xs font-semibold text-ink-tertiary transition-colors hover:text-ink"
            >
              Edit
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={getDashboardHref("explore")} className={buttonStyles({ variant: "primary", size: "sm" })}>
            Explore offers
          </Link>
          <Link href={getDashboardHref("profile")} className={buttonStyles({ variant: "ghost", size: "sm" })}>
            Profile
          </Link>
        </div>
      </div>
    </section>
  );

  // ─── Dashboard overview ───

  const renderOverview = () => {
    const recommended = insights
      ? insights.recommended.slice(0, 6)
      : allOffers.slice(0, 6).map((offer) => ({
          offer,
          activityScore: 0,
          saveCount: 0,
          providerClickCount: 0,
          offerViewCount: 0,
        }));

    const savedOffers = insights?.savedOffers ?? [];
    const trendingOffers = insights?.trendingInMarket ?? [];

    return (
      <div className="grid gap-5">
        {/* Stats row */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-[22px] bg-bg-surface px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Payn score</p>
            <p className="mt-1 text-2xl font-bold text-ink">{insights?.loyalty.score ?? 0}</p>
          </div>
          <div className="rounded-[22px] bg-bg-surface px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Products</p>
            <p className="mt-1 text-2xl font-bold text-ink">{allOffers.length}</p>
          </div>
          <div className="rounded-[22px] bg-bg-surface px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Saved</p>
            <p className="mt-1 text-2xl font-bold text-ink">{savedOffers.length}</p>
          </div>
          <div className="rounded-[22px] bg-bg-surface px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Providers</p>
            <p className="mt-1 text-2xl font-bold text-ink">{getUniqueProviders(allOffers).length}</p>
          </div>
        </div>

        {/* Categories grid */}
        <SectionCard eyebrow="Categories" title="Browse by category">
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {dashboardCategories.map((cat) => {
              const count = getCategoryOffers(dashboardMarket, cat).length;
              return (
                <Link
                  key={cat}
                  href={getDashboardHref(cat)}
                  className="rounded-[20px] bg-bg-surface px-4 py-4 text-center transition-colors hover:bg-bg-overlay"
                >
                  <p className="text-xl font-bold text-ink">{count}</p>
                  <p className="mt-1 text-xs font-semibold text-ink-tertiary">{categoryLabels[cat]}</p>
                </Link>
              );
            })}
          </div>
        </SectionCard>

        {/* Recommended */}
        <SectionCard
          eyebrow="Recommended"
          title="Top products in your market"
          action={
            <Link href={getDashboardHref("explore")} className={buttonStyles({ variant: "secondary", size: "sm" })}>
              See all
            </Link>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recommended.map((item) => (
              <DashboardOfferTile key={item.offer.id} offer={item.offer} insight={item} />
            ))}
          </div>
        </SectionCard>

        {/* Saved preview + Trending side by side */}
        <div className="grid gap-5 xl:grid-cols-2">
          <SectionCard
            eyebrow="Saved"
            title="Your shortlist"
            action={
              savedOffers.length > 0 ? (
                <Link href={getDashboardHref("explore")} className={buttonStyles({ variant: "ghost", size: "sm" })}>
                  Browse more
                </Link>
              ) : null
            }
          >
            {savedOffers.length > 0 ? (
              <div className="grid gap-3">
                {savedOffers.slice(0, 3).map((offer) => (
                  <DashboardOfferTile key={offer.id} offer={offer} eyebrow="Saved" />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No saved offers yet"
                description="Save products from Explore to build your shortlist."
                href={getDashboardHref("explore")}
                cta="Explore offers"
              />
            )}
          </SectionCard>

          <SectionCard eyebrow="Trending" title="Gaining attention">
            {trendingOffers.length > 0 ? (
              <div className="grid gap-3">
                {trendingOffers.slice(0, 3).map((item) => (
                  <Link
                    key={item.offer.id}
                    href={localePath(preferences.locale, `/offers/${item.offer.slug}`)}
                    className="flex items-center justify-between rounded-[20px] bg-bg-surface px-4 py-3 transition-colors hover:bg-bg-overlay"
                  >
                    <div className="flex items-center gap-3">
                      <ProviderLogo providerName={item.offer.providerName} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-ink">{item.offer.title}</p>
                        <p className="mt-0.5 text-xs text-ink-tertiary">{item.offer.providerName}</p>
                      </div>
                    </div>
                    <Tag tone="blue">{item.activityScore.toFixed(1)}</Tag>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid gap-3">
                {allOffers.slice(0, 3).map((offer) => (
                  <Link
                    key={offer.id}
                    href={localePath(preferences.locale, `/offers/${offer.slug}`)}
                    className="flex items-center justify-between rounded-[20px] bg-bg-surface px-4 py-3 transition-colors hover:bg-bg-overlay"
                  >
                    <div className="flex items-center gap-3">
                      <ProviderLogo providerName={offer.providerName} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-ink">{offer.title}</p>
                        <p className="mt-0.5 text-xs text-ink-tertiary">{offer.providerName}</p>
                      </div>
                    </div>
                    <Tag tone="muted">{categoryLabels[offer.category]}</Tag>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    );
  };

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

    const displayOffers = insightOffers.length > 0
      ? insightOffers
      : offers.slice(0, 6).map((offer) => ({
          offer,
          activityScore: 0,
          saveCount: 0,
          providerClickCount: 0,
          offerViewCount: 0,
        }));

    return (
      <div className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] bg-bg-surface px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Available</p>
            <p className="mt-1 text-2xl font-bold text-ink">{offers.length}</p>
          </div>
          <div className="rounded-[22px] bg-bg-surface px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Providers</p>
            <p className="mt-1 text-2xl font-bold text-ink">{providers.length}</p>
          </div>
          <div className="rounded-[22px] bg-bg-surface px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Saved</p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {insights?.savedOffers.filter((o) => o.category === category).length ?? 0}
            </p>
          </div>
        </div>

        <SectionCard
          eyebrow="Recommended"
          title={`Best ${categoryLabels[category].toLowerCase()} for your profile`}
          action={
            <Link href={getDashboardHref("explore")} className={buttonStyles({ variant: "secondary", size: "sm" })}>
              Open Explore
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
            <EmptyState
              title={`No ${categoryLabels[category].toLowerCase()} available`}
              description="Check back soon."
              href={getDashboardHref("explore")}
              cta="Explore offers"
            />
          )}
        </SectionCard>

        <SectionCard eyebrow="Providers" title={`${categoryLabels[category]} providers`}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {providers.slice(0, 9).map((name) => (
              <div key={name} className="flex items-center gap-3 rounded-[18px] bg-bg-surface px-4 py-3">
                <ProviderLogo providerName={name} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-ink">{name}</p>
                  <p className="mt-0.5 text-xs text-ink-tertiary">
                    {offers.filter((o) => o.providerName === name).length} products
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  };

  // ─── Explore view ───

  const renderExploreView = () => (
    <MarketplaceExplorer
      offers={marketplaceOffers}
      initialMarket={dashboardMarket}
      initialCategory="all"
      mode="home"
    />
  );

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

  if (activeView === "explore") {
    body = renderExploreView();
  } else if (activeCategory) {
    body = renderCategoryView(activeCategory);
  } else if (activeView === "profile") {
    body = renderProfileView();
  } else {
    body = renderOverview();
  }

  return (
    <div className="grid gap-5">
      {renderSummary()}
      {body}
    </div>
  );
}
