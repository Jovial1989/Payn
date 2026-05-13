"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN ?? "";

const KINDS = [
  { value: "rate_change",    label: "Rate change" },
  { value: "new_launch",     label: "New launch" },
  { value: "new_provider",   label: "New provider" },
  { value: "feature_update", label: "Feature update" },
];

const COUNTRIES = ["", "DE", "ES", "FR", "IT", "UK", "PT", "AT", "BE", "NL", "PL"];

const inputCls =
  "h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-accent-emerald/40 focus:ring-2 focus:ring-accent-emerald/10";
const textareaCls =
  "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none resize-y min-h-[80px] focus:border-accent-emerald/40 focus:ring-2 focus:ring-accent-emerald/10";
const labelCls = "block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary mb-1.5";

type FormState = {
  title: string;
  body: string;
  kind: string;
  country: string;
  offer_id: string;
  cta_text: string;
  cta_url: string;
  is_active: boolean;
  published_at: string;
  expires_at: string;
};

export default function EditHighlightPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: "",
    body: "",
    kind: "rate_change",
    country: "",
    offer_id: "",
    cta_text: "See offer",
    cta_url: "",
    is_active: true,
    published_at: "",
    expires_at: "",
  });

  useEffect(() => {
    fetch(`/api/admin/highlights/${id}`, {
      headers: { "x-admin-token": ADMIN_TOKEN },
    })
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        setForm({
          title: String(data.title ?? ""),
          body: String(data.body ?? ""),
          kind: String(data.kind ?? "rate_change"),
          country: String(data.country ?? ""),
          offer_id: String(data.offer_id ?? ""),
          cta_text: String(data.cta_text ?? "See offer"),
          cta_url: String(data.cta_url ?? ""),
          is_active: Boolean(data.is_active ?? true),
          published_at: data.published_at
            ? new Date(String(data.published_at)).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          expires_at: data.expires_at
            ? new Date(String(data.expires_at)).toISOString().slice(0, 16)
            : "",
        });
      })
      .catch(() => setError("Failed to load highlight"))
      .finally(() => setLoading(false));
  }, [id]);

  function set(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/highlights/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify({
          ...form,
          country: form.country || null,
          offer_id: form.offer_id || null,
          cta_url: form.cta_url || null,
          published_at: new Date(form.published_at).toISOString(),
          expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this highlight? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/highlights/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": ADMIN_TOKEN },
      });
      if (res.ok) {
        router.replace("/admin/highlights");
      } else {
        const data = await res.json();
        setError(data.error ?? "Delete failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-emerald border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between">
        <div>
          <a href="/admin/highlights" className="text-sm text-accent-emerald hover:text-accent-emerald-strong">
            ← All highlights
          </a>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-ink">Edit highlight</h1>
          <p className="mt-1 font-mono text-xs text-ink-tertiary">{id}</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex h-9 items-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 rounded-[20px] border border-line bg-white p-6 shadow-card">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="col-span-full">
            <span className={labelCls}>Title *</span>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </label>

          <label className="col-span-full">
            <span className={labelCls}>Body *</span>
            <textarea
              className={textareaCls}
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              required
            />
          </label>

          <label>
            <span className={labelCls}>Kind *</span>
            <select className={inputCls} value={form.kind} onChange={(e) => set("kind", e.target.value)} required>
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span className={labelCls}>Country (blank = all)</span>
            <select className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c || "All countries"}</option>
              ))}
            </select>
          </label>

          <label>
            <span className={labelCls}>CTA text</span>
            <input
              className={inputCls}
              value={form.cta_text}
              onChange={(e) => set("cta_text", e.target.value)}
            />
          </label>

          <label>
            <span className={labelCls}>CTA URL</span>
            <input
              type="url"
              className={inputCls}
              value={form.cta_url}
              onChange={(e) => set("cta_url", e.target.value)}
              placeholder="https://…"
            />
          </label>

          <label>
            <span className={labelCls}>Publish at</span>
            <input
              type="datetime-local"
              className={inputCls}
              value={form.published_at}
              onChange={(e) => set("published_at", e.target.value)}
            />
          </label>

          <label>
            <span className={labelCls}>Expires at (optional)</span>
            <input
              type="datetime-local"
              className={inputCls}
              value={form.expires_at}
              onChange={(e) => set("expires_at", e.target.value)}
            />
          </label>

          <label>
            <span className={labelCls}>Offer ID (optional)</span>
            <input
              className={inputCls}
              value={form.offer_id}
              onChange={(e) => set("offer_id", e.target.value)}
            />
          </label>

          <label className="flex items-center gap-3 pt-5">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="h-4 w-4 rounded border-line accent-accent-emerald"
            />
            <span className="text-sm font-medium text-ink">Active (visible on homepage)</span>
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm font-medium text-accent-emerald-strong">Saved successfully</p>}

        <div className="flex items-center gap-3 border-t border-line pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center rounded-xl bg-accent-emerald px-5 text-sm font-semibold text-white hover:bg-accent-emerald-strong disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <a href="/admin/highlights" className="text-sm text-ink-tertiary hover:text-ink">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
