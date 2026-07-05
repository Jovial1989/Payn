import Link from "next/link";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { AdminOffersSeedButton } from "@/components/admin-offers-seed-button";
import { AdminOffersDeleteButton } from "@/components/admin-offers-delete-button";
import { AdminParserControls } from "@/components/admin-parser-controls";

const CATEGORIES = [
  "loans","cards","banking","transfers","exchange",
  "insurance","investments","crypto","business","budgeting","kids",
];

type Props = {
  searchParams: Promise<{
    category?: string; search?: string; monetised?: string;
    status?: string; source?: string; page?: string;
  }>;
};

export default async function AdminOffersPage({ searchParams }: Props) {
  const { category, search, monetised, status, source, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  const perPage = 50;

  const admin = createSupabaseAdminClient();

  type OfferRow = {
    id: string; slug: string; providerName: string; title: string;
    category: string; isMonetised: boolean; effectiveStatus: string;
    clicks: number; affiliateLink: string; countryCodes: string[]; dataSource: string;
  };

  let overrides: Record<string, { affiliate_url: string | null; status: string }> = {};
  let clickCounts: Record<string, number> = {};
  let dbOffers: OfferRow[] = [];
  let dbTotal = 0;
  let dbCount = 0;

  if (admin) {
    const [ovRes, clickRes, countRes] = await Promise.all([
      admin.from("admin_offer_overrides").select("offer_id, affiliate_url, status"),
      admin.from("offer_click_events").select("offer_id"),
      admin.from("product_offers").select("*", { count: "exact", head: true }),
    ]);
    overrides = Object.fromEntries((ovRes.data ?? []).map((r) => [r.offer_id, r]));
    for (const r of clickRes.data ?? []) {
      clickCounts[r.offer_id] = (clickCounts[r.offer_id] ?? 0) + 1;
    }
    dbCount = countRes.count ?? 0;

    if (source !== "static") {
      let q = admin.from("product_offers").select("*", { count: "exact" });
      if (category)              q = q.eq("category", category);
      if (status)                q = q.eq("status", status);
      if (monetised === "true")  q = q.eq("is_monetised", true);
      if (monetised === "false") q = q.eq("is_monetised", false);
      if (search) {
        q = q.or(`provider_name.ilike.%${search}%,title.ilike.%${search}%,id.ilike.%${search}%`);
      }
      const { data, count } = await q
        .order("affiliate_priority_score", { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);
      dbOffers = (data ?? []).map((o: Record<string, unknown>) => ({
        id: String(o.id),
        slug: String(o.slug ?? ""),
        providerName: String(o.provider_name),
        title: String(o.title),
        category: String(o.category),
        isMonetised: Boolean(o.is_monetised),
        effectiveStatus: String(o.status ?? "active"),
        clicks: clickCounts[String(o.id)] ?? 0,
        affiliateLink: String(o.affiliate_link ?? ""),
        countryCodes: (o.country_codes as string[]) ?? [],
        dataSource: String(o.data_source ?? "admin"),
      }));
      dbTotal = count ?? 0;
    }
  }

  // Static offers (always computed for the "static" tab)
  let staticOffers = marketplaceOffers.map((o) => ({
    id: o.id,
    slug: o.slug,
    providerName: o.providerName,
    title: o.title,
    category: o.category,
    isMonetised: Boolean(o.affiliateLink && o.linkType === "affiliate_redirect"),
    effectiveStatus: overrides[o.id]?.status ?? "active",
    clicks: clickCounts[o.id] ?? 0,
    affiliateLink: o.affiliateLink ?? "",
    countryCodes: o.countryCodes ?? [],
    dataSource: "static",
  }));
  if (category)              staticOffers = staticOffers.filter((o) => o.category === category);
  if (search) {
    const q = search.toLowerCase();
    staticOffers = staticOffers.filter(
      (o) => o.providerName.toLowerCase().includes(q) || o.title.toLowerCase().includes(q),
    );
  }
  if (monetised === "true")  staticOffers = staticOffers.filter((o) => o.isMonetised);
  if (monetised === "false") staticOffers = staticOffers.filter((o) => !o.isMonetised);
  if (status)                staticOffers = staticOffers.filter((o) => o.effectiveStatus === status);

  const showingStatic = source === "static" || dbCount === 0;
  const offers = showingStatic ? staticOffers : dbOffers;
  const total  = showingStatic ? staticOffers.length : dbTotal;
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Offers</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {total} shown · {dbCount} in DB · {marketplaceOffers.length} static
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {dbCount === 0 && (
            <AdminOffersSeedButton />
          )}
          {dbCount > 0 && (
            <AdminOffersSeedButton label="Re-sync static" />
          )}
          <Link
            href="/admin/offers/new"
            className="rounded-[10px] bg-accent-emerald px-4 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong"
          >
            + New offer
          </Link>
        </div>
      </div>

      {/* Source toggle */}
      {dbCount > 0 && (
        <div className="flex gap-2 text-sm">
          <a
            href={`/admin/offers?${new URLSearchParams({ ...(category ? { category } : {}), ...(search ? { search } : {}), ...(status ? { status } : {}), ...(monetised ? { monetised } : {}) }).toString()}`}
            className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${!showingStatic ? "bg-accent-emerald text-white" : "border border-line bg-white text-ink-secondary hover:text-ink"}`}
          >
            DB offers ({dbCount})
          </a>
          <a
            href={`/admin/offers?source=static`}
            className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${showingStatic ? "bg-accent-emerald text-white" : "border border-line bg-white text-ink-secondary hover:text-ink"}`}
          >
            Static ({marketplaceOffers.length})
          </a>
        </div>
      )}

      {/* Filters */}
      <form method="get" className="flex flex-wrap gap-2">
        {source && <input type="hidden" name="source" value={source} />}
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search provider, title, ID…"
          className="min-w-[220px] rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent-emerald/30"
        />
        <select name="category" defaultValue={category ?? ""} className="rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="status" defaultValue={status ?? ""} className="rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="needs_review">Needs review</option>
          <option value="archived">Archived</option>
        </select>
        <select name="monetised" defaultValue={monetised ?? ""} className="rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none">
          <option value="">Any monetisation</option>
          <option value="true">Monetised</option>
          <option value="false">Non-monetised</option>
        </select>
        <button type="submit" className="rounded-[10px] bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/80">
          Filter
        </button>
        <a href="/admin/offers" className="rounded-[10px] border border-line bg-white px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink">
          Reset
        </a>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-[20px] border border-line bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-surface">
              {[
                "Provider","Title","Category","Countries","Monetised","Status","Clicks","Source",""
              ].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {offers.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-ink-tertiary">
                  {dbCount === 0
                    ? "No offers in DB yet — click \"Re-sync static\" to seed from the static catalog."
                    : "No offers match your filters."}
                </td>
              </tr>
            ) : (
              offers.map((o) => (
                <tr key={o.id} className="hover:bg-bg-surface">
                  <td className="px-4 py-3 font-semibold text-ink">{o.providerName}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-ink-secondary">{o.title}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-secondary">{o.category}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-tertiary">
                    {o.countryCodes.slice(0, 4).join(", ")}{o.countryCodes.length > 4 ? ` +${o.countryCodes.length - 4}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${o.isMonetised ? "bg-accent-emerald-soft text-accent-emerald-strong" : "bg-bg-surface text-ink-tertiary"}`}>
                      {o.isMonetised ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      o.effectiveStatus === "active" ? "bg-accent-emerald-soft text-accent-emerald-strong"
                      : o.effectiveStatus === "needs_review" ? "bg-orange-50 text-orange-600"
                      : o.effectiveStatus === "archived" ? "bg-red-50 text-red-500"
                      : "bg-bg-surface text-ink-tertiary"
                    }`}>
                      {o.effectiveStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-ink">{o.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${o.dataSource === "admin" ? "bg-blue-50 text-blue-600" : "bg-bg-surface text-ink-tertiary"}`}>
                      {o.dataSource}
                    </span>
                  </td>
                  <td className="flex items-center gap-3 px-4 py-3">
                    <Link href={`/admin/offers/${o.id}`} className="text-[11px] font-semibold text-accent-emerald hover:text-accent-emerald-strong">
                      Edit →
                    </Link>
                    <AdminOffersDeleteButton offerId={o.id} providerName={o.providerName} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (DB mode only) */}
      {!showingStatic && totalPages > 1 && (
        <div className="flex items-center gap-3 text-sm">
          {page > 1 && (
            <a href={`/admin/offers?page=${page - 1}&${new URLSearchParams({ ...(category ? { category } : {}), ...(search ? { search } : {}), ...(status ? { status } : {}), ...(monetised ? { monetised } : {}) }).toString()}`}
              className="rounded-[10px] border border-line bg-white px-4 py-2 font-medium text-ink hover:bg-bg-surface">
              ← Previous
            </a>
          )}
          <span className="text-ink-tertiary">Page {page} of {totalPages} · {total} offers</span>
          {page < totalPages && (
            <a href={`/admin/offers?page=${page + 1}&${new URLSearchParams({ ...(category ? { category } : {}), ...(search ? { search } : {}), ...(status ? { status } : {}), ...(monetised ? { monetised } : {}) }).toString()}`}
              className="rounded-[10px] border border-line bg-white px-4 py-2 font-medium text-ink hover:bg-bg-surface">
              Next →
            </a>
          )}
        </div>
      )}

      {/* Manual import — add offers from a feed/CSV by hand. (Automated
          discovery + monetisation lives in Affiliate Engine.) */}
      <section className="mt-2 rounded-[20px] border border-line bg-white p-5 shadow-card">
        <h2 className="text-lg font-bold tracking-[-0.02em] text-ink">Manual import</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Pull offers from a source feed into the catalog by hand. For automated
          FinanceAds sync + AI discovery, use <Link href="/admin/financeads" className="font-semibold text-accent-emerald-strong underline-offset-2 hover:underline">Affiliate Engine</Link>.
        </p>
        <div className="mt-4">
          <AdminParserControls />
        </div>
      </section>
    </div>
  );
}
