import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

export async function GET(request: NextRequest) {
  const admin = createSupabaseAdminClient();
  const { searchParams } = request.nextUrl;

  const category = searchParams.get("category") ?? "";
  const search = searchParams.get("search") ?? "";
  const monetised = searchParams.get("monetised");
  const status = searchParams.get("status") ?? "";

  let overrides: Record<string, { affiliate_url: string | null; status: string; notes: string | null }> = {};
  let clickCounts: Record<string, number> = {};

  if (admin) {
    const { data: overrideRows } = await admin.from("admin_offer_overrides").select("*");
    overrides = Object.fromEntries(
      (overrideRows ?? []).map((r) => [r.offer_id, r]),
    );

    const { data: clickRows } = await admin
      .from("offer_click_events")
      .select("offer_id");
    for (const row of clickRows ?? []) {
      clickCounts[row.offer_id] = (clickCounts[row.offer_id] ?? 0) + 1;
    }
  }

  let offers = marketplaceOffers.map((o) => ({
    id: o.id,
    slug: o.slug,
    providerName: o.providerName,
    title: o.title,
    category: o.category,
    isMonetised: Boolean(o.affiliateLink || o.linkType === "affiliate_redirect"),
    affiliateLink: o.affiliateLink ?? o.providerWebsiteUrl ?? null,
    markets: o.markets ?? [],
    override: overrides[o.id] ?? null,
    clicks: clickCounts[o.id] ?? 0,
    effectiveStatus: overrides[o.id]?.status ?? "active",
  }));

  if (category) offers = offers.filter((o) => o.category === category);
  if (search) {
    const q = search.toLowerCase();
    offers = offers.filter(
      (o) =>
        o.providerName.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        o.id.includes(q),
    );
  }
  if (monetised === "true") offers = offers.filter((o) => o.isMonetised);
  if (monetised === "false") offers = offers.filter((o) => !o.isMonetised);
  if (status) offers = offers.filter((o) => o.effectiveStatus === status);

  return NextResponse.json({ offers, total: offers.length });
}
