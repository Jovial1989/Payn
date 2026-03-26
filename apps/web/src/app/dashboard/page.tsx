"use client";

import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/button";
import { DashboardOfferTile } from "@/components/dashboard-offer-tile";
import { ProviderLogo } from "@/components/provider-logo";
import { Tag } from "@/components/tag";
import { UserTypeOnboardingCard } from "@/components/user-type-onboarding-card";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import type { DashboardInsights, DashboardOfferInsight } from "@/lib/dashboard";
import { resolveProfileMarket } from "@/lib/dashboard";
import {
  getDashboardHref,
  normalizeDashboardView,
  type DashboardView,
} from "@/lib/dashboard-navigation";
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

interface DashboardAlert {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: "blue" | "success" | "orange";
}

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
  className = "",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[28px] border border-line bg-white p-5 shadow-subtle sm:p-6 ${className}`}>
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

function SummaryPanel({
  email,
  marketLabel,
  userLabel,
  score,
  selectedCategories,
  trackedCount,
}: {
  email: string | null | undefined;
  marketLabel: string;
  userLabel: string | null;
  score: number;
  selectedCategories: string[];
  trackedCount: number;
}) {
  return (
    <section className="rounded-[30px] border border-line bg-white p-5 shadow-subtle sm:p-6 lg:p-7">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Summary</p>
          <h1 className="mt-3 text-h2 text-ink">
            Welcome back{email ? `, ${email.split("@")[0]}` : ""}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            This is your product workspace - a single place to track market changes, compare saved products, and pick up where you left off.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Tag tone="success">{marketLabel}</Tag>
            {userLabel ? <Tag tone="muted">{userLabel}</Tag> : null}
            {selectedCategories.slice(0, 3).map((category) => (
              <Tag key={category} tone="blue">
                {normalizeDisplayText(category)}
              </Tag>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/explore" className={buttonStyles({ variant: "primary", size: "md" })}>
              Explore offers
            </Link>
            <Link href={getDashboardHref("saved")} className={buttonStyles({ variant: "secondary", size: "md" })}>
              Open saved
            </Link>
            <Link href={getDashboardHref("profile")} className={buttonStyles({ variant: "ghost", size: "md" })}>
              View profile
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Payn score
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{score}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Tracked products
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{trackedCount}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Focus market
            </p>
            <p className="mt-2 text-lg font-bold text-ink">{marketLabel}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Profile
            </p>
            <p className="mt-2 text-lg font-bold text-ink">{userLabel ?? "Account"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function OfferTileGrid({
  items,
  emptyTitle,
  emptyDescription,
  href = "/explore",
  cta = "Explore offers",
}: {
  items: DashboardOfferInsight[];
  emptyTitle: string;
  emptyDescription: string;
  href?: string;
  cta?: string;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        href={href}
        cta={cta}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <DashboardOfferTile key={item.offer.id} offer={item.offer} insight={item} />
      ))}
    </div>
  );
}

function SavedOffersGrid({
  offers,
  insightMap,
}: {
  offers: MarketplaceOffer[];
  insightMap: Map<string, DashboardOfferInsight>;
}) {
  if (offers.length === 0) {
    return (
      <EmptyState
        title="No saved offers yet"
        description="Save products from Explore or an offer detail page to build your shortlist here."
        href="/explore"
        cta="Go to Explore"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {offers.map((offer) => (
        <DashboardOfferTile
          key={offer.id}
          offer={offer}
          insight={insightMap.get(offer.id)}
          eyebrow="Saved"
        />
      ))}
    </div>
  );
}

function AlertsList({ alerts }: { alerts: DashboardAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-line-strong bg-white p-5">
        <p className="text-sm font-semibold text-ink">No live alerts right now</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Alerts appear when saved products, recent views, or market signals create a useful action for you.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {alerts.map((alert) => (
        <Link
          key={alert.id}
          href={alert.href}
          className="rounded-[24px] border border-line bg-white px-4 py-4 shadow-subtle transition-colors hover:bg-bg-surface"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">{alert.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{alert.detail}</p>
            </div>
            <Tag tone={alert.tone}>Alert</Tag>
          </div>
        </Link>
      ))}
    </div>
  );
}

function MarketSnapshot({
  insights,
}: {
  insights: DashboardInsights;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard
        eyebrow="Market snapshot"
        title="What is changing around you"
        description="Live FX input, provider momentum, and category demand make the dashboard feel current instead of static."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              FX movement
            </p>
            {insights.marketSignals.fx ? (
              <>
                <p className="mt-3 text-xl font-bold text-ink">{insights.marketSignals.fx.pair}</p>
                <p className="mt-1 text-sm text-ink-secondary">
                  {insights.marketSignals.fx.rate.toFixed(4)} now, {insights.marketSignals.fx.changePct >= 0 ? "+" : ""}
                  {insights.marketSignals.fx.changePct.toFixed(2)}% vs previous day
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                FX data is ready to appear here when a server-side exchange-rate source is configured.
              </p>
            )}
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              Market tone
            </p>
            {insights.marketSignals.news ? (
              <>
                <p className="mt-3 text-xl font-bold capitalize text-ink">{insights.marketSignals.news.tone}</p>
                <p className="mt-1 text-sm text-ink-secondary">
                  {insights.marketSignals.news.headlineCount} recent headlines from {insights.marketSignals.news.source}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                Investment news sentiment will appear here when the Finnhub server key is available.
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Momentum"
        title="Trending providers and categories"
        description="These blocks come from actual saves, views, and provider clicks in your market and among similar account types."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              Trending providers
            </p>
            <div className="mt-4 grid gap-3">
              {insights.trendingProviders.length > 0 ? (
                insights.trendingProviders.slice(0, 4).map((provider) => (
                  <div
                    key={provider.providerName}
                    className="flex items-center justify-between rounded-[20px] bg-bg-surface px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <ProviderLogo providerName={provider.providerName} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-ink">{provider.providerName}</p>
                        <p className="mt-1 text-xs text-ink-tertiary">
                          {provider.offerCount} active products
                        </p>
                      </div>
                    </div>
                    <Tag tone="muted">{provider.activityScore.toFixed(1)}</Tag>
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink-secondary">
                  Provider momentum will appear once enough signed-in activity is available.
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              Trending categories
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {insights.marketSignals.categoryMomentum.length > 0 ? (
                insights.marketSignals.categoryMomentum.map((item) => (
                  <Tag key={item.category} tone="blue">
                    {categoryLabels[item.category]} · {item.activityScore.toFixed(1)}
                  </Tag>
                ))
              ) : (
                <p className="text-sm text-ink-secondary">
                  Category demand will appear here as user activity builds.
                </p>
              )}
            </div>
            <div className="mt-5 rounded-[20px] bg-bg-surface px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                Trending crypto
              </p>
              {insights.marketSignals.crypto.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {insights.marketSignals.crypto.slice(0, 4).map((coin) => (
                    <Tag key={coin.id} tone="purple">
                      {coin.symbol}
                      {coin.priceChange24h !== null
                        ? ` ${coin.priceChange24h >= 0 ? "+" : ""}${coin.priceChange24h.toFixed(1)}%`
                        : ""}
                    </Tag>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-secondary">
                  CoinGecko trends will appear here when available.
                </p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function RewardsBlock({ insights }: { insights: DashboardInsights }) {
  return (
    <SectionCard
      eyebrow="Rewards"
      title="Payn score and engagement"
      description="Rewards stay tied to real activity only: saves, provider clicks, and tracked research."
    >
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[24px] bg-black px-6 py-6 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Your Payn score
          </p>
          <p className="mt-3 text-5xl font-bold tracking-tight">{insights.loyalty.score}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Save offer = +1 point. Click provider = +2 points. Score reflects product engagement, not decorative gamification.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Saved
            </p>
            <p className="mt-2 text-2xl font-bold text-ink">{insights.loyalty.savedCount}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Provider clicks
            </p>
            <p className="mt-2 text-2xl font-bold text-ink">{insights.loyalty.providerClickCount}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Offer views
            </p>
            <p className="mt-2 text-2xl font-bold text-ink">{insights.loyalty.viewedCount}</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function buildAlertFeed(
  insights: DashboardInsights,
  activeCategory?: MarketplaceCategory,
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const savedIds = new Set(insights.savedOffers.map((offer) => offer.id));

  if (
    insights.marketSignals.fx &&
    Math.abs(insights.marketSignals.fx.changePct) >= 0.6 &&
    (!activeCategory || activeCategory === "transfers" || activeCategory === "exchange")
  ) {
    alerts.push({
      id: "fx-move",
      title: `FX moved on ${insights.marketSignals.fx.pair}`,
      detail: `${insights.marketSignals.fx.changePct >= 0 ? "Up" : "Down"} ${Math.abs(
        insights.marketSignals.fx.changePct,
      ).toFixed(2)}% since yesterday. Review transfer and exchange products if timing matters.`,
      href: getDashboardHref("trends"),
      tone: "blue",
    });
  }

  const savedTrending = insights.trendingInMarket.find((item) => savedIds.has(item.offer.id));
  if (savedTrending) {
    alerts.push({
      id: "saved-trending",
      title: `${savedTrending.offer.title} is gaining attention`,
      detail: "A saved product is also trending in your market right now.",
      href: getDashboardHref("saved"),
      tone: "success",
    });
  }

  if (insights.watchedOffers.length > 0) {
    alerts.push({
      id: "recent-research",
      title: "You have recent research to pick back up",
      detail: `${insights.watchedOffers.length} recently viewed product${insights.watchedOffers.length === 1 ? "" : "s"} can be reviewed or saved from your tracking block.`,
      href: getDashboardHref("saved"),
      tone: "orange",
    });
  }

  if (
    insights.marketSignals.news?.tone === "cautious" &&
    (!activeCategory || activeCategory === "investments")
  ) {
    alerts.push({
      id: "news-caution",
      title: "Investment sentiment turned cautious",
      detail: "Recent market headlines are leaning cautious. Review platform and crypto exposure carefully before clicking through.",
      href: getDashboardHref("trends"),
      tone: "orange",
    });
  }

  return alerts.slice(0, 3);
}

function createInsightMap(insights: DashboardInsights) {
  const map = new Map<string, DashboardOfferInsight>();
  const buckets = [
    insights.recommended,
    insights.bestValueToday,
    insights.popularWithUsersLikeYou,
    insights.trendingInMarket,
    insights.marketSignals.risingFxOffers,
    insights.marketSignals.cryptoPlatforms,
  ];

  for (const bucket of buckets) {
    for (const item of bucket) {
      if (!map.has(item.offer.id)) {
        map.set(item.offer.id, item);
      }
    }
  }

  return map;
}

function mergeInsights(...buckets: DashboardOfferInsight[][]) {
  const seen = new Set<string>();
  const merged: DashboardOfferInsight[] = [];

  for (const bucket of buckets) {
    for (const item of bucket) {
      if (seen.has(item.offer.id)) {
        continue;
      }

      seen.add(item.offer.id);
      merged.push(item);
    }
  }

  return merged;
}

function toInsightForOffer(
  offer: MarketplaceOffer,
  insightMap: Map<string, DashboardOfferInsight>,
): DashboardOfferInsight {
  return (
    insightMap.get(offer.id) ?? {
      offer,
      activityScore: 0,
      saveCount: 0,
      providerClickCount: 0,
      offerViewCount: 0,
    }
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const activeView = useMemo(
    () => normalizeDashboardView(searchParams.get("view")),
    [searchParams],
  );

  const { user, profile, loading } = useAuth();
  const preferences = useMarketplacePreferences();
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const dashboardMarket = profile ? resolveProfileMarket(profile.home_country) : preferences.market;

  const loadInsights = useCallback(async () => {
    if (!user || !profile?.onboarding_completed) {
      setInsights(null);
      setInsightsLoading(false);
      setInsightsError(null);
      return;
    }

    setInsightsLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch("/api/v1/dashboard", {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Unable to load dashboard insights.");
      }

      const payload = (await response.json()) as DashboardInsights;
      setInsights(payload);
      setInsightsError(null);
    } catch (error) {
      if (controller.signal.aborted) {
        setInsightsError("Dashboard took too long to respond. Try again or explore offers directly.");
      } else {
        setInsightsError(
          error instanceof Error ? error.message : "Unable to load dashboard insights.",
        );
      }
    } finally {
      clearTimeout(timeout);
      setInsightsLoading(false);
    }
  }, [profile?.onboarding_completed, user]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  useEffect(() => {
    if (!user || !profile?.onboarding_completed) {
      return;
    }

    const refresh = () => {
      void loadInsights();
    };

    window.addEventListener("payn:saved-offers-changed", refresh);
    window.addEventListener("payn:provider-click", refresh);

    return () => {
      window.removeEventListener("payn:saved-offers-changed", refresh);
      window.removeEventListener("payn:provider-click", refresh);
    };
  }, [loadInsights, profile?.onboarding_completed, user]);

  const userLabel = useMemo(() => {
    if (!profile) {
      return null;
    }

    return profile.user_type === "personal"
      ? "Personal"
      : profile.user_type === "freelancer"
        ? "Freelancer"
        : "Business";
  }, [profile]);

  const marketLabel = insights
    ? marketDefinitions[insights.market].label
    : marketDefinitions[dashboardMarket].label;

  const insightMap = useMemo(
    () => (insights ? createInsightMap(insights) : new Map<string, DashboardOfferInsight>()),
    [insights],
  );

  const activeCategory = dashboardCategories.includes(activeView as MarketplaceCategory)
    ? (activeView as MarketplaceCategory)
    : null;

  const categoryWorkspace = useMemo(() => {
    if (!insights || !activeCategory) {
      return null;
    }

    const scopedOffers = marketplaceOffers
      .filter((offer) => matchesOfferMarket(offer, insights.market))
      .filter((offer) => offer.category === activeCategory);

    const merged = mergeInsights(
      insights.recommended.filter((item) => item.offer.category === activeCategory),
      insights.bestValueToday.filter((item) => item.offer.category === activeCategory),
      insights.popularWithUsersLikeYou.filter((item) => item.offer.category === activeCategory),
      insights.trendingInMarket.filter((item) => item.offer.category === activeCategory),
    );

    const fill = scopedOffers
      .map((offer) => toInsightForOffer(offer, insightMap))
      .filter((item) => !merged.some((existing) => existing.offer.id === item.offer.id));

    return {
      title: categoryLabels[activeCategory],
      offers: [...merged, ...fill].slice(0, 6),
      saved: insights.savedOffers.filter((offer) => offer.category === activeCategory),
      watched: insights.watchedOffers.filter((offer) => offer.category === activeCategory),
      trendingProviders: insights.trendingProviders.filter((provider) =>
        scopedOffers.some((offer) => offer.providerName === provider.providerName),
      ),
      totalCount: scopedOffers.length,
    };
  }, [activeCategory, insightMap, insights]);

  const alerts = useMemo(
    () => (insights ? buildAlertFeed(insights, activeCategory ?? undefined) : []),
    [activeCategory, insights],
  );

  if (loading) {
    return <LoadingState label="Loading your product workspace" />;
  }

  if (!user) {
    return (
      <div className="grid gap-6">
        <SectionCard
          eyebrow="Dashboard"
          title="Sign in to access your Payn workspace"
          description="The dashboard is now a real product control center with saved products, trends, market signals, and recommendations in one place."
        >
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className={buttonStyles({ variant: "primary", size: "lg" })}>
              Sign in
            </Link>
            <Link href="/signup" className={buttonStyles({ variant: "secondary", size: "lg" })}>
              Get started
            </Link>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (!profile?.onboarding_completed) {
    return (
      <div className="grid gap-6">
        <SectionCard
          eyebrow="Welcome back"
          title="Finish your setup to unlock the dashboard"
          description="Choose how you use Payn so the product dashboard can rank the most relevant products for your account."
        >
          <UserTypeOnboardingCard />
        </SectionCard>
      </div>
    );
  }

  if (insightsLoading && !insights) {
    return <LoadingState label="Loading live recommendations, trends, and tracking" />;
  }

  if (insightsError && !insights) {
    return (
      <SectionCard
        eyebrow="Dashboard"
        title="Dashboard data could not be loaded"
        description={insightsError}
      >
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadInsights()}
            className={buttonStyles({ variant: "primary", size: "md" })}
          >
            Try again
          </button>
          <Link href="/explore" className={buttonStyles({ variant: "secondary", size: "md" })}>
            Explore offers
          </Link>
        </div>
      </SectionCard>
    );
  }

  if (!insights) {
    return null;
  }

  const trackedCount = insights.savedOffers.length + insights.watchedOffers.length;

  const renderOverview = () => (
    <div className="grid gap-5">
      <MarketSnapshot insights={insights} />

      <SectionCard
        eyebrow="Recommended"
        title="Across-category recommendations"
        description="Multiple products are ranked here from the recommendation engine, not a single oversized feature card."
        action={
          <Link href="/explore" className={buttonStyles({ variant: "secondary", size: "md" })}>
            Explore more
          </Link>
        }
      >
        <OfferTileGrid
          items={insights.recommended}
          emptyTitle="No recommendations yet"
          emptyDescription="Recommendations appear here once your profile, market, and activity create enough signal."
        />
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          eyebrow="Saved / tracking"
          title="Saved offers, watched products, and alerts"
          description="Tracking is part of the dashboard product now - not a dead-end favorites list."
        >
          <div className="grid gap-5">
            <SavedOffersGrid offers={insights.savedOffers.slice(0, 4)} insightMap={insightMap} />
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[24px] bg-bg-surface px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                  Recently viewed
                </p>
                {insights.watchedOffers.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {insights.watchedOffers.map((offer) => (
                      <Link key={offer.id} href={`/offers/${offer.slug}`} className="text-sm font-medium text-ink transition-colors hover:text-ink-secondary">
                        {offer.title}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-ink-secondary">
                    Viewed offers appear here once you open offer detail pages while signed in.
                  </p>
                )}
              </div>
              <div>
                <AlertsList alerts={alerts} />
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-5">
          <SectionCard
            eyebrow="Trends"
            title="Trending products and rising providers"
            description="Backed by real internal activity and explicit ranking rules."
          >
            <OfferTileGrid
              items={insights.trendingInMarket.slice(0, 3)}
              emptyTitle="No live trend data yet"
              emptyDescription="Trending products will appear here as product activity builds in your market."
              href={getDashboardHref("trends")}
              cta="Open trends"
            />
          </SectionCard>

          <RewardsBlock insights={insights} />
        </div>
      </div>
    </div>
  );

  const renderCategoryWorkspace = () => {
    if (!categoryWorkspace || !activeCategory) {
      return null;
    }

    return (
      <div className="grid gap-5">
        <SectionCard
          eyebrow={categoryWorkspace.title}
          title={`${categoryWorkspace.title} workspace`}
          description="This keeps the same dashboard shell and swaps the main content for category-specific signals, saved items, and recommendations."
          action={
            <Link href="/explore" className={buttonStyles({ variant: "secondary", size: "md" })}>
              Open Explore
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] bg-bg-surface px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                Available offers
              </p>
              <p className="mt-2 text-2xl font-bold text-ink">{categoryWorkspace.totalCount}</p>
            </div>
            <div className="rounded-[24px] bg-bg-surface px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                Saved in category
              </p>
              <p className="mt-2 text-2xl font-bold text-ink">{categoryWorkspace.saved.length}</p>
            </div>
            <div className="rounded-[24px] bg-bg-surface px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                Recently viewed
              </p>
              <p className="mt-2 text-2xl font-bold text-ink">{categoryWorkspace.watched.length}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Recommended"
          title={`Best ${categoryWorkspace.title.toLowerCase()} products for your profile`}
          description="The same recommendation engine is filtered into a category workspace so the app feels focused, not like a website redirect."
        >
          <OfferTileGrid
            items={categoryWorkspace.offers}
            emptyTitle={`No ${categoryWorkspace.title.toLowerCase()} recommendations yet`}
            emptyDescription="As more offers and user activity become available in this category, the workspace will fill in."
          />
        </SectionCard>

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            eyebrow="Tracking"
            title={`Saved and watched ${categoryWorkspace.title.toLowerCase()}`}
            description="Tracking stays inside the same dashboard workspace rather than pushing you into a different website flow."
          >
            <div className="grid gap-5">
              <SavedOffersGrid offers={categoryWorkspace.saved} insightMap={insightMap} />
              <div className="rounded-[24px] bg-bg-surface px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                  Recently viewed in {categoryWorkspace.title.toLowerCase()}
                </p>
                {categoryWorkspace.watched.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {categoryWorkspace.watched.map((offer) => (
                      <Link key={offer.id} href={`/offers/${offer.slug}`} className="text-sm font-medium text-ink transition-colors hover:text-ink-secondary">
                        {offer.title}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-ink-secondary">
                    Viewed products in this category will appear here.
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          <div className="grid gap-5">
            <SectionCard
              eyebrow="Category trends"
              title={`What is moving inside ${categoryWorkspace.title.toLowerCase()}`}
              description="These alerts and provider cues are still backed by market activity and recommendation rules."
            >
              <AlertsList alerts={alerts} />
            </SectionCard>

            <SectionCard
              eyebrow="Providers"
              title={`Active ${categoryWorkspace.title.toLowerCase()} providers`}
              description="Top providers in this category are surfaced inside the same layout."
            >
              <div className="grid gap-3">
                {categoryWorkspace.trendingProviders.length > 0 ? (
                  categoryWorkspace.trendingProviders.slice(0, 4).map((provider) => (
                    <div
                      key={provider.providerName}
                      className="flex items-center justify-between rounded-[22px] bg-bg-surface px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <ProviderLogo providerName={provider.providerName} size="sm" />
                        <span className="text-sm font-semibold text-ink">{provider.providerName}</span>
                      </div>
                      <Tag tone="muted">{provider.activityScore.toFixed(1)}</Tag>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-ink-secondary">
                    Category-specific provider momentum will appear here once enough activity is available.
                  </p>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    );
  };

  const renderSavedView = () => (
    <div className="grid gap-5">
      <SectionCard
        eyebrow="Saved"
        title="Your tracked products"
        description="Saved offers, recently viewed products, and real alert logic live together here."
      >
        <SavedOffersGrid offers={insights.savedOffers} insightMap={insightMap} />
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          eyebrow="Watched"
          title="Recently viewed"
          description="These are pulled from signed-in offer views, not fake watchlist placeholders."
        >
          {insights.watchedOffers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {insights.watchedOffers.map((offer) => (
                <DashboardOfferTile key={offer.id} offer={offer} insight={insightMap.get(offer.id)} eyebrow="Viewed" />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recently viewed offers yet"
              description="Open an offer detail page while signed in and it will appear here."
              href="/explore"
              cta="Browse offers"
            />
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Alerts"
          title="What needs attention"
          description="Alerts are created from real changes in saved offers, recent views, and market signals."
        >
          <AlertsList alerts={alerts} />
        </SectionCard>
      </div>
    </div>
  );

  const renderTrendsView = () => (
    <div className="grid gap-5">
      <MarketSnapshot insights={insights} />

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          eyebrow="Trending products"
          title="Offers gaining attention"
          description="Most viewed, clicked, and saved offers in your market are surfaced here."
        >
          <OfferTileGrid
            items={insights.trendingInMarket}
            emptyTitle="No trending offers yet"
            emptyDescription="Trend blocks are waiting for more market activity."
          />
        </SectionCard>

        <SectionCard
          eyebrow="Rising transfer / FX options"
          title="Products reacting to market movement"
          description="FX-sensitive products become more visible here when exchange rates move or transfer demand increases."
        >
          <OfferTileGrid
            items={insights.marketSignals.risingFxOffers}
            emptyTitle="No transfer or FX momentum yet"
            emptyDescription="This block will fill as transfer and exchange activity builds."
          />
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          eyebrow="Investment platforms"
          title="Trending crypto and investment platforms"
          description="This block combines CoinGecko signals when available with internal activity on investment products."
        >
          <OfferTileGrid
            items={insights.marketSignals.cryptoPlatforms}
            emptyTitle="No investment-platform trend yet"
            emptyDescription="As crypto and investment activity grows, this block will surface the strongest signals."
          />
        </SectionCard>

        <SectionCard
          eyebrow="Insurance demand"
          title="Most viewed insurance categories"
          description="Interest by subtype comes from real offer views and clicks in your market."
        >
          <div className="flex flex-wrap gap-2">
            {insights.marketSignals.insuranceCategories.length > 0 ? (
              insights.marketSignals.insuranceCategories.map((item) => (
                <Tag key={item.subtype} tone="blue">
                  {item.subtype.charAt(0).toUpperCase()}
                  {item.subtype.slice(1)} · {item.activityScore.toFixed(1)}
                </Tag>
              ))
            ) : (
              <p className="text-sm text-ink-secondary">
                Insurance demand will appear once enough users interact with insurance products.
              </p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );

  const renderRewardsView = () => (
    <div className="grid gap-5">
      <RewardsBlock insights={insights} />

      <SectionCard
        eyebrow="How to earn"
        title="A simple engagement system"
        description="The rewards system is intentionally light. It reflects real product actions rather than generic streak mechanics."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-sm font-semibold text-ink">Save an offer</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Add products to your shortlist as you compare options across categories.
            </p>
            <Tag tone="success" className="mt-4">
              +1 point
            </Tag>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-sm font-semibold text-ink">Click through to provider</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Continue to a provider once you are ready to review full terms outside Payn.
            </p>
            <Tag tone="blue" className="mt-4">
              +2 points
            </Tag>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-sm font-semibold text-ink">Research your market</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Views improve recommendations but do not inflate loyalty points on their own.
            </p>
            <Tag tone="muted" className="mt-4">
              Recommendation signal
            </Tag>
          </div>
        </div>
      </SectionCard>
    </div>
  );

  const renderProfileView = () => (
    <div className="grid gap-5">
      <SectionCard
        eyebrow="Profile"
        title="Your dashboard setup"
        description="This profile powers recommendations, market matching, and similar-user trend rules."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              User type
            </p>
            <p className="mt-2 text-lg font-bold text-ink">{userLabel ?? "Profile"}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              Home market
            </p>
            <p className="mt-2 text-lg font-bold text-ink">{marketLabel}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              Interests
            </p>
            <p className="mt-2 text-lg font-bold text-ink">
              {profile.selected_categories.length || dashboardCategories.length}
            </p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              Goals
            </p>
            <p className="mt-2 text-lg font-bold text-ink">{profile.goals.length}</p>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          eyebrow="Selected categories"
          title="What you want Payn to optimize for"
          description="These interests are already feeding the recommendation engine."
        >
          <div className="flex flex-wrap gap-2">
            {(profile.selected_categories.length > 0
              ? profile.selected_categories
              : dashboardCategories
            ).map((category) => (
              <Tag key={category} tone="blue">
                {normalizeDisplayText(category)}
              </Tag>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Goals"
          title="Business rules behind your recommendations"
          description="Goals do not trigger AI guesses. They explicitly influence category and fee-fit scoring."
        >
          <div className="flex flex-wrap gap-2">
            {profile.goals.length > 0 ? (
              profile.goals.map((goal) => (
                <Tag key={goal} tone="muted">
                  {normalizeDisplayText(goal.replace(/_/g, " "))}
                </Tag>
              ))
            ) : (
              <p className="text-sm text-ink-secondary">
                No explicit goals saved yet. Recommendations currently rely more on user type, country, and recent activity.
              </p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );

  let body: React.ReactNode = renderOverview();

  if (activeCategory) {
    body = renderCategoryWorkspace();
  } else if (activeView === "saved") {
    body = renderSavedView();
  } else if (activeView === "trends") {
    body = renderTrendsView();
  } else if (activeView === "rewards") {
    body = renderRewardsView();
  } else if (activeView === "profile") {
    body = renderProfileView();
  }

  return (
    <div className="grid gap-5">
      <SummaryPanel
        email={user.email}
        marketLabel={marketLabel}
        userLabel={userLabel}
        score={insights.loyalty.score}
        selectedCategories={
          profile.selected_categories.length > 0
            ? profile.selected_categories
            : [profile.user_type]
        }
        trackedCount={trackedCount}
      />
      {body}
    </div>
  );
}
