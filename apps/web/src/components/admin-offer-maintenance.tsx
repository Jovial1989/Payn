"use client";

import { useState } from "react";

/**
 * Maintenance actions for the offer catalog that don't belong in the per-offer
 * editor. Currently: reset the is_monetised flag on every offer (run once after
 * a fresh seed to clear the compliance-incorrect default, then re-enable the
 * genuinely monetised offers individually).
 */
export function AdminOfferMaintenance() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function resetMonetised() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/v1/admin/offers/reset-monetised", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
      } else {
        setResult(`Reset is_monetised=false on ${data.reset ?? 0} offers.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  return (
    <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
      <h2 className="mb-1 text-sm font-bold text-ink">⚠️ Danger zone</h2>
      <p className="mb-3 text-xs text-ink-tertiary">
        Bulk maintenance. These actions affect every offer at once — use with care.
      </p>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-orange-200 bg-orange-50/50 p-3">
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-ink">Reset all “monetised” flags</p>
          <p className="text-xs text-ink-secondary">
            Sets <code className="font-mono">is_monetised = false</code> on every offer. Run once
            after seeding, then re-enable the real affiliate offers individually.
          </p>
        </div>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            disabled={loading}
            className="shrink-0 rounded-lg border border-orange-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-orange-700 transition-colors hover:bg-orange-50 disabled:opacity-50"
          >
            Reset all…
          </button>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={resetMonetised}
              disabled={loading}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Resetting…" : "Confirm reset"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={loading}
              className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-secondary hover:bg-bg-surface"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {result && (
        <p className="mt-2 rounded-lg bg-accent-emerald-soft px-3 py-2 text-[12px] font-medium text-accent-emerald-strong">
          ✓ {result}
        </p>
      )}
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600">
          ✗ {error}
        </p>
      )}
    </div>
  );
}
