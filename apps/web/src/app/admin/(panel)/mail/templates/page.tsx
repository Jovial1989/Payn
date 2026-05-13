"use client";

import Link from "next/link";
import { useState } from "react";
import { TEMPLATE_REGISTRY, type TemplateId } from "@/lib/email/templates";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN ?? "";

function TemplatePreviewModal({
  templateId,
  onClose,
}: {
  templateId: TemplateId;
  onClose: () => void;
}) {
  const meta = TEMPLATE_REGISTRY[templateId];
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/mail/preview", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": ADMIN_TOKEN },
      body: JSON.stringify({ templateId, props: meta.sampleProps }),
    });
    if (res.ok) {
      const data = await res.json() as { html: string };
      setHtml(data.html);
    }
    setLoading(false);
  };

  if (!html && !loading) { void load(); }

  const sendSample = async () => {
    setSending(true);
    await fetch("/api/admin/mail/send", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": ADMIN_TOKEN },
      body: JSON.stringify({
        to: ["petrov.cpay@gmail.com"],
        subject: `[Preview] ${meta.defaultSubject}`,
        templateId,
        templateProps: meta.sampleProps,
      }),
    });
    setSending(false);
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[20px] border border-line bg-white shadow-elevated">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-base font-bold text-ink">{meta.name} — preview</h2>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink">✕</button>
        </div>
        <div className="flex-1 overflow-hidden">
          {loading && <div className="flex h-full items-center justify-center text-sm text-ink-tertiary">Rendering…</div>}
          {html && <iframe sandbox="" srcDoc={html} title="Template preview" className="h-full w-full" />}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-line px-6 py-4">
          {sent && <span className="text-sm text-accent-emerald-strong">Sent to petrov.cpay@gmail.com</span>}
          <button
            onClick={sendSample}
            disabled={sending || sent}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-bg-surface disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send sample to me"}
          </button>
          <Link
            href={`/admin/mail/compose?template=${templateId}`}
            className="rounded-full bg-accent-emerald px-4 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong"
          >
            Use in compose
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminMailTemplatesPage() {
  const [previewId, setPreviewId] = useState<TemplateId | null>(null);
  const templates = Object.values(TEMPLATE_REGISTRY);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Mail</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Templates</h1>
        </div>
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

      {previewId && (
        <TemplatePreviewModal templateId={previewId} onClose={() => setPreviewId(null)} />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((meta) => (
          <div key={meta.id} className="flex flex-col rounded-[20px] border border-line bg-white p-6 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-bold text-ink">{meta.name}</h2>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.category === "marketing" ? "bg-accent-emerald-soft text-accent-emerald-strong" : "bg-blue-50 text-blue-600"}`}>
                {meta.category}
              </span>
            </div>
            <p className="mt-2 flex-1 text-sm text-ink-secondary">{meta.description}</p>
            <p className="mt-3 font-mono text-xs text-ink-tertiary">{meta.defaultSubject}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setPreviewId(meta.id)}
                className="flex-1 rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-bg-surface"
              >
                Preview
              </button>
              <Link
                href={`/admin/mail/compose?template=${meta.id}`}
                className="flex-1 rounded-xl border border-accent-emerald/30 bg-accent-emerald-soft px-3 py-2 text-center text-sm font-medium text-accent-emerald-strong hover:bg-accent-emerald-soft/80"
              >
                Use
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
