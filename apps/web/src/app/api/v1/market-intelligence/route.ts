import { NextRequest, NextResponse } from "next/server";
import { getMarketIntelligence } from "@/server/market/market-intelligence-service";
import {
  normalizeMarketIntelligenceAsset,
  normalizeMarketIntelligenceLocale,
  normalizeMarketIntelligenceTimeframe,
} from "@/lib/market-intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const assetId = normalizeMarketIntelligenceAsset(searchParams.get("asset"));
  const timeframe = normalizeMarketIntelligenceTimeframe(searchParams.get("timeframe"));
  const locale = normalizeMarketIntelligenceLocale(searchParams.get("locale"));
  const debug = searchParams.get("debug") === "1";

  const payload = await getMarketIntelligence({ assetId, timeframe, locale, debug });

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": debug
        ? "no-store"
        : payload.stale
        ? "public, s-maxage=300, stale-while-revalidate=1200"
        : "public, s-maxage=120, stale-while-revalidate=600",
      "X-Payn-Market-Key": `${assetId}:${timeframe}`,
    },
  });
}
