// GET /api/v1/featured-banners
// Returns: { offers: MarketplaceOffer[], source: 'db' | 'fallback' }
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";
import { selectFeaturedBannerOffers } from "@/lib/featured-banners-engine";

export const revalidate = 300;

type FeaturedBannerRow = {
  offer_slug: string;
  is_manual: boolean;
  position: number;
};

export async function GET() {
  const admin = createSupabaseAdminClient();
  const allOffers = await listMarketplaceOffers();
  const offersBySlug = new Map(allOffers.map((o) => [o.slug, o]));

  if (admin) {
    const { data, error } = await admin
      .from("featured_banners")
      .select("offer_slug, is_manual, position")
      .eq("active", true)
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
      .order("is_manual", { ascending: false })
      .order("position", { ascending: true });

    if (!error && data && data.length > 0) {
      const rows = data as FeaturedBannerRow[];
      const offers = rows
        .map((row) => offersBySlug.get(row.offer_slug))
        .filter((o): o is NonNullable<typeof o> => o != null);

      if (offers.length > 0) {
        return NextResponse.json({ offers, source: "db" });
      }
    }
  }

  // Fallback: run engine directly
  const fallback = selectFeaturedBannerOffers(allOffers);
  return NextResponse.json({ offers: fallback, source: "fallback" });
}
