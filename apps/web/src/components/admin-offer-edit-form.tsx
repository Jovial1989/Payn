"use client";

import { useState } from "react";

type Props = {
  offerId: string;
  override: { affiliate_url: string | null; status: string; notes: string | null } | null;
};

export function AdminOfferEditForm({ offerId, override }: Props) {
  const [affiliateUrl, setAffiliateUrl] = useState(override?.affiliate_url ?? "");
  const [status, setStatus] = useState(override?.status ?? "active");
  const [notes, setNotes] = useState(override?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/v1/admin/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliate_url: affiliateUrl || null,
          status,
          notes: notes || null,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError("Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "w-full rounded-[10px] border border-line bg-bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent-emerald/30 focus:ring-2 focus:ring-accent-emerald/10";
  const labelClass = "text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary";

  return (
    <form onSubmit={handleSave} className="rounded-[20px] border border-line bg-white p-6 shadow-card">
      <h2 className="mb-5 text-sm font-bold text-ink">Override settings</h2>

      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <label className={labelClass}>Affiliate URL override</label>
          <input
            type="url"
            value={affiliateUrl}
            onChange={(e) => setAffiliateUrl(e.target.value)}
            placeholder="https://…"
            className={fieldClass}
          />
        </div>

        <div className="grid gap-1.5">
          <label className={labelClass}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={fieldClass}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="needs_review">Needs review</option>
          </select>
        </div>

        <div className="grid gap-1.5">
          <label className={labelClass}>Internal notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional notes…"
            className={fieldClass}
          />
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-[10px] bg-accent-emerald px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-emerald-strong disabled:opacity-60"
        >
          {saved ? "Saved!" : saving ? "Saving…" : "Save override"}
        </button>
      </div>
    </form>
  );
}
