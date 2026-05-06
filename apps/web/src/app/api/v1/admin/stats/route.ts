import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

export async function GET() {
  const admin = createSupabaseAdminClient();

  const totalOffers = marketplaceOffers.length;
  const monetisedOffers = marketplaceOffers.filter(
    (o) => o.linkType === "affiliate_redirect" || o.affiliateLink,
  ).length;
  const nonMonetisedOffers = totalOffers - monetisedOffers;
  const missingAffiliateLinks = marketplaceOffers.filter(
    (o) => !o.affiliateLink && !o.providerWebsiteUrl,
  ).length;

  let totalUsers = 0;
  let totalClicks = 0;
  let clicksToday = 0;
  let topClickedOffers: { offer_id: string; click_count: number }[] = [];
  let topClickedProviders: { provider_id: string; click_count: number }[] = [];

  if (admin) {
    const { count: userCount } = await admin
      .from("user_profiles")
      .select("*", { count: "exact", head: true });
    totalUsers = userCount ?? 0;

    const { count: clickCount } = await admin
      .from("offer_click_events")
      .select("*", { count: "exact", head: true });
    totalClicks = clickCount ?? 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: todayCount } = await admin
      .from("offer_click_events")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString());
    clicksToday = todayCount ?? 0;

    const { data: topOffers } = await admin.rpc("admin_top_clicked_offers", { limit_n: 5 });
    topClickedOffers = (topOffers ?? []) as typeof topClickedOffers;

    const { data: topProviders } = await admin.rpc("admin_top_clicked_providers", { limit_n: 5 });
    topClickedProviders = (topProviders ?? []) as typeof topClickedProviders;
  }

  return NextResponse.json({
    totalUsers,
    totalOffers,
    monetisedOffers,
    nonMonetisedOffers,
    missingAffiliateLinks,
    totalClicks,
    clicksToday,
    topClickedOffers,
    topClickedProviders,
  });
}
