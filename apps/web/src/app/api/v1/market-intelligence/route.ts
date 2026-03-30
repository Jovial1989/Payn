import { NextRequest, NextResponse } from "next/server";
import { getMarketIntelligence } from "@/server/market/market-intelligence-service";
import {
  normalizeMarketIntelligenceAsset,
  normalizeMarketIntelligenceLocale,
  normalizeMarketIntelligenceTimeframe,
} from "@/lib/market-intelligence";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const assetId = normalizeMarketIntelligenceAsset(searchParams.get("asset"));
  const timeframe = normalizeMarketIntelligenceTimeframe(searchParams.get("timeframe"));
  const locale = normalizeMarketIntelligenceLocale(searchParams.get("locale"));

  const payload = await getMarketIntelligence({ assetId, timeframe, locale });

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": payload.stale
        ? "public, s-maxage=300, stale-while-revalidate=1200"
        : "public, s-maxage=120, stale-while-revalidate=600",
    },
  });
}

