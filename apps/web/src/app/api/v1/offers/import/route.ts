import type { MarketplaceCategory } from "@payn/types";
import { NextRequest, NextResponse } from "next/server";
import { runDailyOfferImport } from "@/server/offers/offer-importer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleImport(request);
}

export async function POST(request: NextRequest) {
  return handleImport(request);
}

async function handleImport(request: NextRequest) {
  const configuredSecret = process.env.OFFER_IMPORT_SECRET;
  if (configuredSecret) {
    const providedSecret =
      request.headers.get("x-payn-import-secret") ??
      request.nextUrl.searchParams.get("secret");
    if (providedSecret !== configuredSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const apply = request.nextUrl.searchParams.get("apply") === "1";
  const country = request.nextUrl.searchParams.get("country");
  const category = request.nextUrl.searchParams.get("category") as MarketplaceCategory | null;
  const result = await runDailyOfferImport({
    dryRun: !apply,
    country,
    category,
  });

  return NextResponse.json(result, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
