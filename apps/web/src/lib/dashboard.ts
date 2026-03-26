import type { MarketplaceCategory, MarketplaceMarket, MarketplaceOffer } from "@payn/types";
import type { UserProfile } from "@/lib/types";
import { matchesOfferMarket } from "@/lib/marketplace";

const userTypeCategoryPreferences: Record<UserProfile["user_type"], MarketplaceCategory[]> = {
  personal: ["cards", "loans", "transfers", "exchange"],
  freelancer: ["transfers", "cards", "exchange", "investments"],
  business: ["transfers", "cards", "investments", "insurance"],
};

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

function scoreRecommendedOffer(
  offer: MarketplaceOffer,
  categoryPreferenceOrder: MarketplaceCategory[],
) {
  const categoryIndex = categoryPreferenceOrder.indexOf(offer.category);
  const categoryBoost = categoryIndex === -1 ? 0 : Math.max(0, 6 - categoryIndex);
  const recencyBoost = new Date(offer.updatedAt).getTime() / 1_000_000_000_000;
  return offer.affiliatePriorityScore * 10 + categoryBoost + recencyBoost;
}

export function getRecommendedOffers({
  offers,
  profile,
}: {
  offers: MarketplaceOffer[];
  profile: UserProfile | null;
}) {
  if (!profile) {
    return offers.slice(0, 4);
  }

  const market = resolveProfileMarket(profile.home_country);
  const preferredCategories =
    profile.selected_categories.length > 0
      ? (profile.selected_categories as MarketplaceCategory[])
      : userTypeCategoryPreferences[profile.user_type];

  const ranked = offers
    .filter((offer) => matchesOfferMarket(offer, market))
    .filter((offer) => preferredCategories.includes(offer.category))
    .sort(
      (left, right) =>
        scoreRecommendedOffer(right, preferredCategories) -
        scoreRecommendedOffer(left, preferredCategories),
    )
    .slice(0, 4);

  if (ranked.length > 0) {
    return ranked;
  }

  return offers
    .filter((offer) => matchesOfferMarket(offer, market))
    .sort((left, right) => right.affiliatePriorityScore - left.affiliatePriorityScore)
    .slice(0, 4);
}

export function getTrendingOffers({
  offers,
  market,
}: {
  offers: MarketplaceOffer[];
  market: MarketplaceMarket;
}) {
  return offers
    .filter((offer) => matchesOfferMarket(offer, market))
    .sort((left, right) => {
      const updatedDelta =
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();

      if (updatedDelta !== 0) {
        return updatedDelta;
      }

      return right.affiliatePriorityScore - left.affiliatePriorityScore;
    })
    .slice(0, 3);
}

export function getPopularProviders({
  offers,
  market,
}: {
  offers: MarketplaceOffer[];
  market: MarketplaceMarket;
}) {
  const counts = new Map<string, number>();

  for (const offer of offers) {
    if (!matchesOfferMarket(offer, market)) {
      continue;
    }

    counts.set(offer.providerName, (counts.get(offer.providerName) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([providerName, count]) => ({ providerName, count }));
}
