"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { TEMPLATE_REGISTRY, type TemplateId } from "@/lib/email/templates";
import { CUSTOM_TEMPLATES_SETUP_SQL } from "@/lib/email/custom-templates-sql";

// SEC-FIX SEC-002: removed NEXT_PUBLIC_ADMIN_API_TOKEN — session cookie handles auth

type CustomTemplate = {
  id: string;
  name: string;
  description: string;
  subject: string;
  category: "transactional" | "marketing" | "custom";
  updated_at: string;
};

function categoryBadgeClass(category: string): string {
  if (category === "marketing") return "bg-accent-emerald-soft text-accent-emerald-strong";
  if (category === "custom") return "bg-bg-surface text-ink-tertiary";
  return "bg-blue-50 text-blue-600";
}

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
  const [sampleTo, setSampleTo] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/mail/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
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
    const to = sampleTo.trim();
    if (!to) return;
    setSending(true);
    await fetch("/api/admin/mail/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        to: [to],
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
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-6 py-4">
          {sent && <span className="text-sm text-accent-emerald-strong">Sent to {sampleTo}</span>}
          <input
            type="email"
            value={sampleTo}
            onChange={(e) => { setSampleTo(e.target.value); setSent(false); }}
            placeholder="Send sample to…"
            className="h-9 min-w-[200px] flex-1 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
          />
          <button
            onClick={sendSample}
            disabled={sending || sent || !sampleTo.trim()}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-bg-surface disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send sample"}
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

function CustomTemplatePreviewModal({
  templateId,
  onClose,
}: {
  templateId: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/mail/templates/${templateId}`);
        const data = await res.json() as { name?: string; html?: string; error?: string };
        if (!active) return;
        if (!res.ok) { setError(data.error ?? "Failed to load template."); return; }
        setName(data.name ?? "Template");
        setHtml(data.html ?? "");
      } catch {
        if (active) setError("Failed to load template.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [templateId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[20px] border border-line bg-white shadow-elevated">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-base font-bold text-ink">{name || "Template"} — preview</h2>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink">✕</button>
        </div>
        <div className="flex-1 overflow-hidden">
          {loading && <div className="flex h-full items-center justify-center text-sm text-ink-tertiary">Loading…</div>}
          {error && <div className="flex h-full items-center justify-center text-sm text-red-600">{error}</div>}
          {!loading && !error && (
            <iframe sandbox="" srcDoc={html ?? ""} title="Custom template preview" className="h-full w-full" />
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-6 py-4">
          <Link
            href={`/admin/mail/templates/${templateId}`}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-bg-surface"
          >
            Edit
          </Link>
          <Link
            href={`/admin/mail/compose?customTemplate=${templateId}`}
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
  const [customPreviewId, setCustomPreviewId] = useState<string | null>(null);
  const templates = Object.values(TEMPLATE_REGISTRY);

  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [tableMissing, setTableMissing] = useState(false);
  const [loadingCustom, setLoadingCustom] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCustom = useCallback(async () => {
    setLoadingCustom(true);
    try {
      const res = await fetch("/api/admin/mail/templates");
      const data = await res.json() as { templates?: CustomTemplate[]; tableMissing?: boolean };
      setTableMissing(Boolean(data.tableMissing));
      setCustomTemplates(data.templates ?? []);
    } catch {
      setCustomTemplates([]);
    } finally {
      setLoadingCustom(false);
    }
  }, []);

  useEffect(() => { void loadCustom(); }, [loadCustom]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("Delete this template? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/mail/templates/${id}`, { method: "DELETE" });
      if (res.ok) await loadCustom();
    } finally {
      setDeletingId(null);
    }
  }, [loadCustom]);

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
      {customPreviewId && (
        <CustomTemplatePreviewModal templateId={customPreviewId} onClose={() => setCustomPreviewId(null)} />
      )}

      {/* Code-based templates */}
      <div className="grid gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Built-in templates</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((meta) => (
            <div key={meta.id} className="flex flex-col rounded-[20px] border border-line bg-white p-6 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-ink">{meta.name}</h3>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${categoryBadgeClass(meta.category)}`}>
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

      {/* Custom templates */}
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Custom templates</h2>
          <Link
            href="/admin/mail/templates/new"
            className="rounded-full bg-accent-emerald px-4 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong"
          >
            + New template
          </Link>
        </div>

        {tableMissing ? (
          <div className="rounded-[20px] border border-line bg-white p-6 shadow-card">
            <p className="mb-2 text-sm font-semibold text-ink">Table not yet created</p>
            <p className="mb-4 text-sm text-ink-secondary">
              Run this in Supabase SQL editor to enable custom templates.
            </p>
            <pre className="overflow-x-auto rounded-xl bg-bg-surface p-4 font-mono text-xs text-ink-secondary">
              {CUSTOM_TEMPLATES_SETUP_SQL}
            </pre>
          </div>
        ) : loadingCustom ? (
          <div className="rounded-[20px] border border-line bg-white px-6 py-12 text-center text-sm text-ink-tertiary shadow-card">
            Loading…
          </div>
        ) : customTemplates.length === 0 ? (
          <div className="rounded-[20px] border border-line bg-white px-6 py-12 text-center text-sm text-ink-secondary shadow-card">
            No custom templates yet. Use{" "}
            <span className="font-semibold text-ink">+ New template</span> to create one.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customTemplates.map((tpl) => (
              <div key={tpl.id} className="flex flex-col rounded-[20px] border border-line bg-white p-6 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-ink">{tpl.name}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${categoryBadgeClass(tpl.category)}`}>
                    {tpl.category}
                  </span>
                </div>
                <p className="mt-2 flex-1 text-sm text-ink-secondary">{tpl.description || "—"}</p>
                <p className="mt-3 font-mono text-xs text-ink-tertiary">{tpl.subject}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setCustomPreviewId(tpl.id)}
                    className="flex-1 rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-bg-surface"
                  >
                    Preview
                  </button>
                  <Link
                    href={`/admin/mail/compose?customTemplate=${tpl.id}`}
                    className="flex-1 rounded-xl border border-accent-emerald/30 bg-accent-emerald-soft px-3 py-2 text-center text-sm font-medium text-accent-emerald-strong hover:bg-accent-emerald-soft/80"
                  >
                    Use in compose
                  </Link>
                </div>
                <div className="mt-2 flex gap-2">
                  <Link
                    href={`/admin/mail/templates/${tpl.id}`}
                    className="flex-1 rounded-xl border border-line px-3 py-2 text-center text-sm font-medium text-ink-secondary hover:bg-bg-surface"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => void handleDelete(tpl.id)}
                    disabled={deletingId === tpl.id}
                    className="flex-1 rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink-tertiary hover:text-red-500 disabled:opacity-50"
                  >
                    {deletingId === tpl.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
