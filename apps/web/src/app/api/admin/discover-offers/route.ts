import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import type { MarketplaceCategory } from "@payn/types";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { runOfferDiscovery } from "@/server/offers/offer-discovery-engine";

// Gemini calls + link validation per candidate. Capped to MAX_PER_RUN inside
// the engine to stay under the ceiling.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const VALID_CATEGORIES = new Set<string>([
  "loans", "cards", "banking", "transfers", "exchange", "insurance",
  "investments", "crypto", "business", "budgeting", "kids", "savings",
  "trading", "bnpl", "debit", "remittance", "travel", "cashback",
  "wallets", "payroll", "tax", "expense", "neobanks",
]);

export async function POST(request: Request): Promise<NextResponse> {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as {
    apply?: boolean;
    mode?: "programs" | "market";
    categories?: string[];
    country?: string;
  };

  const apply = body.apply === true;
  const mode = body.mode === "market" ? "market" : "programs";
  const categories = Array.isArray(body.categories)
    ? (body.categories.filter((c) => VALID_CATEGORIES.has(c)) as MarketplaceCategory[])
    : undefined;
  const country =
    typeof body.country === "string" ? body.country.toUpperCase().slice(0, 14) : undefined;

  try {
    const report = await runOfferDiscovery({ apply, mode, categories, country });
    if (apply && report.published > 0) {
      revalidateTag("catalog", {});
    }
    return NextResponse.json(report);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Offer discovery failed" },
      { status: 500 },
    );
  }
}
