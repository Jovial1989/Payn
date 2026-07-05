/* Run once in Supabase Dashboard SQL editor:
create table if not exists public.featured_banners (
  id uuid default gen_random_uuid() primary key,
  offer_slug text not null,
  position smallint not null default 0,
  is_manual boolean not null default false,
  reason text,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);
*/

import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";
import { selectFeaturedBannerOffers } from "@/lib/featured-banners-engine";
import { revalidatePath } from "next/cache";

type FeaturedBannerRow = {
  id: string;
  offer_slug: string;
  position: number;
  is_manual: boolean;
  reason: string | null;
  active: boolean;
  expires_at: string | null;
  created_at: string;
};

async function rerunAutoSelection() {
  "use server";
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  await admin.from("featured_banners").delete().eq("is_manual", false);

  const offers = await listMarketplaceOffers();
  const selected = selectFeaturedBannerOffers(offers);

  if (selected.length > 0) {
    await admin.from("featured_banners").insert(
      selected.map((offer, i) => ({
        offer_slug: offer.slug,
        position: i,
        is_manual: false,
        reason: `Auto-selected: ${offer.providerName} · ${offer.category}`,
        active: true,
      })),
    );
  }

  revalidatePath("/admin/featured");
}

async function removeRow(id: string) {
  "use server";
  const admin = createSupabaseAdminClient();
  if (!admin) return;
  await admin.from("featured_banners").update({ active: false }).eq("id", id);
  revalidatePath("/admin/featured");
}

async function pinManualOverride(formData: FormData) {
  "use server";
  const slug = (formData.get("slug") as string | null)?.trim();
  if (!slug) return;
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  const { data: existing } = await admin
    .from("featured_banners")
    .select("id")
    .eq("offer_slug", slug)
    .eq("is_manual", true)
    .single();

  if (existing) {
    await admin
      .from("featured_banners")
      .update({ active: true })
      .eq("id", existing.id);
  } else {
    await admin.from("featured_banners").insert({
      offer_slug: slug,
      position: 0,
      is_manual: true,
      reason: "Manual override",
      active: true,
    });
  }

  revalidatePath("/admin/featured");
}

const SETUP_SQL = `create table if not exists public.featured_banners (
  id uuid default gen_random_uuid() primary key,
  offer_slug text not null,
  position smallint not null default 0,
  is_manual boolean not null default false,
  reason text,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);`;

export default async function AdminFeaturedPage() {
  const admin = createSupabaseAdminClient();
  let rows: FeaturedBannerRow[] = [];
  let tableReady = false;

  if (admin) {
    const { data, error } = await admin
      .from("featured_banners")
      .select("id, offer_slug, position, is_manual, reason, active, expires_at, created_at")
      .order("is_manual", { ascending: false })
      .order("position", { ascending: true });

    if (!error) {
      tableReady = true;
      rows = (data ?? []) as FeaturedBannerRow[];
    }
  }

  const activeRows = rows.filter((r) => r.active);

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Featured Banners</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Controls which offers appear in the homepage featured carousel ·{" "}
            {activeRows.length} active
          </p>
        </div>
        <form action={rerunAutoSelection}>
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink shadow-subtle transition-colors hover:bg-bg-surface hover:text-ink"
          >
            Re-run auto-selection
          </button>
        </form>
      </div>

      {/* Setup notice */}
      {!tableReady && (
        <div className="rounded-2xl border border-line bg-white px-8 py-8 shadow-subtle">
          <p className="mb-3 text-sm font-semibold text-ink">Table not yet created</p>
          <p className="mb-4 text-sm text-ink-secondary">
            Run the following SQL once in the Supabase Dashboard SQL editor, then
            refresh this page.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-bg-surface p-4 font-mono text-xs text-ink-secondary">
            {SETUP_SQL}
          </pre>
        </div>
      )}

      {/* Add manual override */}
      {tableReady && (
        <div className="rounded-2xl border border-line bg-white px-6 py-5 shadow-subtle">
          <p className="mb-3 text-sm font-semibold text-ink">Pin manual override</p>
          <form action={pinManualOverride} className="flex items-center gap-3">
            <input
              name="slug"
              required
              placeholder="offer-slug (e.g. revolut-metal)"
              className="h-9 flex-1 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink placeholder:text-ink-tertiary focus:border-accent-emerald focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-xl bg-accent-emerald px-4 text-sm font-semibold text-white hover:bg-accent-emerald-strong"
            >
              Pin
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      {tableReady && activeRows.length === 0 && (
        <div className="rounded-2xl border border-line bg-white px-8 py-14 text-center text-sm text-ink-secondary shadow-subtle">
          No active featured banners. Use{" "}
          <span className="font-semibold text-ink">Re-run auto-selection</span> to
          populate automatically.
        </div>
      )}

      {tableReady && activeRows.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-subtle">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-surface text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
                <th className="px-4 py-3">Offer slug</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {activeRows.map((row) => (
                <tr key={row.id} className="hover:bg-bg-surface/50">
                  <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs font-medium text-ink">
                    {row.offer_slug}
                  </td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-ink-secondary">
                    {row.reason ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        row.is_manual
                          ? "bg-accent-blue text-accent-blue-text"
                          : "bg-bg-surface text-ink-tertiary"
                      }`}
                    >
                      {row.is_manual ? "Manual" : "Auto"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-tertiary">{row.position}</td>
                  <td className="px-4 py-3 text-ink-tertiary">
                    {new Date(row.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={removeRow.bind(null, row.id)}>
                      <button
                        type="submit"
                        className="text-[13px] font-semibold text-ink-tertiary transition-colors hover:text-red-500"
                      >
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
