import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { env } from "@/lib/env";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { runCatalogReview } from "@/server/offers/catalog-review";
import { countRecentDiscoveries, runOfferDiscovery } from "@/server/offers/offer-discovery-engine";

// Every 3 days: deep relevance + monetisation audit, then research a few new
// offers — capped to 1–2 net-new per rolling 7-day window.
// vercel.json:  { "path": "/api/cron/catalog-review", "schedule": "0 6 */3 * *" }
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const WEEKLY_NEW_OFFER_CAP = 2;

async function authorize(request: Request): Promise<boolean> {
  const auth = request.headers.get("authorization") ?? "";
  if (env.adminApiToken && auth === `Bearer ${env.adminApiToken}`) return true;
  if (env.cronSecret && auth === `Bearer ${env.cronSecret}`) return true;
  const denied = await checkAdminToken(request);
  return denied === null;
}

export async function GET(request: Request): Promise<NextResponse> {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // 1) Deep audit + auto-heal (links, monetisation, relevance).
    const review = await runCatalogReview({ apply: true });

    // 2) Discovery, throttled to the weekly quota.
    const recent = await countRecentDiscoveries(7);
    const maxNew = Math.max(0, WEEKLY_NEW_OFFER_CAP - recent);
    const discovery =
      maxNew > 0
        ? await runOfferDiscovery({ apply: true, mode: "market", maxNew })
        : null;

    if (
      review.autoFixed.relinked > 0 ||
      review.autoFixed.flaggedDead > 0 ||
      (discovery && discovery.published > 0)
    ) {
      revalidateTag("catalog", {});
    }

    return NextResponse.json({
      ok: true,
      healthScore: review.healthScore,
      monetizationCoveragePct: review.monetizationCoveragePct,
      deadLinks: review.totals.deadLinks,
      monetizationGaps: review.totals.monetizationGaps,
      relinked: review.autoFixed.relinked,
      flaggedDead: review.autoFixed.flaggedDead,
      newOffersAddedThisWeek: recent + (discovery?.published ?? 0),
      newOffersThisRun: discovery?.published ?? 0,
      weeklyCap: WEEKLY_NEW_OFFER_CAP,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "cron review failed" },
      { status: 500 },
    );
  }
}
