"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// SEC-FIX SEC-002: removed NEXT_PUBLIC_ADMIN_API_TOKEN — session cookie handles auth

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

export default function NewHighlightPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    body: "",
    kind: "rate_change",
    country: "",
    offer_id: "",
    cta_text: "See offer",
    cta_url: "",
    is_active: true,
    published_at: new Date().toISOString().slice(0, 16),
    expires_at: "",
  });

  function set(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        router.replace(`/admin/highlights/${data.id}`);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <a href="/admin/highlights" className="text-sm text-accent-emerald hover:text-accent-emerald-strong">
          ← All highlights
        </a>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-ink">New highlight</h1>
        <p className="mt-1 text-sm text-ink-secondary">Create a homepage "What&apos;s new" card.</p>
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
              placeholder="e.g. Wise cuts FX fees by 30%"
            />
          </label>

          <label className="col-span-full">
            <span className={labelCls}>Body *</span>
            <textarea
              className={textareaCls}
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              required
              placeholder="Short description shown on the card (2–3 sentences max)"
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
              placeholder="See offer"
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
              placeholder="e.g. wise-international-transfer"
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

        <div className="flex items-center gap-3 border-t border-line pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center rounded-xl bg-accent-emerald px-5 text-sm font-semibold text-white hover:bg-accent-emerald-strong disabled:opacity-50"
          >
            {saving ? "Saving…" : "Create highlight"}
          </button>
          <a href="/admin/highlights" className="text-sm text-ink-tertiary hover:text-ink">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
