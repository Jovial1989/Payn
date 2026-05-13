import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { TEMPLATE_REGISTRY } from "@/lib/email/templates";
import { AdminMailCampaignActions } from "@/components/admin-mail-campaign-actions";

type EmailCampaign = {
  id: string;
  name: string;
  subject: string;
  preheader: string | null;
  template_id: string;
  audience: Record<string, unknown>;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  audience_size: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  failed_count: number;
  created_at: string;
};

type EmailMessage = {
  id: string;
  to_address: string;
  subject: string;
  status: string;
  open_count: number;
  click_count: number;
  sent_at: string | null;
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
  return new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="mt-0.5 text-sm text-ink-secondary">{sub}</p>}
    </div>
  );
}

export default async function AdminMailCampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const page = Math.max(0, parseInt(sp.page ?? "0", 10));
  const limit = 50;

  const admin = createSupabaseAdminClient();
  if (!admin) return <p className="p-8 text-sm text-ink-secondary">Admin client not configured.</p>;

  const [campRes, msgsRes] = await Promise.all([
    admin.from("email_campaigns").select("*").eq("id", id).single<EmailCampaign>(),
    admin.from("email_messages")
      .select("id,to_address,subject,status,open_count,click_count,sent_at")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false })
      .range(page * limit, page * limit + limit - 1),
  ]);

  if (!campRes.data) return notFound();
  const c = campRes.data;
  const messages = (msgsRes.data ?? []) as EmailMessage[];
  const templateName = TEMPLATE_REGISTRY[c.template_id as keyof typeof TEMPLATE_REGISTRY]?.name ?? c.template_id;
  const openRate = c.delivered_count > 0 ? `${Math.round((c.opened_count / c.delivered_count) * 100)}%` : "—";
  const clickRate = c.delivered_count > 0 ? `${Math.round((c.clicked_count / c.delivered_count) * 100)}%` : "—";

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/mail/campaigns" className="text-xs font-medium text-ink-tertiary hover:text-ink">← Campaigns</Link>
          <h1 className="mt-1 text-2xl font-bold text-ink">{c.name}</h1>
          <p className="mt-1 text-sm text-ink-secondary">{c.subject}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[c.status] ?? "bg-bg-surface text-ink-tertiary"}`}>{c.status}</span>
            <span className="text-xs text-ink-tertiary">Template: {templateName}</span>
            {c.scheduled_at && <span className="text-xs text-ink-tertiary">Scheduled: {fmt(c.scheduled_at)}</span>}
            {c.sent_at && <span className="text-xs text-ink-tertiary">Sent: {fmt(c.sent_at)}</span>}
          </div>
        </div>
        <AdminMailCampaignActions campaign={{ id: c.id, status: c.status }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Audience" value={c.audience_size} />
        <StatCard label="Delivered" value={c.delivered_count} />
        <StatCard label="Opened" value={c.opened_count} sub={openRate} />
        <StatCard label="Clicked" value={c.clicked_count} sub={clickRate} />
        <StatCard label="Bounced" value={c.bounced_count} />
        <StatCard label="Unsubscribed" value={c.unsubscribed_count} />
      </div>

      {/* Message list */}
      <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
        <div className="border-b border-line px-5 py-3">
          <h2 className="text-sm font-bold text-ink">Messages ({messages.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-surface">
              {["To", "Status", "Opened", "Clicked", "Sent"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {messages.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-tertiary">No messages yet.</td></tr>
            ) : (
              messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-bg-surface">
                  <td className="px-4 py-3">
                    <Link href={`/admin/mail/${msg.id}`} className="text-ink hover:text-accent-emerald">{msg.to_address}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[msg.status] ?? "bg-bg-surface text-ink-tertiary"}`}>{msg.status}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{msg.open_count > 0 ? msg.open_count : "—"}</td>
                  <td className="px-4 py-3 text-ink-secondary">{msg.click_count > 0 ? msg.click_count : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-tertiary">{fmt(msg.sent_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
