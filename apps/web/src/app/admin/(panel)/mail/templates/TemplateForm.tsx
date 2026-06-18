"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CUSTOM_TEMPLATES_SETUP_SQL } from "@/lib/email/custom-templates-sql";

type Category = "custom" | "transactional" | "marketing";

const DEFAULT_HTML = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;font-family:Arial,sans-serif;background:#f5f7f4;color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:32px;">
            <tr><td>
              <h1 style="margin:0 0 12px;font-size:22px;">Hello</h1>
              <p style="margin:0;color:#4b5563;line-height:1.6;">Write your email here.</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export function TemplateForm({ templateId }: { templateId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(templateId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<Category>("custom");
  const [html, setHtml] = useState(isEdit ? "" : DEFAULT_HTML);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);

  useEffect(() => {
    if (!templateId) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/mail/templates/${templateId}`);
        const data = await res.json() as {
          name?: string; description?: string; subject?: string;
          category?: Category; html?: string; error?: string; tableMissing?: boolean;
        };
        if (!active) return;
        if (data.tableMissing) { setTableMissing(true); return; }
        if (!res.ok) { setError(data.error ?? "Failed to load template."); return; }
        setName(data.name ?? "");
        setDescription(data.description ?? "");
        setSubject(data.subject ?? "");
        setCategory((data.category ?? "custom") as Category);
        setHtml(data.html ?? "");
      } catch {
        if (active) setError("Failed to load template.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [templateId]);

  const save = async () => {
    setError(null);
    if (!name.trim()) { setError("Name is required."); return; }
    if (!subject.trim()) { setError("Subject is required."); return; }
    if (!html.trim()) { setError("HTML is required."); return; }

    setSaving(true);
    try {
      const payload = { name: name.trim(), description, subject: subject.trim(), category, html };
      const res = await fetch(
        isEdit ? `/api/admin/mail/templates/${templateId}` : "/api/admin/mail/templates",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => ({})) as { error?: string; tableMissing?: boolean };
      if (!res.ok) {
        if (data.tableMissing) setTableMissing(true);
        setError(data.error ?? "Save failed.");
        return;
      }
      router.push("/admin/mail/templates");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!templateId) return;
    if (!window.confirm("Delete this template? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/mail/templates/${templateId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/mail/templates");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setError(data.error ?? "Delete failed.");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (tableMissing) {
    return (
      <div className="grid gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Mail · Templates</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{isEdit ? "Edit template" : "New template"}</h1>
        </div>
        <div className="rounded-[20px] border border-line bg-white p-6 shadow-card">
          <p className="mb-2 text-sm font-semibold text-ink">Table not yet created</p>
          <p className="mb-4 text-sm text-ink-secondary">
            Run this in Supabase SQL editor to enable custom templates.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-bg-surface p-4 font-mono text-xs text-ink-secondary">
            {CUSTOM_TEMPLATES_SETUP_SQL}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Mail · Templates</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{isEdit ? "Edit template" : "New template"}</h1>
        </div>
        <Link
          href="/admin/mail/templates"
          className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-bg-surface"
        >
          Back
        </Link>
      </div>

      {loading ? (
        <div className="rounded-[20px] border border-line bg-white px-6 py-12 text-center text-sm text-ink-tertiary shadow-card">
          Loading…
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Form */}
          <div className="grid gap-5">
            <div className="rounded-[20px] border border-line bg-white p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Details</p>
              <div className="mt-4 grid gap-4">
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-ink-secondary">Name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Spring promo"
                    className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-ink-secondary">Description</span>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What this template is for…"
                    className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
                  />
                </label>
                <label className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-secondary">Subject</span>
                    <span className={`text-xs ${subject.length > 100 ? "text-red-500" : "text-ink-tertiary"}`}>{subject.length}/100</span>
                  </div>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value.slice(0, 100))}
                    placeholder="Email subject…"
                    className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-ink-secondary">Category</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
                  >
                    <option value="custom">Custom</option>
                    <option value="transactional">Transactional</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="rounded-[20px] border border-line bg-white p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">HTML</p>
              <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50 px-4 py-2 text-xs text-orange-700">
                Custom HTML bypasses templates. Verify it renders in Gmail and Outlook before sending.
              </div>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                rows={18}
                placeholder="<html>…</html>"
                className="mt-3 w-full rounded-xl border border-line bg-bg-surface px-3 py-2 font-mono text-xs text-ink outline-none focus:border-accent-emerald"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => void save()}
                className="rounded-full bg-accent-emerald px-5 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong disabled:opacity-50"
              >
                {saving ? "Saving…" : isEdit ? "Save changes" : "Create template"}
              </button>
              {isEdit && (
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => void remove()}
                  className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-ink-tertiary hover:text-red-500 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              )}
            </div>
          </div>

          {/* Live preview */}
          <div className="sticky top-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Preview</p>
            <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
              {html.trim() ? (
                <iframe sandbox="" srcDoc={html} title="Template preview" className="h-[600px] w-full" />
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-ink-tertiary">
                  Enter HTML to see preview
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
