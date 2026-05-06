import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

async function getStats() {
  const admin = createSupabaseAdminClient();

  const totalOffers = marketplaceOffers.length;
  const monetisedOffers = marketplaceOffers.filter(
    (o) => o.linkType === "affiliate_redirect" || o.affiliateLink,
  ).length;
  const missingAffiliateLinks = marketplaceOffers.filter(
    (o) => !o.affiliateLink && !o.providerWebsiteUrl,
  ).length;

  let totalUsers = 0;
  let totalClicks = 0;
  let clicksToday = 0;
  let topClickedOffers: { offer_id: string; click_count: number }[] = [];
  let topClickedProviders: { provider_id: string; click_count: number }[] = [];

  if (admin) {
    const [userCount, clickCount, todayCount, topOffers, topProviders] = await Promise.all([
      admin.from("user_profiles").select("*", { count: "exact", head: true }),
      admin.from("offer_click_events").select("*", { count: "exact", head: true }),
      admin
        .from("offer_click_events")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      admin.rpc("admin_top_clicked_offers", { limit_n: 5 }),
      admin.rpc("admin_top_clicked_providers", { limit_n: 5 }),
    ]);
    totalUsers = userCount.count ?? 0;
    totalClicks = clickCount.count ?? 0;
    clicksToday = todayCount.count ?? 0;
    topClickedOffers = (topOffers.data ?? []) as typeof topClickedOffers;
    topClickedProviders = (topProviders.data ?? []) as typeof topClickedProviders;
  }

  return {
    totalUsers,
    totalOffers,
    monetisedOffers,
    nonMonetisedOffers: totalOffers - monetisedOffers,
    missingAffiliateLinks,
    totalClicks,
    clicksToday,
    topClickedOffers,
    topClickedProviders,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const metrics = [
    { label: "Total Users", value: stats.totalUsers },
    { label: "Total Offers", value: stats.totalOffers },
    { label: "Monetised", value: stats.monetisedOffers },
    { label: "Non-Monetised", value: stats.nonMonetisedOffers },
    { label: "Missing Links", value: stats.missingAffiliateLinks },
    { label: "Total Clicks", value: stats.totalClicks },
    { label: "Clicks Today", value: stats.clicksToday },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Overview</h1>
        <p className="mt-1 text-sm text-ink-secondary">Real-time snapshot of Payn marketplace.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-[20px] border border-line bg-white px-5 py-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">{m.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ink">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[20px] border border-line bg-white p-6 shadow-card">
          <h2 className="mb-4 text-sm font-bold text-ink">Top clicked offers</h2>
          {stats.topClickedOffers.length === 0 ? (
            <p className="text-sm text-ink-tertiary">No data yet.</p>
          ) : (
            <div className="grid gap-2">
              {stats.topClickedOffers.map((item) => (
                <div key={item.offer_id} className="flex items-center justify-between gap-3 rounded-[12px] border border-line px-4 py-2.5">
                  <span className="truncate text-sm font-medium text-ink">{item.offer_id}</span>
                  <span className="shrink-0 text-sm font-bold text-accent-emerald">{item.click_count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[20px] border border-line bg-white p-6 shadow-card">
          <h2 className="mb-4 text-sm font-bold text-ink">Top clicked providers</h2>
          {stats.topClickedProviders.length === 0 ? (
            <p className="text-sm text-ink-tertiary">No data yet.</p>
          ) : (
            <div className="grid gap-2">
              {stats.topClickedProviders.map((item) => (
                <div key={item.provider_id} className="flex items-center justify-between gap-3 rounded-[12px] border border-line px-4 py-2.5">
                  <span className="truncate text-sm font-medium text-ink">{item.provider_id}</span>
                  <span className="shrink-0 text-sm font-bold text-accent-emerald">{item.click_count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
