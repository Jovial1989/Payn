import Link from "next/link";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

type Campaign = {
  id: string;
  title: string;
  body: string;
  audience_countries: string[];
  audience_languages: string[];
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  audience_size: number | null;
  delivered_count: number;
  failed_count: number;
  created_at: string;
};

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    draft: "bg-bg-surface text-ink-secondary",
    scheduled: "bg-blue-50 text-blue-700",
    sending: "bg-amber-50 text-amber-700",
    sent: "bg-accent-emerald-soft text-accent-emerald-strong",
    cancelled: "bg-red-50 text-red-600",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] ?? "bg-bg-surface text-ink-secondary"}`}>
      {status}
    </span>
  );
}

function audienceChips(countries: string[], languages: string[]) {
  const all = [...(countries.length ? countries : ["All"]), ...(languages.length ? languages : ["All"])];
  return all.slice(0, 5).map((c) => (
    <span key={c} className="rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
      {c}
    </span>
  ));
}

export default async function AdminPushPage() {
  const admin = createSupabaseAdminClient();
  let campaigns: Campaign[] = [];

  if (admin) {
    const { data } = await admin
      .from("push_campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    campaigns = (data ?? []) as Campaign[];
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Admin</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Push Campaigns</h1>
        </div>
        <Link
          href="/admin/push/new"
          className="rounded-full bg-accent-emerald px-5 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong"
        >
          + New campaign
        </Link>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              {["Title", "Audience", "Status", "Scheduled / Sent", "Delivered", "Failed", "CTR"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-tertiary">
                  No campaigns yet — create your first one.
                </td>
              </tr>
            )}
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-bg-surface">
                <td className="px-4 py-3 font-medium text-ink">
                  <Link href={`/admin/push/${c.id}`} className="hover:text-accent-emerald-strong hover:underline">
                    {c.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">{audienceChips(c.audience_countries, c.audience_languages)}</div>
                </td>
                <td className="px-4 py-3">{statusBadge(c.status)}</td>
                <td className="px-4 py-3 text-ink-secondary">
                  {c.sent_at
                    ? new Date(c.sent_at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })
                    : c.scheduled_at
                    ? new Date(c.scheduled_at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })
                    : "—"}
                </td>
                <td className="px-4 py-3 text-ink">{c.delivered_count.toLocaleString()}</td>
                <td className="px-4 py-3 text-ink-secondary">{c.failed_count.toLocaleString()}</td>
                <td className="px-4 py-3 text-ink-tertiary">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
