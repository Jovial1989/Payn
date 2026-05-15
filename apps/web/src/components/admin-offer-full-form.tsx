"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "loans","cards","banking","transfers","exchange",
  "insurance","investments","crypto","business","budgeting","kids",
];
const LINK_TYPES = ["affiliate_redirect","lead_capture","embedded_partner","informational"];
const STATUSES = ["active","inactive","needs_review","archived"];

export type OfferFormData = {
  id?: string;
  slug?: string;
  provider_name?: string;
  provider_mark?: string;
  provider_website_url?: string;
  title?: string;
  subtitle?: string;
  category?: string;
  country_codes?: string[];
  affiliate_link?: string;
  link_type?: string;
  affiliate_priority_score?: number;
  is_monetised?: boolean;
  status?: string;
  is_featured?: boolean;
  best_for?: string[];
  tags?: string[];
  notes?: string;
  attributes?: Record<string, unknown>;
  metrics?: unknown[];
  bullets?: string[];
  data_source?: string;
  last_ai_enrichment_at?: string | null;
  last_human_review_at?: string | null;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "h-10 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-accent-emerald/40 focus:ring-2 focus:ring-accent-emerald/10";
const textareaCls = "rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent-emerald/40 focus:ring-2 focus:ring-accent-emerald/10 resize-y min-h-[80px]";

export function AdminOfferFullForm({
  offer,
  mode,
}: {
  offer?: OfferFormData;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [form, setForm] = useState<OfferFormData>({
    id:                      offer?.id ?? "",
    slug:                    offer?.slug ?? "",
    provider_name:           offer?.provider_name ?? "",
    provider_mark:           offer?.provider_mark ?? "",
    provider_website_url:    offer?.provider_website_url ?? "",
    title:                   offer?.title ?? "",
    subtitle:                offer?.subtitle ?? "",
    category:                offer?.category ?? "loans",
    country_codes:           offer?.country_codes ?? [],
    affiliate_link:          offer?.affiliate_link ?? "",
    link_type:               offer?.link_type ?? "affiliate_redirect",
    affiliate_priority_score: offer?.affiliate_priority_score ?? 0.5,
    is_monetised:            offer?.is_monetised ?? false,
    status:                  offer?.status ?? "active",
    is_featured:             offer?.is_featured ?? false,
    best_for:                offer?.best_for ?? [],
    tags:                    offer?.tags ?? [],
    notes:                   offer?.notes ?? "",
    attributes:              offer?.attributes ?? {},
    metrics:                 offer?.metrics ?? [],
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof OfferFormData>(key: K, value: OfferFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const payload = {
      ...form,
      _fullUpsert: true,
      affiliate_priority_score: Number(form.affiliate_priority_score),
      last_human_review_at: new Date().toISOString(),
    };

    try {
      const url  = isEdit ? `/api/v1/admin/offers/${form.id}` : "/api/v1/admin/offers";
      const method = isEdit ? "PUT" : "POST";
      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
      } else {
        setSaved(true);
        if (!isEdit && data.offer?.id) {
          router.replace(`/admin/offers/${data.offer.id}`);
        } else {
          router.refresh();
          setTimeout(() => setSaved(false), 2500);
        }
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const aiEnrichedAt = offer?.last_ai_enrichment_at;
  const humanReviewedAt = offer?.last_human_review_at;
  const needsReview =
    isEdit &&
    aiEnrichedAt &&
    (!humanReviewedAt || new Date(humanReviewedAt) < new Date(aiEnrichedAt));

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-[20px] border border-line bg-white p-6 shadow-card">
      <h2 className="text-sm font-bold text-ink">{isEdit ? "Edit offer" : "Create offer"}</h2>

      {needsReview && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 5Zm0 6.5a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75Z" />
          </svg>
          <span>
            AI-enriched on{" "}
            <span className="font-semibold">{aiEnrichedAt!.slice(0, 10)}</span> — please review bullets,
            best_for, and metrics, then save to mark as human-reviewed.
          </span>
        </div>
      )}

      {/* Identity */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Offer ID *">
          <input required value={form.id} onChange={(e) => set("id", e.target.value)}
            readOnly={isEdit && offer?.data_source === "static"}
            placeholder="e.g. loans-santander-personal"
            className={inputCls + (isEdit && offer?.data_source === "static" ? " bg-bg-surface text-ink-tertiary" : "")} />
        </Field>
        <Field label="Slug *">
          <input required value={form.slug} onChange={(e) => set("slug", e.target.value)}
            placeholder="e.g. santander-personal"
            className={inputCls} />
        </Field>
      </div>

      {/* Provider */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Provider name *">
          <input required value={form.provider_name} onChange={(e) => set("provider_name", e.target.value)}
            placeholder="e.g. Santander" className={inputCls} />
        </Field>
        <Field label="Provider mark">
          <input value={form.provider_mark} onChange={(e) => set("provider_mark", e.target.value)}
            placeholder="e.g. SA" className={inputCls} />
        </Field>
        <Field label="Provider website URL">
          <input type="url" value={form.provider_website_url} onChange={(e) => set("provider_website_url", e.target.value)}
            placeholder="https://…" className={inputCls} />
        </Field>
      </div>

      {/* Title */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title *">
          <input required value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Santander Personal Loan" className={inputCls} />
        </Field>
        <Field label="Subtitle">
          <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)}
            placeholder="e.g. Up to €50,000 at competitive rates" className={inputCls} />
        </Field>
      </div>

      {/* Category + Link type */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Category *">
          <select required value={form.category} onChange={(e) => set("category", e.target.value)}
            className={inputCls}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Link type">
          <select value={form.link_type} onChange={(e) => set("link_type", e.target.value)}
            className={inputCls}>
            {LINK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => set("status", e.target.value)}
            className={inputCls}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      {/* Affiliate link */}
      <Field label="Affiliate link">
        <input type="url" value={form.affiliate_link} onChange={(e) => set("affiliate_link", e.target.value)}
          placeholder="https://…" className={inputCls} />
      </Field>

      {/* Country codes */}
      <Field label="Country codes (comma-separated, e.g. DE,FR,ES,EU)">
        <input
          value={(form.country_codes ?? []).join(",")}
          onChange={(e) => set("country_codes", e.target.value.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))}
          placeholder="DE,FR,ES,IT,PT,EU"
          className={inputCls}
        />
      </Field>

      {/* Scores + flags */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Priority score (0–1)">
          <input type="number" min="0" max="1" step="0.01"
            value={form.affiliate_priority_score}
            onChange={(e) => set("affiliate_priority_score", Number(e.target.value))}
            className={inputCls} />
        </Field>
        <Field label="Best for (comma-separated)">
          <input
            value={(form.best_for ?? []).join(",")}
            onChange={(e) => set("best_for", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            placeholder="No monthly fee, Mobile-first"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Tags */}
      <Field label="Tags (comma-separated)">
        <input
          value={(form.tags ?? []).join(",")}
          onChange={(e) => set("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
          placeholder="featured, new, popular"
          className={inputCls}
        />
      </Field>

      {/* Checkboxes */}
      <div className="flex flex-wrap gap-6">
        <label className="flex cursor-pointer items-center gap-2.5">
          <input type="checkbox" checked={Boolean(form.is_monetised)}
            onChange={(e) => set("is_monetised", e.target.checked)}
            className="h-4 w-4 rounded accent-accent-emerald" />
          <span className="text-sm font-medium text-ink">Monetised</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2.5">
          <input type="checkbox" checked={Boolean(form.is_featured)}
            onChange={(e) => set("is_featured", e.target.checked)}
            className="h-4 w-4 rounded accent-accent-emerald" />
          <span className="text-sm font-medium text-ink">Featured</span>
        </label>
      </div>

      {/* Attributes JSON */}
      <Field label="Attributes (JSON)">
        <textarea
          value={JSON.stringify(form.attributes ?? {}, null, 2)}
          onChange={(e) => {
            try { set("attributes", JSON.parse(e.target.value)); } catch { /* ignore invalid */ }
          }}
          className={textareaCls + " font-mono text-xs"}
          rows={6}
        />
      </Field>

      {/* Metrics JSON */}
      <Field label="Metrics (JSON array)">
        <textarea
          value={JSON.stringify(form.metrics ?? [], null, 2)}
          onChange={(e) => {
            try { set("metrics", JSON.parse(e.target.value)); } catch { /* ignore invalid */ }
          }}
          className={textareaCls + " font-mono text-xs"}
          rows={4}
        />
      </Field>

      {/* Notes */}
      <Field label="Internal notes">
        <textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)}
          placeholder="Admin-only notes…" className={textareaCls} rows={2} />
      </Field>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-accent-emerald px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-emerald-strong disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create offer"}
        </button>
        {saved && <span className="text-sm font-medium text-accent-emerald-strong">✓ Saved</span>}
        <a href="/admin/offers" className="text-sm text-ink-tertiary hover:text-ink">Cancel</a>
      </div>
    </form>
  );
}
