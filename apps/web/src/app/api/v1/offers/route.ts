import type { MarketplaceCategory } from "@payn/types";
import { NextRequest, NextResponse } from "next/server";
import { listProductOffers } from "@/server/offers/offer-importer";

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country");
  const category = request.nextUrl.searchParams.get("category") as MarketplaceCategory | null;

  const offers = await listProductOffers({ country, category });

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      country,
      category,
      count: offers.length,
      offers: offers.map((offer) => ({
        ...offer,
        flags: {
          monetised: Boolean(offer.attributes?.monetized || offer.attributes?.affiliate),
          informational: Boolean(offer.attributes?.informational),
          estimated: Boolean(offer.attributes?.informational),
        },
        ui: {
          label: offer.attributes?.informational ? "Market data" : "Best option",
          cta: offer.attributes?.informational ? "View provider" : "Open provider",
          lastUpdated: offer.attributes?.lastCheckedAt ?? offer.updatedAt,
        },
      })),
      stats: {
        monetised: offers.filter((offer) => offer.attributes?.monetized || offer.attributes?.affiliate).length,
        informational: offers.filter((offer) => offer.attributes?.informational).length,
      },
    },
    {
      headers: {
        "cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  );
}
