import Link from "next/link";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

type HighlightRow = {
  id: string;
  title: string;
  kind: string;
  country: string | null;
  is_active: boolean;
  published_at: string;
  expires_at: string | null;
};

const KIND_LABELS: Record<string, string> = {
  rate_change:    "Rate change",
  new_launch:     "New launch",
  new_provider:   "New provider",
  feature_update: "Feature update",
};

export default async function AdminHighlightsPage() {
  const admin = createSupabaseAdminClient();
  let rows: HighlightRow[] = [];

  if (admin) {
    const { data } = await admin
      .from("home_highlights")
      .select("id, title, kind, country, is_active, published_at, expires_at")
      .order("published_at", { ascending: false });
    rows = (data ?? []) as HighlightRow[];
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Highlights</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Homepage "What&apos;s new" feed · {rows.length} total
          </p>
        </div>
        <Link
          href="/admin/highlights/new"
          className="inline-flex h-9 items-center rounded-xl bg-accent-emerald px-4 text-sm font-semibold text-white hover:bg-accent-emerald-strong"
        >
          + New highlight
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white px-8 py-14 text-center text-sm text-ink-secondary">
          No highlights yet.{" "}
          <Link href="/admin/highlights/new" className="font-semibold text-accent-emerald hover:underline">
            Create the first one →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-subtle">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-surface text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Kind</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((h) => (
                <tr key={h.id} className="hover:bg-bg-surface/50">
                  <td className="max-w-[240px] truncate px-4 py-3 font-medium text-ink">{h.title}</td>
                  <td className="px-4 py-3 text-ink-secondary">{KIND_LABELS[h.kind] ?? h.kind}</td>
                  <td className="px-4 py-3 text-ink-secondary">{h.country ?? "All"}</td>
                  <td className="px-4 py-3 text-ink-tertiary">
                    {new Date(h.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-ink-tertiary">
                    {h.expires_at
                      ? new Date(h.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        h.is_active
                          ? "bg-accent-emerald-soft text-accent-emerald-strong"
                          : "bg-bg-surface text-ink-tertiary"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${h.is_active ? "bg-accent-emerald" : "bg-ink-tertiary"}`} />
                      {h.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/highlights/${h.id}`}
                      className="text-[13px] font-semibold text-accent-emerald hover:text-accent-emerald-strong"
                    >
                      Edit
                    </Link>
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
