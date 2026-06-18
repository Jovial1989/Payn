import Link from "next/link";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { TEMPLATE_REGISTRY } from "@/lib/email/templates";

type EmailMessage = {
  id: string;
  to_address: string;
  subject: string;
  template_id: string | null;
  campaign_id: string | null;
  status: string;
  open_count: number;
  click_count: number;
  sent_at: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  queued: "bg-bg-surface text-ink-tertiary",
  sent: "bg-blue-50 text-blue-600",
  delivered: "bg-accent-emerald-soft text-accent-emerald-strong",
  bounced: "bg-red-50 text-red-600",
  complained: "bg-red-50 text-red-600",
  failed: "bg-red-50 text-red-600",
};

function statusLabel(msg: EmailMessage) {
  if (msg.status === "delivered" && msg.open_count > 0) return "opened";
  return msg.status;
}

function statusColor(msg: EmailMessage) {
  const label = statusLabel(msg);
  if (label === "opened") return "bg-accent-emerald-soft text-accent-emerald-strong";
  return STATUS_COLORS[label] ?? "bg-bg-surface text-ink-tertiary";
}

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });
}

export default async function AdminMailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const page = Math.max(0, parseInt(sp.page ?? "0", 10));
  const limit = 50;
  const offset = page * limit;

  const statusFilter = sp.status ?? "";
  const templateFilter = sp.template ?? "";
  const searchFilter = sp.q ?? "";
  const dateFilter = sp.date ?? "";

  const admin = createSupabaseAdminClient();
  let messages: EmailMessage[] = [];
  let totalCount = 0;
  let stats = { sent24h: 0, delivered: 0, openRate: 0, clickRate: 0 };

  if (admin) {
    const since24h = new Date(Date.now() - 86_400_000).toISOString();

    const [sent24hRes, deliveredRes, openRes, clickRes] = await Promise.all([
      admin.from("email_messages").select("*", { count: "exact", head: true }).gte("sent_at", since24h),
      admin.from("email_messages").select("*", { count: "exact", head: true }).eq("status", "delivered"),
      admin.from("email_messages").select("*", { count: "exact", head: true }).gt("open_count", 0),
      admin.from("email_messages").select("*", { count: "exact", head: true }).gt("click_count", 0),
    ]);

    const totalSent = (await admin.from("email_messages").select("*", { count: "exact", head: true })).count ?? 0;
    stats = {
      sent24h: sent24hRes.count ?? 0,
      delivered: deliveredRes.count ?? 0,
      openRate: totalSent > 0 ? Math.round(((openRes.count ?? 0) / totalSent) * 100) : 0,
      clickRate: totalSent > 0 ? Math.round(((clickRes.count ?? 0) / totalSent) * 100) : 0,
    };

    let q = admin
      .from("email_messages")
      .select("id,to_address,subject,template_id,campaign_id,status,open_count,click_count,sent_at,created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (statusFilter) q = q.eq("status", statusFilter);
    if (templateFilter) q = q.eq("template_id", templateFilter);
    if (searchFilter) q = q.ilike("to_address", `%${searchFilter}%`);
    if (dateFilter === "24h") q = q.gte("created_at", since24h);
    else if (dateFilter === "7d") q = q.gte("created_at", new Date(Date.now() - 7 * 86_400_000).toISOString());
    else if (dateFilter === "30d") q = q.gte("created_at", new Date(Date.now() - 30 * 86_400_000).toISOString());

    const res = await q;
    messages = (res.data ?? []) as EmailMessage[];
    totalCount = res.count ?? 0;
  }

  const totalPages = Math.ceil(totalCount / limit);
  const templateIds = Object.keys(TEMPLATE_REGISTRY) as Array<keyof typeof TEMPLATE_REGISTRY>;

  function filterUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams({ ...(statusFilter && { status: statusFilter }), ...(templateFilter && { template: templateFilter }), ...(searchFilter && { q: searchFilter }), ...(dateFilter && { date: dateFilter }), ...overrides });
    return `/admin/mail?${params.toString()}`;
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Mail</h1>
          <p className="mt-1 text-sm text-ink-secondary">{totalCount.toLocaleString()} total messages</p>
        </div>
        <Link
          href="/admin/mail/compose"
          className="rounded-full bg-accent-emerald px-5 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong"
        >
          Compose
        </Link>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 border-b border-line">
        {[
          { href: "/admin/mail", label: "Inbox" },
          { href: "/admin/mail/compose", label: "Compose" },
          { href: "/admin/mail/campaigns", label: "Campaigns" },
          { href: "/admin/mail/templates", label: "Templates" },
        ].map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink"
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* What goes where */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 rounded-xl bg-bg-surface px-4 py-2.5 text-xs text-ink-secondary">
        <span><strong className="text-ink">Inbox</strong> — every email that was sent</span>
        <span><strong className="text-ink">Compose</strong> — one-off email to specific addresses</span>
        <span><strong className="text-ink">Campaigns</strong> — bulk send to an audience segment</span>
        <span><strong className="text-ink">Templates</strong> — reusable content library</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Sent (24h)", value: stats.sent24h.toLocaleString() },
          { label: "Delivered", value: stats.delivered.toLocaleString() },
          { label: "Open rate", value: `${stats.openRate}%` },
          { label: "Click rate", value: `${stats.clickRate}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-[20px] border border-line bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" action="/admin/mail" className="flex flex-wrap gap-3">
        <input name="q" defaultValue={searchFilter} placeholder="Search recipient…" className="h-9 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-accent-emerald" />
        <select name="status" defaultValue={statusFilter} className="h-9 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-accent-emerald">
          <option value="">All statuses</option>
          {["queued", "sent", "delivered", "bounced", "complained", "failed"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="template" defaultValue={templateFilter} className="h-9 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-accent-emerald">
          <option value="">All templates</option>
          {templateIds.map((id) => (
            <option key={id} value={id}>{TEMPLATE_REGISTRY[id].name}</option>
          ))}
        </select>
        <select name="date" defaultValue={dateFilter} className="h-9 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-accent-emerald">
          <option value="">All time</option>
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
        <button type="submit" className="h-9 rounded-xl bg-accent-emerald px-4 text-sm font-semibold text-white hover:bg-accent-emerald-strong">Filter</button>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-surface">
              {["To", "Subject", "Template", "Status", "Opened", "Clicked", "Sent"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {messages.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-ink-tertiary">No messages yet.</td>
              </tr>
            ) : (
              messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-bg-surface">
                  <td className="max-w-[160px] truncate px-4 py-3 text-ink-secondary">{msg.to_address}</td>
                  <td className="max-w-[240px] truncate px-4 py-3 font-medium text-ink">
                    <Link href={`/admin/mail/${msg.id}`} className="hover:text-accent-emerald">
                      {msg.subject.slice(0, 60)}{msg.subject.length > 60 ? "…" : ""}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-tertiary">{msg.template_id ? TEMPLATE_REGISTRY[msg.template_id as keyof typeof TEMPLATE_REGISTRY]?.name ?? msg.template_id : "Custom"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColor(msg)}`}>
                      {statusLabel(msg)}
                    </span>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-tertiary">Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 0 && (
              <Link href={filterUrl({ page: String(page - 1) })} className="rounded-xl border border-line px-4 py-2 font-medium text-ink-secondary hover:bg-bg-surface">
                Previous
              </Link>
            )}
            {page + 1 < totalPages && (
              <Link href={filterUrl({ page: String(page + 1) })} className="rounded-xl border border-line px-4 py-2 font-medium text-ink-secondary hover:bg-bg-surface">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
