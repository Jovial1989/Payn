import Link from "next/link";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

type ReviewSummary = { healthScore: number; coverage: number; deadLinks: number; gaps: number; ranAt: string | null };

function HealthBanner({ review }: { review: ReviewSummary | null }) {
  if (!review) {
    return (
      <Link
        href="/admin/financeads"
        className="flex items-center justify-between gap-4 rounded-[20px] border border-dashed border-line-strong bg-white px-6 py-5 shadow-card transition-colors hover:bg-bg-surface"
      >
        <div>
          <p className="text-sm font-bold text-ink">Catalog health score</p>
          <p className="mt-0.5 text-sm text-ink-secondary">
            No review run yet. Open the Affiliate Engine to run the first audit →
          </p>
        </div>
        <span className="text-4xl font-extrabold text-ink-tertiary">—</span>
      </Link>
    );
  }
  const s = review.healthScore;
  const color = s >= 85 ? "text-accent-emerald-strong" : s >= 65 ? "text-orange-600" : "text-red-500";
  const ring = s >= 85 ? "border-accent-emerald" : s >= 65 ? "border-orange-300" : "border-red-300";
  const ran = review.ranAt ? new Date(review.ranAt).toISOString().slice(0, 10) : "—";

  return (
    <Link
      href="/admin/financeads"
      className={`flex flex-wrap items-center justify-between gap-6 rounded-[20px] border-l-4 ${ring} border-y border-r border-line bg-white px-6 py-5 shadow-card transition-shadow hover:shadow-elevated`}
    >
      <div className="flex items-center gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
            Catalog health
          </p>
          <p className={`text-5xl font-extrabold leading-none tabular-nums ${color}`}>
            {s}
            <span className="text-lg font-bold text-ink-tertiary">/100</span>
          </p>
        </div>
        <p className="max-w-xs text-xs text-ink-tertiary">
          Relevance of every offer — links, monetisation, freshness. Auto-reviewed every 3 days.
          <span className="mt-0.5 block">Last run: {ran}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-5">
        <BannerStat label="Monetisation" value={`${review.coverage}%`} good={review.coverage >= 95} />
        <BannerStat label="Dead links" value={String(review.deadLinks)} bad={review.deadLinks > 0} />
        <BannerStat label="Gaps" value={String(review.gaps)} bad={review.gaps > 0} />
      </div>
    </Link>
  );
}

function BannerStat({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  const color = good ? "text-accent-emerald-strong" : bad ? "text-orange-600" : "text-ink";
  return (
    <div className="min-w-[88px]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">{label}</p>
      <p className={`mt-0.5 text-2xl font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

async function getStats() {
  const admin = createSupabaseAdminClient();

  let totalOffers = 0;
  let monetisedOffers = 0;
  let nonMonetisedOffers = 0;
  let missingAffiliateLinks = 0;
  let totalUsers = 0;
  let totalClicks = 0;
  let clicksToday = 0;
  let topClickedOffers: { offer_id: string; click_count: number }[] = [];
  let topClickedProviders: { provider_id: string; click_count: number }[] = [];
  let review: { healthScore: number; coverage: number; deadLinks: number; gaps: number; ranAt: string | null } | null = null;

  if (admin) {
    const [
      userCount,
      clickCount,
      todayCount,
      topOffers,
      topProviders,
      offerCount,
      monetisedCount,
      nonMonetisedCount,
      missingLinksCount,
      latestReview,
    ] = await Promise.all([
      admin.from("user_profiles").select("*", { count: "exact", head: true }),
      admin.from("offer_click_events").select("*", { count: "exact", head: true }),
      admin
        .from("offer_click_events")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      admin.rpc("admin_top_clicked_offers", { limit_n: 5 }),
      admin.rpc("admin_top_clicked_providers", { limit_n: 5 }),
      admin.from("product_offers").select("*", { count: "exact", head: true }),
      admin
        .from("product_offers")
        .select("*", { count: "exact", head: true })
        .eq("is_monetised", true),
      admin
        .from("product_offers")
        .select("*", { count: "exact", head: true })
        .eq("is_monetised", false),
      admin
        .from("product_offers")
        .select("*", { count: "exact", head: true })
        .or("affiliate_link.is.null,affiliate_link.eq."),
      // Latest catalog-review run (logged by the 3-day cron) — read the
      // health score cheaply instead of re-auditing on every dashboard load.
      admin
        .from("admin_audit_log")
        .select("metadata, created_at")
        .eq("action", "catalog_review")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    totalUsers = userCount.count ?? 0;
    totalClicks = clickCount.count ?? 0;
    clicksToday = todayCount.count ?? 0;
    topClickedOffers = (topOffers.data ?? []) as typeof topClickedOffers;
    topClickedProviders = (topProviders.data ?? []) as typeof topClickedProviders;
    totalOffers = offerCount.count ?? 0;
    monetisedOffers = monetisedCount.count ?? 0;
    nonMonetisedOffers = nonMonetisedCount.count ?? 0;
    missingAffiliateLinks = missingLinksCount.count ?? 0;
    const meta = (latestReview.data?.metadata ?? null) as
      | { healthScore?: number; coverage?: number; deadLinks?: number; gaps?: number }
      | null;
    if (meta && typeof meta.healthScore === "number") {
      review = {
        healthScore: meta.healthScore,
        coverage: Number(meta.coverage ?? 0),
        deadLinks: Number(meta.deadLinks ?? 0),
        gaps: Number(meta.gaps ?? 0),
        ranAt: latestReview.data?.created_at ?? null,
      };
    }
  }

  return {
    totalUsers,
    totalOffers,
    monetisedOffers,
    nonMonetisedOffers,
    missingAffiliateLinks,
    totalClicks,
    clicksToday,
    topClickedOffers,
    topClickedProviders,
    review,
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

      <HealthBanner review={stats.review} />

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
