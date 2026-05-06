import Link from "next/link";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

type Props = {
  searchParams: Promise<{ category?: string; search?: string; monetised?: string; status?: string }>;
};

export default async function AdminOffersPage({ searchParams }: Props) {
  const { category, search, monetised, status } = await searchParams;
  const admin = createSupabaseAdminClient();

  let overrides: Record<string, { affiliate_url: string | null; status: string }> = {};
  let clickCounts: Record<string, number> = {};

  if (admin) {
    const [ov, clicks] = await Promise.all([
      admin.from("admin_offer_overrides").select("offer_id, affiliate_url, status"),
      admin.from("offer_click_events").select("offer_id"),
    ]);
    overrides = Object.fromEntries((ov.data ?? []).map((r) => [r.offer_id, r]));
    for (const row of clicks.data ?? []) {
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
    effectiveStatus: overrides[o.id]?.status ?? "active",
    clicks: clickCounts[o.id] ?? 0,
  }));

  if (category) offers = offers.filter((o) => o.category === category);
  if (search) {
    const q = search.toLowerCase();
    offers = offers.filter(
      (o) =>
        o.providerName.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q),
    );
  }
  if (monetised === "true") offers = offers.filter((o) => o.isMonetised);
  if (monetised === "false") offers = offers.filter((o) => !o.isMonetised);
  if (status) offers = offers.filter((o) => o.effectiveStatus === status);

  const categories = ["loans", "cards", "transfers", "exchange", "insurance", "investments"];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Offers</h1>
        <p className="mt-1 text-sm text-ink-secondary">{offers.length} offers shown</p>
      </div>

      {/* Filters */}
      <form method="get" className="flex flex-wrap gap-3">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search provider or title…"
          className="rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent-emerald/30"
        />
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          name="monetised"
          defaultValue={monetised ?? ""}
          className="rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none"
        >
          <option value="">All monetisation</option>
          <option value="true">Monetised</option>
          <option value="false">Non-monetised</option>
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="needs_review">Needs review</option>
        </select>
        <button
          type="submit"
          className="rounded-[10px] bg-accent-emerald px-4 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong"
        >
          Filter
        </button>
      </form>

      <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-surface">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Provider</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Title</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Category</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Monetised</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Clicks</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {offers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-ink-tertiary">No offers match your filters.</td>
              </tr>
            ) : (
              offers.map((o) => (
                <tr key={o.id} className="hover:bg-bg-surface">
                  <td className="px-4 py-3 font-medium text-ink">{o.providerName}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-ink-secondary">{o.title}</td>
                  <td className="px-4 py-3 text-ink-secondary">{o.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${o.isMonetised ? "bg-accent-emerald-soft text-accent-emerald-strong" : "bg-bg-surface text-ink-tertiary"}`}>
                      {o.isMonetised ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      o.effectiveStatus === "active"
                        ? "bg-accent-emerald-soft text-accent-emerald-strong"
                        : o.effectiveStatus === "needs_review"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-bg-surface text-ink-tertiary"
                    }`}>
                      {o.effectiveStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink">{o.clicks}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/offers/${o.id}`}
                      className="text-[11px] font-semibold text-accent-emerald hover:text-accent-emerald-strong"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
