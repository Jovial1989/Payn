import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { env } from "@/lib/env";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { runFinanceAdsSync } from "@/server/offers/financeads-sync";

// Daily job: re-pull every partner's tracking link and re-assert monetised
// flags so catalog links always match what FinanceAds currently serves.
// Wire in vercel.json:  { "crons": [{ "path": "/api/cron/financeads-sync", "schedule": "0 5 * * *" }] }
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** /api/cron/* is outside the admin middleware guard, so auth is enforced here. */
async function authorize(request: Request): Promise<boolean> {
  const auth = request.headers.get("authorization") ?? "";
  // Project convention (matches /api/v1/cron/check-alerts): Vercel cron sends
  // `Authorization: Bearer ${CRON_SECRET}`, and CRON_SECRET === ADMIN_API_TOKEN
  // in this project's env, so accept either.
  if (env.adminApiToken && auth === `Bearer ${env.adminApiToken}`) return true;
  if (env.cronSecret && auth === `Bearer ${env.cronSecret}`) return true;
  // Fallback: a valid admin API token / session also authorises a manual run.
  const denied = await checkAdminToken(request);
  return denied === null;
}

export async function GET(request: Request): Promise<NextResponse> {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const report = await runFinanceAdsSync({ apply: true });
    if (report.offersUpdated > 0) revalidateTag("catalog", {});
    return NextResponse.json({
      ok: true,
      programsTotal: report.programsTotal,
      matchedPrograms: report.matchedPrograms,
      offersUpdated: report.offersUpdated,
      durationMs: report.durationMs,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "cron sync failed" },
      { status: 500 },
    );
  }
}
