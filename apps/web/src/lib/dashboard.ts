import type { MarketplaceCategory, MarketplaceMarket, MarketplaceOffer } from "@payn/types";
import type { UserProfile } from "@/lib/types";
import {
  getMetricValue,
  matchesOfferMarket,
  parseMetricRange,
} from "@/lib/marketplace";

export interface OfferActivityRollup {
  offerId: string;
  category: MarketplaceCategory;
  saveCount: number;
  providerClickCount: number;
  offerViewCount: number;
  activityScore: number;
}

export interface DashboardOfferInsight {
  offer: MarketplaceOffer;
  activityScore: number;
  saveCount: number;
  providerClickCount: number;
  offerViewCount: number;
}

export interface DashboardProviderTrend {
  providerName: string;
  activityScore: number;
  offerCount: number;
}

export interface DashboardCategoryTrend {
  category: MarketplaceCategory;
  activityScore: number;
}

export interface DashboardSubtypeTrend {
  subtype: string;
  activityScore: number;
}

export interface DashboardFxSignal {
  pair: string;
  rate: number;
  previousRate: number;
  changePct: number;
  direction: "up" | "down" | "flat";
  source: "Open Exchange Rates" | "ExchangeRate.host";
  updatedAt: string;
}

export interface DashboardCryptoSignal {
  id: string;
  name: string;
  symbol: string;
  marketCapRank: number | null;
  priceChange24h: number | null;
  thumbUrl: string | null;
}

export interface DashboardNewsSignal {
  tone: "positive" | "mixed" | "cautious";
  score: number;
  headlineCount: number;
  headlines: string[];
  source: "Finnhub";
}

export interface DashboardMarketSignals {
  fx: DashboardFxSignal | null;
  crypto: DashboardCryptoSignal[];
  news: DashboardNewsSignal | null;
  risingFxOffers: DashboardOfferInsight[];
  cryptoPlatforms: DashboardOfferInsight[];
  insuranceCategories: DashboardSubtypeTrend[];
  categoryMomentum: DashboardCategoryTrend[];
}

export interface DashboardLoyaltySummary {
  score: number;
  savedCount: number;
  providerClickCount: number;
  viewedCount: number;
}

export interface DashboardInsights {
  market: MarketplaceMarket;
  userType: UserProfile["user_type"];
  recommended: DashboardOfferInsight[];
  bestValueToday: DashboardOfferInsight[];
  popularWithUsersLikeYou: DashboardOfferInsight[];
  trendingInMarket: DashboardOfferInsight[];
  trendingProviders: DashboardProviderTrend[];
  savedOffers: MarketplaceOffer[];
  watchedOffers: MarketplaceOffer[];
  loyalty: DashboardLoyaltySummary;
  marketSignals: DashboardMarketSignals;
  generatedAt: string;
}

const userTypeCategoryPreferences: Record<UserProfile["user_type"], MarketplaceCategory[]> = {
  personal: ["loans", "cards", "insurance", "transfers", "investments", "exchange"],
  freelancer: ["transfers", "exchange", "cards", "insurance", "investments", "loans"],
  business: ["exchange", "transfers", "insurance", "investments", "cards", "loans"],
};

const userTypeSubtypePreferences: Record<UserProfile["user_type"], string[]> = {
  personal: ["travel", "health", "life", "stocks", "crypto"],
  freelancer: ["travel", "platforms", "health", "crypto"],
  business: ["platforms", "car", "health", "stocks"],
};

function clampScore(value: number, max = 18) {
  return Math.min(value, max);
}

function normalizeRollups(rollups: OfferActivityRollup[]) {
  return new Map(rollups.map((rollup) => [rollup.offerId, rollup]));
}

function getFreshnessBoost(offer: MarketplaceOffer) {
  const ageDays = Math.max(
    0,
    (Date.now() - new Date(offer.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, 4 - ageDays * 0.15);
}

function getBehaviorCategories(args: {
  savedOffers: MarketplaceOffer[];
  watchedOffers: MarketplaceOffer[];
}) {
  return Array.from(
    new Set([...args.savedOffers, ...args.watchedOffers].map((offer) => offer.category)),
  );
}

function getBehaviorProviders(args: {
  savedOffers: MarketplaceOffer[];
  watchedOffers: MarketplaceOffer[];
}) {
  return new Set([...args.savedOffers, ...args.watchedOffers].map((offer) => offer.providerName));
}

function getPreferredCategories(profile: UserProfile) {
  if (profile.selected_categories.length > 0) {
    return profile.selected_categories as MarketplaceCategory[];
  }

  return userTypeCategoryPreferences[profile.user_type];
}

function getPreferredSubtypes(profile: UserProfile) {
  return userTypeSubtypePreferences[profile.user_type];
}

function getOfferRollupInsight(
  offer: MarketplaceOffer,
  rollupMap: Map<string, OfferActivityRollup>,
): DashboardOfferInsight {
  const rollup = rollupMap.get(offer.id);

  return {
    offer,
    activityScore: rollup?.activityScore ?? 0,
    saveCount: rollup?.saveCount ?? 0,
    providerClickCount: rollup?.providerClickCount ?? 0,
    offerViewCount: rollup?.offerViewCount ?? 0,
  };
}

function scoreBestValueOffer(offer: MarketplaceOffer) {
  const apr = parseMetricRange(getMetricValue(offer, ["APR"])).min ?? 99;
  const annualFee = parseMetricRange(getMetricValue(offer, ["Annual fee", "Monthly fee"])).max ?? 0;
  const transferFee = parseMetricRange(getMetricValue(offer, ["Fee", "Transfer fee"])).min ?? 99;
  const spread = parseMetricRange(getMetricValue(offer, ["Spread", "FX markup", "Conversion fee"])).min ?? 99;
  const monthlyPremium =
    parseMetricRange(getMetricValue(offer, ["Monthly premium", "Premium"])).min ?? 99;
  const tradeFee =
    parseMetricRange(getMetricValue(offer, ["ETF trades", "Custody fee", "Crypto fee"])).min ?? 99;
  const feeProfileBoost =
    offer.attributes?.feeProfile === "low"
      ? 5
      : offer.attributes?.feeProfile === "medium"
        ? 2
        : 0;

  switch (offer.category) {
    case "loans":
      return 120 - apr * 10 + offer.affiliatePriorityScore * 10;
    case "cards":
      return 90 - annualFee * 8 + feeProfileBoost + offer.affiliatePriorityScore * 8;
    case "transfers":
      return 100 - transferFee * 14 + feeProfileBoost + offer.affiliatePriorityScore * 8;
    case "exchange":
      return 100 - spread * 30 + feeProfileBoost + offer.affiliatePriorityScore * 8;
    case "insurance":
      return 95 - monthlyPremium * 3 + offer.affiliatePriorityScore * 8;
    case "investments":
      return 100 - tradeFee * 10 + feeProfileBoost + offer.affiliatePriorityScore * 8;
    default:
      return offer.affiliatePriorityScore * 10;
  }
}

function scoreRecommendedOffer(args: {
  offer: MarketplaceOffer;
  profile: UserProfile;
  preferredCategories: MarketplaceCategory[];
  preferredSubtypes: string[];
  behaviorCategories: MarketplaceCategory[];
  behaviorProviders: Set<string>;
  marketRollupMap: Map<string, OfferActivityRollup>;
  similarUserRollupMap: Map<string, OfferActivityRollup>;
  savedOfferIds: Set<string>;
  fxSignal: DashboardFxSignal | null;
  cryptoSignals: DashboardCryptoSignal[];
}) {
  const {
    offer,
    profile,
    preferredCategories,
    preferredSubtypes,
    behaviorCategories,
    behaviorProviders,
    marketRollupMap,
    similarUserRollupMap,
    savedOfferIds,
    fxSignal,
    cryptoSignals,
  } = args;

  if (savedOfferIds.has(offer.id)) {
    return -999;
  }

  const categoryIndex = preferredCategories.indexOf(offer.category);
  const categoryBoost = categoryIndex === -1 ? 0 : Math.max(0, 12 - categoryIndex * 2);
  const subtypeBoost =
    offer.attributes?.subtype && preferredSubtypes.includes(offer.attributes.subtype) ? 4 : 0;
  const behaviorBoost = behaviorCategories.includes(offer.category) ? 4 : 0;
  const providerBoost = behaviorProviders.has(offer.providerName) ? 2 : 0;
  const goalBoost =
    profile.goals.includes("lowest_fees") && offer.attributes?.feeProfile === "low"
      ? 3
      : profile.goals.includes("premium") && offer.attributes?.feeProfile === "premium"
        ? 2
        : 0;
  const marketActivity = clampScore(marketRollupMap.get(offer.id)?.activityScore ?? 0);
  const similarUserActivity = clampScore(similarUserRollupMap.get(offer.id)?.activityScore ?? 0, 20);
  const valueBoost = scoreBestValueOffer(offer) / 12;
  const recencyBoost = getFreshnessBoost(offer);
  const fxBoost =
    fxSignal && ["transfers", "exchange"].includes(offer.category)
      ? Math.min(Math.abs(fxSignal.changePct), 4)
      : 0;
  const cryptoBoost =
    cryptoSignals.length > 0 &&
    offer.category === "investments" &&
    ["crypto", "platforms"].includes(offer.attributes?.subtype ?? "")
      ? 3
      : 0;

  return (
    offer.affiliatePriorityScore * 16 +
    categoryBoost +
    subtypeBoost +
    behaviorBoost +
    providerBoost +
    goalBoost +
    valueBoost +
    recencyBoost +
    marketActivity +
    similarUserActivity +
    fxBoost +
    cryptoBoost
  );
}

export function resolveProfileMarket(homeCountry: string | null | undefined): MarketplaceMarket {
  const value = homeCountry?.toLowerCase();

  switch (value) {
    case "de":
    case "germany":
      return "de";
    case "es":
    case "spain":
      return "es";
    case "uk":
    case "gb":
    case "united kingdom":
      return "uk";
    case "fr":
    case "france":
      return "fr";
    case "it":
    case "italy":
      return "it";
    case "pt":
    case "portugal":
      return "pt";
    case "nl":
    case "netherlands":
      return "nl";
    case "international":
      return "international";
    default:
      return "eu";
  }
}

export function getBestValueToday(args: {
  offers: MarketplaceOffer[];
  market: MarketplaceMarket;
  profile: UserProfile;
  rollups: OfferActivityRollup[];
}) {
  const preferredCategories = getPreferredCategories(args.profile);
  const rollupMap = normalizeRollups(args.rollups);

  return args.offers
    .filter((offer) => matchesOfferMarket(offer, args.market))
    .filter((offer) => preferredCategories.includes(offer.category))
    .sort((left, right) => {
      const rightScore = scoreBestValueOffer(right) + (rollupMap.get(right.id)?.activityScore ?? 0);
      const leftScore = scoreBestValueOffer(left) + (rollupMap.get(left.id)?.activityScore ?? 0);
      return rightScore - leftScore;
    })
    .slice(0, 3)
    .map((offer) => getOfferRollupInsight(offer, rollupMap));
}

export function getRecommendedOffers(args: {
  offers: MarketplaceOffer[];
  profile: UserProfile;
  market: MarketplaceMarket;
  savedOffers: MarketplaceOffer[];
  watchedOffers: MarketplaceOffer[];
  marketRollups: OfferActivityRollup[];
  similarUserRollups: OfferActivityRollup[];
  fxSignal: DashboardFxSignal | null;
  cryptoSignals: DashboardCryptoSignal[];
}) {
  const preferredCategories = getPreferredCategories(args.profile);
  const preferredSubtypes = getPreferredSubtypes(args.profile);
  const behaviorCategories = getBehaviorCategories(args);
  const behaviorProviders = getBehaviorProviders(args);
  const marketRollupMap = normalizeRollups(args.marketRollups);
  const similarUserRollupMap = normalizeRollups(args.similarUserRollups);
  const savedOfferIds = new Set(args.savedOffers.map((offer) => offer.id));

  const ranked = args.offers
    .filter((offer) => matchesOfferMarket(offer, args.market))
    .sort((left, right) => {
      const rightScore = scoreRecommendedOffer({
        offer: right,
        profile: args.profile,
        preferredCategories,
        preferredSubtypes,
        behaviorCategories,
        behaviorProviders,
        marketRollupMap,
        similarUserRollupMap,
        savedOfferIds,
        fxSignal: args.fxSignal,
        cryptoSignals: args.cryptoSignals,
      });
      const leftScore = scoreRecommendedOffer({
        offer: left,
        profile: args.profile,
        preferredCategories,
        preferredSubtypes,
        behaviorCategories,
        behaviorProviders,
        marketRollupMap,
        similarUserRollupMap,
        savedOfferIds,
        fxSignal: args.fxSignal,
        cryptoSignals: args.cryptoSignals,
      });

      return rightScore - leftScore;
    })
    .slice(0, 4);

  return ranked.map((offer) => getOfferRollupInsight(offer, marketRollupMap));
}

export function getTrendingOffers(args: {
  offers: MarketplaceOffer[];
  market: MarketplaceMarket;
  rollups: OfferActivityRollup[];
}) {
  const rollupMap = normalizeRollups(args.rollups);
  const ranked = args.offers
    .filter((offer) => matchesOfferMarket(offer, args.market))
    .map((offer) => getOfferRollupInsight(offer, rollupMap))
    .sort((left, right) => {
      if (right.activityScore !== left.activityScore) {
        return right.activityScore - left.activityScore;
      }

      return right.offer.affiliatePriorityScore - left.offer.affiliatePriorityScore;
    });

  return ranked.slice(0, 4);
}

export function getPopularWithUsersLikeYou(args: {
  offers: MarketplaceOffer[];
  market: MarketplaceMarket;
  rollups: OfferActivityRollup[];
  preferredCategories: MarketplaceCategory[];
}) {
  const rollupMap = normalizeRollups(args.rollups);

  return args.offers
    .filter((offer) => matchesOfferMarket(offer, args.market))
    .filter((offer) => args.preferredCategories.includes(offer.category))
    .map((offer) => getOfferRollupInsight(offer, rollupMap))
    .sort((left, right) => {
      if (right.activityScore !== left.activityScore) {
        return right.activityScore - left.activityScore;
      }

      return right.offer.affiliatePriorityScore - left.offer.affiliatePriorityScore;
    })
    .slice(0, 3);
}

export function getTrendingProviders(args: {
  offers: MarketplaceOffer[];
  rollups: OfferActivityRollup[];
}) {
  const offersById = new Map(args.offers.map((offer) => [offer.id, offer]));
  const providerScores = new Map<string, { activityScore: number; offerIds: Set<string> }>();

  for (const rollup of args.rollups) {
    const offer = offersById.get(rollup.offerId);
    if (!offer) continue;

    const existing = providerScores.get(offer.providerName) ?? {
      activityScore: 0,
      offerIds: new Set<string>(),
    };

    existing.activityScore += rollup.activityScore;
    existing.offerIds.add(offer.id);
    providerScores.set(offer.providerName, existing);
  }

  return [...providerScores.entries()]
    .map(([providerName, value]) => ({
      providerName,
      activityScore: value.activityScore,
      offerCount: value.offerIds.size,
    }))
    .sort((left, right) => right.activityScore - left.activityScore)
    .slice(0, 4);
}

export function getCategoryMomentum(args: {
  offers: MarketplaceOffer[];
  rollups: OfferActivityRollup[];
}) {
  const offersById = new Map(args.offers.map((offer) => [offer.id, offer]));
  const categoryScores = new Map<MarketplaceCategory, number>();

  for (const rollup of args.rollups) {
    const offer = offersById.get(rollup.offerId);
    if (!offer) continue;

    categoryScores.set(
      offer.category,
      (categoryScores.get(offer.category) ?? 0) + rollup.activityScore,
    );
  }

  return [...categoryScores.entries()]
    .map(([category, activityScore]) => ({ category, activityScore }))
    .sort((left, right) => right.activityScore - left.activityScore)
    .slice(0, 4);
}

export function getInsuranceCategoryTrends(args: {
  offers: MarketplaceOffer[];
  rollups: OfferActivityRollup[];
}) {
  const offersById = new Map(args.offers.map((offer) => [offer.id, offer]));
  const subtypeScores = new Map<string, number>();

  for (const rollup of args.rollups) {
    const offer = offersById.get(rollup.offerId);

    if (!offer || offer.category !== "insurance" || !offer.attributes?.subtype) {
      continue;
    }

    subtypeScores.set(
      offer.attributes.subtype,
      (subtypeScores.get(offer.attributes.subtype) ?? 0) + rollup.activityScore,
    );
  }

  return [...subtypeScores.entries()]
    .map(([subtype, activityScore]) => ({ subtype, activityScore }))
    .sort((left, right) => right.activityScore - left.activityScore)
    .slice(0, 4);
}

export function getRisingFxOffers(args: {
  offers: MarketplaceOffer[];
  market: MarketplaceMarket;
  rollups: OfferActivityRollup[];
  fxSignal: DashboardFxSignal | null;
}) {
  const rollupMap = normalizeRollups(args.rollups);
  const fxWeight = args.fxSignal ? Math.min(Math.abs(args.fxSignal.changePct), 4) : 0;

  return args.offers
    .filter((offer) => matchesOfferMarket(offer, args.market))
    .filter((offer) => offer.category === "transfers" || offer.category === "exchange")
    .map((offer) => {
      const insight = getOfferRollupInsight(offer, rollupMap);
      return {
        ...insight,
        rankingScore: insight.activityScore + fxWeight + scoreBestValueOffer(offer) / 16,
      };
    })
    .sort((left, right) => right.rankingScore - left.rankingScore)
    .slice(0, 3)
    .map(({ rankingScore: _rankingScore, ...insight }) => insight);
}

export function getCryptoPlatformTrends(args: {
  offers: MarketplaceOffer[];
  market: MarketplaceMarket;
  rollups: OfferActivityRollup[];
  cryptoSignals: DashboardCryptoSignal[];
}) {
  const rollupMap = normalizeRollups(args.rollups);
  const cryptoWeight = args.cryptoSignals.length > 0 ? 4 : 0;

  return args.offers
    .filter((offer) => matchesOfferMarket(offer, args.market))
    .filter(
      (offer) =>
        offer.category === "investments" &&
        ["crypto", "platforms"].includes(offer.attributes?.subtype ?? ""),
    )
    .map((offer) => {
      const insight = getOfferRollupInsight(offer, rollupMap);
      return {
        ...insight,
        rankingScore: insight.activityScore + cryptoWeight + scoreBestValueOffer(offer) / 14,
      };
    })
    .sort((left, right) => right.rankingScore - left.rankingScore)
    .slice(0, 3)
    .map(({ rankingScore: _rankingScore, ...insight }) => insight);
}

export function getUserTypePreferences(userType: UserProfile["user_type"]) {
  return userTypeCategoryPreferences[userType];
}
