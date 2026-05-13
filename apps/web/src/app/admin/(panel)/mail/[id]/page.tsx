import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { TEMPLATE_REGISTRY } from "@/lib/email/templates";
import { AdminMailMessageActions } from "@/components/admin-mail-message-actions";

type EmailMessage = {
  id: string;
  resend_id: string | null;
  user_id: string | null;
  campaign_id: string | null;
  template_id: string | null;
  from_address: string;
  to_address: string;
  reply_to: string | null;
  subject: string;
  html: string | null;
  text: string | null;
  tags: Array<{ name: string; value: string }>;
  metadata: Record<string, unknown>;
  status: string;
  error: string | null;
  sent_at: string | null;
  open_count: number;
  click_count: number;
  created_at: string;
};

type EmailEvent = {
  id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

const EVENT_ICONS: Record<string, string> = {
  sent: "→",
  delivered: "✓",
  delivery_delayed: "⏳",
  opened: "👁",
  clicked: "🔗",
  bounced: "✗",
  complained: "⚠",
  unsubscribed: "−",
  failed: "✗",
};

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

const STATUS_COLORS: Record<string, string> = {
  queued: "bg-bg-surface text-ink-tertiary",
  sent: "bg-blue-50 text-blue-600",
  delivered: "bg-accent-emerald-soft text-accent-emerald-strong",
  bounced: "bg-red-50 text-red-600",
  complained: "bg-red-50 text-red-600",
  failed: "bg-red-50 text-red-600",
};

export default async function AdminMailMessagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  if (!admin) return <p className="p-8 text-sm text-ink-secondary">Admin client not configured.</p>;

  const [msgRes, eventsRes] = await Promise.all([
    admin.from("email_messages").select("*").eq("id", id).single<EmailMessage>(),
    admin.from("email_events").select("*").eq("message_id", id).order("created_at", { ascending: true }),
  ]);

  if (!msgRes.data) return notFound();
  const msg = msgRes.data;
  const events = (eventsRes.data ?? []) as EmailEvent[];

  let campaignName: string | null = null;
  if (msg.campaign_id) {
    const campRes = await admin.from("email_campaigns").select("name").eq("id", msg.campaign_id).single<{ name: string }>();
    campaignName = campRes.data?.name ?? null;
  }

  const templateName = msg.template_id ? (TEMPLATE_REGISTRY[msg.template_id as keyof typeof TEMPLATE_REGISTRY]?.name ?? msg.template_id) : null;

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/admin/mail" className="text-xs font-medium text-ink-tertiary hover:text-ink">← Mail inbox</Link>
        <h1 className="mt-2 text-xl font-bold text-ink">{msg.subject}</h1>
        <div className="mt-1 flex flex-wrap gap-4 text-sm text-ink-secondary">
          <span><span className="text-ink-tertiary">From</span> {msg.from_address}</span>
          <span><span className="text-ink-tertiary">To</span> {msg.to_address}</span>
          {msg.reply_to && <span><span className="text-ink-tertiary">Reply-To</span> {msg.reply_to}</span>}
          <span><span className="text-ink-tertiary">Sent</span> {fmt(msg.sent_at)}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Email body */}
        <div className="grid gap-4">
          {msg.html && (
            <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
              <div className="border-b border-line px-5 py-3">
                <h2 className="text-sm font-bold text-ink">Rendered HTML</h2>
              </div>
              <iframe
                sandbox=""
                srcDoc={msg.html}
                title="Email HTML preview"
                className="h-[600px] w-full"
              />
            </div>
          )}
          {msg.text && (
            <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
              <div className="border-b border-line px-5 py-3">
                <h2 className="text-sm font-bold text-ink">Plain text</h2>
              </div>
              <pre className="overflow-auto p-5 font-mono text-xs text-ink-secondary whitespace-pre-wrap">{msg.text}</pre>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="grid gap-4 self-start">
          {/* Status */}
          <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Status</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${STATUS_COLORS[msg.status] ?? "bg-bg-surface text-ink-tertiary"}`}>
              {msg.status}
            </span>
            {msg.error && (
              <p className="mt-2 text-xs text-red-600">{msg.error}</p>
            )}
          </div>

          {/* Event timeline */}
          <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Timeline</p>
            {events.length === 0 ? (
              <p className="mt-3 text-sm text-ink-tertiary">No events yet.</p>
            ) : (
              <div className="mt-3 grid gap-3">
                {events.map((ev) => (
                  <div key={ev.id} className="flex gap-3">
                    <span className="mt-0.5 text-sm">{EVENT_ICONS[ev.event_type] ?? "•"}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink capitalize">{ev.event_type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-ink-tertiary">{fmt(ev.created_at)}</p>
                      {ev.event_type === "clicked" && typeof ev.metadata?.url === "string" && (
                        <a href={ev.metadata.url} target="_blank" rel="noreferrer" className="truncate text-xs text-accent-emerald underline">
                          {ev.metadata.url.slice(0, 50)}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Details</p>
            <div className="mt-3 grid gap-2 text-sm">
              {templateName && (
                <div className="flex justify-between">
                  <span className="text-ink-tertiary">Template</span>
                  <span className="font-medium text-ink">{templateName}</span>
                </div>
              )}
              {campaignName && (
                <div className="flex justify-between">
                  <span className="text-ink-tertiary">Campaign</span>
                  <Link href={`/admin/mail/campaigns/${msg.campaign_id}`} className="font-medium text-accent-emerald hover:underline">
                    {campaignName}
                  </Link>
                </div>
              )}
              {msg.resend_id && (
                <div className="flex justify-between gap-2">
                  <span className="shrink-0 text-ink-tertiary">Resend ID</span>
                  <span className="truncate font-mono text-xs text-ink-secondary">{msg.resend_id}</span>
                </div>
              )}
              {Array.isArray(msg.tags) && msg.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {msg.tags.map((t) => (
                    <span key={t.name} className="rounded-full bg-bg-surface px-2 py-0.5 font-mono text-[11px] text-ink-secondary">
                      {t.name}:{t.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <AdminMailMessageActions messageId={msg.id} subject={msg.subject} toAddress={msg.to_address} />
        </div>
      </div>
    </div>
  );
}
