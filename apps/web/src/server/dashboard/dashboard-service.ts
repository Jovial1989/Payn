import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { MarketplaceOffer } from "@payn/types";
import type {
  DashboardCryptoSignal,
  DashboardFxSignal,
  DashboardInsights,
  DashboardNewsSignal,
  OfferActivityRollup,
} from "@/lib/dashboard";
import type { SavedOffer, UserProfile } from "@/lib/types";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import {
  getBestValueToday,
  getCategoryMomentum,
  getCryptoPlatformTrends,
  getInsuranceCategoryTrends,
  getPopularWithUsersLikeYou,
  getRecommendedOffers,
  getRisingFxOffers,
  getTrendingOffers,
  getTrendingProviders,
  getUserTypePreferences,
  resolveProfileMarket,
} from "@/lib/dashboard";
import { marketDefinitions } from "@/lib/marketplace";
import { serverEnv } from "@/lib/server-env";

interface UserActivityRow {
  offer_id: string | null;
  action: string;
  created_at: string;
}

interface RpcOfferActivityRow {
  offer_id: string;
  category: string;
  save_count: number | string;
  provider_click_count: number | string;
  offer_view_count: number | string;
  activity_score: number | string;
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function mapOfferRollups(rows: RpcOfferActivityRow[] | null | undefined): OfferActivityRollup[] {
  return (rows ?? [])
    .filter((row) => Boolean(row.offer_id))
    .map((row) => ({
      offerId: row.offer_id,
      category: row.category as OfferActivityRollup["category"],
      saveCount: toNumber(row.save_count),
      providerClickCount: toNumber(row.provider_click_count),
      offerViewCount: toNumber(row.offer_view_count),
      activityScore: toNumber(row.activity_score),
    }));
}

function getOfferByIdMap() {
  return new Map(marketplaceOffers.map((offer) => [offer.id, offer]));
}

function dedupeOffersByRecentActivity(activityRows: UserActivityRow[]) {
  const offersById = getOfferByIdMap();
  const seen = new Set<string>();
  const watchedOffers: MarketplaceOffer[] = [];

  for (const row of activityRows) {
    if (row.action !== "offer_view" || !row.offer_id || seen.has(row.offer_id)) {
      continue;
    }

    const offer = offersById.get(row.offer_id);

    if (!offer) {
      continue;
    }

    seen.add(row.offer_id);
    watchedOffers.push(offer);

    if (watchedOffers.length >= 3) {
      break;
    }
  }

  return watchedOffers;
}

function getPairForMarket(market: keyof typeof marketDefinitions) {
  if (market === "uk") {
    return { from: "GBP", to: "EUR" };
  }

  return { from: "EUR", to: "GBP" };
}

function calculatePairRate(rates: Record<string, number>, from: string, to: string) {
  if (!rates[from] || !rates[to]) {
    return null;
  }

  return rates[to] / rates[from];
}

async function fetchJsonWithTimeout<T>(
  input: string,
  init: RequestInit = {},
  timeoutMs = 4500,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function getFxSignal(market: keyof typeof marketDefinitions): Promise<DashboardFxSignal | null> {
  if (!serverEnv.openExchangeRatesAppId) {
    return null;
  }

  const pair = getPairForMarket(market);
  const symbols = Array.from(new Set([pair.from, pair.to, "USD"])).join(",");
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const historicalDate = yesterday.toISOString().slice(0, 10);

  try {
    const [latest, previous] = await Promise.all([
      fetchJsonWithTimeout<{
        timestamp: number;
        rates: Record<string, number>;
      }>(
        `https://openexchangerates.org/api/latest.json?app_id=${serverEnv.openExchangeRatesAppId}&symbols=${symbols}`,
        { next: { revalidate: 900 } },
      ),
      fetchJsonWithTimeout<{
        timestamp: number;
        rates: Record<string, number>;
      }>(
        `https://openexchangerates.org/api/historical/${historicalDate}.json?app_id=${serverEnv.openExchangeRatesAppId}&symbols=${symbols}`,
        { next: { revalidate: 900 } },
      ),
    ]);

    const latestRate = calculatePairRate(latest.rates, pair.from, pair.to);
    const previousRate = calculatePairRate(previous.rates, pair.from, pair.to);

    if (!latestRate || !previousRate) {
      return null;
    }

    const changePct = ((latestRate - previousRate) / previousRate) * 100;

    return {
      pair: `${pair.from}/${pair.to}`,
      rate: latestRate,
      previousRate,
      changePct,
      direction:
        Math.abs(changePct) < 0.05 ? "flat" : changePct > 0 ? "up" : "down",
      source: "Open Exchange Rates",
      updatedAt: new Date(latest.timestamp * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

async function getCryptoSignals(): Promise<DashboardCryptoSignal[]> {
  const headers: Record<string, string> = {};

  if (serverEnv.coinGeckoApiKey) {
    headers["x-cg-demo-api-key"] = serverEnv.coinGeckoApiKey;
  }

  try {
    const response = await fetchJsonWithTimeout<{
      coins?: Array<{
        item?: {
          id?: string;
          name?: string;
          symbol?: string;
          market_cap_rank?: number | null;
          thumb?: string | null;
          data?: {
            price_change_percentage_24h?: { usd?: number | null };
          };
        };
      }>;
    }>("https://api.coingecko.com/api/v3/search/trending", {
      headers,
      next: { revalidate: 900 },
    });

    return (response.coins ?? [])
      .map((entry) => {
        const item = entry.item;

        if (!item?.id || !item.name || !item.symbol) {
          return null;
        }

        return {
          id: item.id,
          name: item.name,
          symbol: item.symbol.toUpperCase(),
          marketCapRank: item.market_cap_rank ?? null,
          priceChange24h: item.data?.price_change_percentage_24h?.usd ?? null,
          thumbUrl: item.thumb ?? null,
        } satisfies DashboardCryptoSignal;
      })
      .filter(Boolean)
      .slice(0, 4) as DashboardCryptoSignal[];
  } catch {
    return [];
  }
}

function scoreNewsTone(items: Array<{ headline?: string; summary?: string }>) {
  const positiveTerms = ["gain", "rally", "surge", "beats", "growth", "optimism", "upgrade"];
  const negativeTerms = ["drop", "fall", "selloff", "risk", "downgrade", "cuts", "volatility"];

  let score = 0;

  for (const item of items) {
    const text = `${item.headline ?? ""} ${item.summary ?? ""}`.toLowerCase();

    for (const term of positiveTerms) {
      if (text.includes(term)) score += 1;
    }

    for (const term of negativeTerms) {
      if (text.includes(term)) score -= 1;
    }
  }

  return score;
}

async function getNewsSignal(): Promise<DashboardNewsSignal | null> {
  if (!serverEnv.finnhubApiKey) {
    return null;
  }

  try {
    const items = await fetchJsonWithTimeout<
      Array<{ headline?: string; summary?: string }>
    >(
      `https://finnhub.io/api/v1/news?category=general&token=${serverEnv.finnhubApiKey}`,
      { next: { revalidate: 900 } },
    );

    const sample = items.slice(0, 12);

    if (sample.length === 0) {
      return null;
    }

    const score = scoreNewsTone(sample);

    return {
      tone: score >= 3 ? "positive" : score <= -3 ? "cautious" : "mixed",
      score,
      headlineCount: sample.length,
      headlines: sample
        .map((item) => item.headline?.trim())
        .filter(Boolean)
        .slice(0, 3) as string[],
      source: "Finnhub",
    };
  } catch {
    return null;
  }
}

async function loadOfferRollups(
  supabase: SupabaseClient,
  market: string,
  userType?: string | null,
) {
  const { data } = await supabase.rpc("get_market_offer_activity", {
    target_market: market,
    target_user_type: userType ?? null,
    lookback_days: 30,
  });

  return mapOfferRollups(data as RpcOfferActivityRow[] | null);
}

export async function getDashboardInsights(args: {
  supabase: SupabaseClient;
  userId: string;
  profile: UserProfile;
}): Promise<DashboardInsights> {
  const { supabase, userId, profile } = args;
  const market = resolveProfileMarket(profile.home_country);
  const offerById = getOfferByIdMap();

  const [{ data: savedData }, { data: activityData }, marketRollups, similarUserRollups, fx, crypto, news] =
    await Promise.all([
      supabase
        .from("saved_offers")
        .select("*")
        .order("saved_at", { ascending: false }),
      supabase
        .from("user_activity")
        .select("offer_id, action, created_at")
        .eq("user_id", userId)
        .in("action", ["offer_view", "provider_click"])
        .order("created_at", { ascending: false })
        .limit(60),
      loadOfferRollups(supabase, market),
      loadOfferRollups(supabase, market, profile.user_type),
      getFxSignal(market),
      getCryptoSignals(),
      getNewsSignal(),
    ]);

  const savedRows = (savedData as SavedOffer[] | null) ?? [];
  const activityRows = (activityData as UserActivityRow[] | null) ?? [];
  const savedOffers = savedRows
    .map((row) => offerById.get(row.offer_id))
    .filter(Boolean) as MarketplaceOffer[];
  const watchedOffers = dedupeOffersByRecentActivity(activityRows).filter(
    (offer) => !savedOffers.some((savedOffer) => savedOffer.id === offer.id),
  );
  const providerClickCount = activityRows.filter((row) => row.action === "provider_click").length;
  const viewedCount = activityRows.filter((row) => row.action === "offer_view").length;
  const preferredCategories = getUserTypePreferences(profile.user_type);
  const marketScopedRollups = marketRollups.filter((rollup) => offerById.has(rollup.offerId));
  const similarScopedRollups = similarUserRollups.filter((rollup) => offerById.has(rollup.offerId));

  const recommended = getRecommendedOffers({
    offers: marketplaceOffers,
    profile,
    market,
    savedOffers,
    watchedOffers,
    marketRollups: marketScopedRollups,
    similarUserRollups: similarScopedRollups,
    fxSignal: fx,
    cryptoSignals: crypto,
  });

  const bestValueToday = getBestValueToday({
    offers: marketplaceOffers,
    market,
    profile,
    rollups: marketScopedRollups,
  });

  const popularWithUsersLikeYou = getPopularWithUsersLikeYou({
    offers: marketplaceOffers,
    market,
    rollups: similarScopedRollups.length > 0 ? similarScopedRollups : marketScopedRollups,
    preferredCategories,
  });

  const trendingInMarket = getTrendingOffers({
    offers: marketplaceOffers,
    market,
    rollups: marketScopedRollups,
  });

  const trendingProviders = getTrendingProviders({
    offers: marketplaceOffers,
    rollups: marketScopedRollups,
  });

  return {
    market,
    userType: profile.user_type,
    recommended,
    bestValueToday,
    popularWithUsersLikeYou,
    trendingInMarket,
    trendingProviders,
    savedOffers: savedOffers.slice(0, 3),
    watchedOffers: watchedOffers.slice(0, 3),
    loyalty: {
      score: savedRows.length + providerClickCount * 2,
      savedCount: savedRows.length,
      providerClickCount,
      viewedCount,
    },
    marketSignals: {
      fx,
      crypto,
      news,
      risingFxOffers: getRisingFxOffers({
        offers: marketplaceOffers,
        market,
        rollups: marketScopedRollups,
        fxSignal: fx,
      }),
      cryptoPlatforms: getCryptoPlatformTrends({
        offers: marketplaceOffers,
        market,
        rollups: marketScopedRollups,
        cryptoSignals: crypto,
      }),
      insuranceCategories: getInsuranceCategoryTrends({
        offers: marketplaceOffers,
        rollups: marketScopedRollups,
      }),
      categoryMomentum: getCategoryMomentum({
        offers: marketplaceOffers,
        rollups: similarScopedRollups.length > 0 ? similarScopedRollups : marketScopedRollups,
      }),
    },
    generatedAt: new Date().toISOString(),
  };
}
