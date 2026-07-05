import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { runFinanceAdsSync } from "@/server/offers/financeads-sync";

// 24 programs × (1 materials fetch) + DB writes. Comfortably inside 300s.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as { apply?: boolean };
  const apply = body.apply === true;

  try {
    const report = await runFinanceAdsSync({ apply });
    // Live links changed → drop the 1h catalog cache so the site reflects them.
    if (apply && report.offersUpdated > 0) {
      revalidateTag("catalog", {});
    }
    return NextResponse.json(report);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "FinanceAds sync failed" },
      { status: 500 },
    );
  }
}
