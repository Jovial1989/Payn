import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

// GET /api/admin/push/offers?q=wise&limit=40
// Searches the full static + DB-merged offer catalog for the push screen picker.
// We search the in-process static catalog (which is always complete) rather
// than querying Supabase — the Supabase table only holds offers added via the
// admin panel; the canonical set lives in the TypeScript catalog.
export async function GET(request: Request) {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const limit = Math.min(Number(searchParams.get("limit") ?? "40"), 200);

  const all = marketplaceOffers;

  const filtered = q
    ? all.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.providerName.toLowerCase().includes(q) ||
          o.slug.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q),
      )
    : all;

  const sorted = [...filtered].sort(
    (a, b) => (b.affiliatePriorityScore ?? 0) - (a.affiliatePriorityScore ?? 0),
  );

  const result = sorted.slice(0, limit).map((o) => ({
    id: o.id,
    slug: o.slug,
    title: o.title,
    provider_name: o.providerName,
    category: o.category,
  }));

  return NextResponse.json(result);
}
