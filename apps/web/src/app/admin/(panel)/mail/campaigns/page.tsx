import Link from "next/link";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { TEMPLATE_REGISTRY } from "@/lib/email/templates";

type EmailCampaign = {
  id: string;
  name: string;
  subject: string;
  template_id: string;
  audience: {
    countries?: string[];
    languages?: string[];
    marketing_opt_in?: boolean;
    last_active_days?: number;
  };
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  audience_size: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-bg-surface text-ink-tertiary",
  scheduled: "bg-blue-50 text-blue-600",
  sending: "bg-accent-emerald-soft text-accent-emerald-strong",
  sent: "bg-accent-emerald-soft text-accent-emerald-strong",
  failed: "bg-red-50 text-red-600",
};

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });
}

export default async function AdminMailCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const statusFilter = sp.status ?? "";

  const admin = createSupabaseAdminClient();
  let campaigns: EmailCampaign[] = [];

  if (admin) {
    let q = admin
      .from("email_campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (statusFilter) q = q.eq("status", statusFilter);
    const res = await q;
    campaigns = (res.data ?? []) as EmailCampaign[];
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Mail</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Email campaigns</h1>
        </div>
        <Link
          href="/admin/mail/campaigns/new"
          className="rounded-full bg-accent-emerald px-5 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong"
        >
          + New campaign
        </Link>
      </div>

      <div className="flex gap-1 border-b border-line">
        {[
          { href: "/admin/mail", label: "Inbox" },
          { href: "/admin/mail/compose", label: "Compose" },
          { href: "/admin/mail/campaigns", label: "Campaigns" },
          { href: "/admin/mail/templates", label: "Templates" },
        ].map((t) => (
          <Link key={t.href} href={t.href} className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink">
            {t.label}
          </Link>
        ))}
      </div>

      <form method="GET" action="/admin/mail/campaigns" className="flex gap-3">
        <select name="status" defaultValue={statusFilter} className="h-9 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-accent-emerald">
          <option value="">All statuses</option>
          {["draft", "scheduled", "sending", "sent", "failed"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="h-9 rounded-xl bg-accent-emerald px-4 text-sm font-semibold text-white hover:bg-accent-emerald-strong">Filter</button>
      </form>

      <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-surface">
              {["Name", "Template", "Audience", "Status", "Scheduled", "Sent", "Delivered", "Opened", "Clicked"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-ink-tertiary">
                  No campaigns yet. <Link href="/admin/mail/campaigns/new" className="text-accent-emerald hover:underline">Create one</Link>.
                </td>
              </tr>
            ) : (
              campaigns.map((c) => {
                const openRate = c.delivered_count > 0 ? `${Math.round((c.opened_count / c.delivered_count) * 100)}%` : "—";
                const clickRate = c.delivered_count > 0 ? `${Math.round((c.clicked_count / c.delivered_count) * 100)}%` : "—";
                const audience = c.audience as { countries?: string[]; languages?: string[]; marketing_opt_in?: boolean };
                const audienceChips = [
                  ...(audience.countries?.length ? audience.countries : ["All"]),
                  ...(audience.languages?.length ? audience.languages : []),
                  audience.marketing_opt_in ? "mkt" : null,
                ].filter(Boolean) as string[];

                return (
                  <tr key={c.id} className="hover:bg-bg-surface">
                    <td className="max-w-[180px] truncate px-4 py-3 font-medium text-ink">
                      <Link href={`/admin/mail/campaigns/${c.id}`} className="hover:text-accent-emerald">{c.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {TEMPLATE_REGISTRY[c.template_id as keyof typeof TEMPLATE_REGISTRY]?.name ?? c.template_id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {audienceChips.slice(0, 4).map((chip) => (
                          <span key={chip} className="rounded-full bg-bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-secondary">{chip}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[c.status] ?? "bg-bg-surface text-ink-tertiary"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-tertiary">{fmt(c.scheduled_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-tertiary">{fmt(c.sent_at)}</td>
                    <td className="px-4 py-3 text-ink-secondary">{c.delivered_count > 0 ? c.delivered_count.toLocaleString() : "—"}</td>
                    <td className="px-4 py-3 text-ink-secondary">{openRate}</td>
                    <td className="px-4 py-3 text-ink-secondary">{clickRate}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
