import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { AdminOfferFullForm, type OfferFormData } from "@/components/admin-offer-full-form";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOfferDetailPage({ params }: Props) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  let offerData: OfferFormData | null = null;
  let recentClicks: {
    id: string; country: string; language: string;
    device_type: string; source_page: string; is_monetised: boolean; created_at: string;
  }[] = [];
  let clickTotal = 0;
  let dataSource = "static";

  if (admin) {
    const [dbRes, clicksRes, countRes] = await Promise.all([
      admin.from("marketplace_offers").select("*").eq("id", id).maybeSingle(),
      admin
        .from("offer_click_events")
        .select("id, country, language, device_type, source_page, is_monetised, created_at")
        .eq("offer_id", id)
        .order("created_at", { ascending: false })
        .limit(25),
      admin
        .from("offer_click_events")
        .select("*", { count: "exact", head: true })
        .eq("offer_id", id),
    ]);

    recentClicks = (clicksRes.data ?? []) as typeof recentClicks;
    clickTotal = countRes.count ?? 0;

    if (dbRes.data) {
      const o = dbRes.data;
      offerData = {
        id: o.id,
        slug: o.slug,
        provider_name: o.provider_name,
        provider_mark: o.provider_mark,
        provider_website_url: o.provider_website_url,
        title: o.title,
        subtitle: o.subtitle,
        category: o.category,
        country_codes: o.country_codes,
        affiliate_link: o.affiliate_link,
        link_type: o.link_type,
        affiliate_priority_score: o.affiliate_priority_score,
        is_monetised: o.is_monetised,
        status: o.status,
        is_featured: o.is_featured,
        best_for: o.best_for,
        tags: o.tags,
        notes: o.notes,
        attributes: o.attributes,
        metrics: o.metrics,
        data_source: o.data_source,
      };
      dataSource = o.data_source ?? "admin";
    }
  }

  if (!offerData) {
    // Fallback to static offer
    const staticOffer = marketplaceOffers.find((o) => o.id === id || o.slug === id);
    if (!staticOffer) notFound();

    offerData = {
      id: staticOffer.id,
      slug: staticOffer.slug,
      provider_name: staticOffer.providerName,
      provider_mark: staticOffer.providerMark,
      provider_website_url: staticOffer.providerWebsiteUrl,
      title: staticOffer.title,
      subtitle: staticOffer.subtitle,
      category: staticOffer.category,
      country_codes: staticOffer.countryCodes,
      affiliate_link: staticOffer.affiliateLink ?? "",
      link_type: staticOffer.linkType,
      affiliate_priority_score: staticOffer.affiliatePriorityScore,
      is_monetised: Boolean(staticOffer.affiliateLink),
      status: "active",
      is_featured: false,
      best_for: staticOffer.bestFor ?? [],
      tags: [],
      notes: "",
      attributes: staticOffer.attributes as Record<string, unknown> ?? {},
      metrics: staticOffer.metrics ?? [],
      data_source: "static",
    };
    dataSource = "static";
  }

  const monetisedClicks = recentClicks.filter((c) => c.is_monetised).length;
  const mobileClicks = recentClicks.filter((c) => c.device_type === "mobile").length;

  return (
    <div className="grid gap-6">
      {/* Breadcrumb */}
      <div>
        <a href="/admin/offers" className="text-sm text-accent-emerald hover:text-accent-emerald-strong">
          ← All offers
        </a>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">
            {offerData.provider_name} · {offerData.title}
          </h1>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            dataSource === "admin" ? "bg-blue-50 text-blue-600" : "bg-bg-surface text-ink-tertiary"
          }`}>
            {dataSource}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-tertiary">
          {offerData.category} · <span className="font-mono text-xs">{offerData.id}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Full edit form */}
        <AdminOfferFullForm offer={offerData} mode="edit" />

        {/* Stats sidebar */}
        <div className="grid gap-4 self-start">
          {/* Click summary */}
          <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
            <h2 className="mb-4 text-sm font-bold text-ink">Click analytics</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total clicks", value: clickTotal.toLocaleString() },
                { label: "Recent (25)", value: recentClicks.length },
                { label: "Monetised", value: monetisedClicks },
                { label: "Mobile", value: `${mobileClicks} / ${recentClicks.length}` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-bg-surface p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">{label}</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-ink">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent clicks */}
          <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
            <h2 className="mb-3 text-sm font-bold text-ink">Recent clicks</h2>
            {recentClicks.length === 0 ? (
              <p className="text-sm text-ink-tertiary">No clicks yet.</p>
            ) : (
              <div className="grid gap-2">
                {recentClicks.map((c) => (
                  <div key={c.id} className="rounded-[10px] bg-bg-surface px-3 py-2 text-xs">
                    <div className="flex flex-wrap gap-x-2 text-ink-tertiary">
                      <span className="font-semibold text-ink">{c.country || "?"}</span>
                      <span>{c.device_type}</span>
                      {c.is_monetised && (
                        <span className="font-semibold text-accent-emerald-strong">💰</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-ink-tertiary">{c.created_at.slice(0, 16).replace("T", " ")}</p>
                    {c.source_page && (
                      <p className="mt-0.5 truncate text-ink-tertiary">{c.source_page}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
