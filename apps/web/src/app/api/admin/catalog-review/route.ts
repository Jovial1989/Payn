import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { runCatalogReview } from "@/server/offers/catalog-review";

// Link checks on all offers + a bounded Gemini relevance batch + DB heals.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as { apply?: boolean };
  const apply = body.apply === true;

  try {
    const report = await runCatalogReview({ apply });
    if (
      apply &&
      (report.autoFixed.relinked > 0 || report.autoFixed.flaggedDead > 0 || report.autoFixed.removed > 0)
    ) {
      revalidateTag("catalog", {});
    }
    return NextResponse.json(report);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Catalog review failed" },
      { status: 500 },
    );
  }
}
