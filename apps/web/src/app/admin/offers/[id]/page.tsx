import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { AdminOfferEditForm } from "@/components/admin-offer-edit-form";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOfferDetailPage({ params }: Props) {
  const { id } = await params;
  const offer = marketplaceOffers.find((o) => o.id === id || o.slug === id);
  if (!offer) notFound();

  const admin = createSupabaseAdminClient();
  let override: { affiliate_url: string | null; status: string; notes: string | null } | null = null;
  let recentClicks: { id: string; country: string; language: string; device_type: string; source_page: string; is_monetised: boolean; created_at: string }[] = [];

  if (admin) {
    const [ovResult, clickResult] = await Promise.all([
      admin.from("admin_offer_overrides").select("*").eq("offer_id", id).maybeSingle(),
      admin
        .from("offer_click_events")
        .select("id, country, language, device_type, source_page, is_monetised, created_at")
        .eq("offer_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    override = ovResult.data;
    recentClicks = (clickResult.data ?? []) as typeof recentClicks;
  }

  return (
    <div className="grid gap-6">
      <div>
        <a href="/admin/offers" className="text-sm text-accent-emerald hover:text-accent-emerald-strong">
          ← Offers
        </a>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-ink">
          {offer.providerName} · {offer.title}
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          {offer.category} · <span className="font-mono text-xs">{offer.id}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AdminOfferEditForm offerId={offer.id} override={override} />

        <div className="grid gap-4 self-start">
          <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
            <h2 className="mb-3 text-sm font-bold text-ink">Offer details</h2>
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-tertiary">Link type</dt>
                <dd className="font-medium text-ink">{offer.linkType}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-tertiary">Affiliate link</dt>
                <dd className="max-w-[180px] truncate font-medium text-ink">{offer.affiliateLink ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-tertiary">Markets</dt>
                <dd className="font-medium text-ink">{offer.markets?.join(", ") ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
            <h2 className="mb-3 text-sm font-bold text-ink">Recent clicks</h2>
            {recentClicks.length === 0 ? (
              <p className="text-sm text-ink-tertiary">No clicks yet.</p>
            ) : (
              <div className="grid gap-2">
                {recentClicks.map((c) => (
                  <div key={c.id} className="rounded-[10px] bg-bg-surface px-3 py-2 text-xs">
                    <div className="flex gap-2 text-ink-tertiary">
                      <span>{c.country}</span>
                      <span>·</span>
                      <span>{c.device_type}</span>
                      <span>·</span>
                      <span>{c.source_page}</span>
                    </div>
                    <p className="mt-0.5 text-ink-secondary">{c.created_at.slice(0, 16).replace("T", " ")}</p>
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
