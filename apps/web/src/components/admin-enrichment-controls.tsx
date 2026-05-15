"use client";

import { useState } from "react";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN ?? "";

type EnrichResult = {
  totalEligible: number;
  enriched: number;
  skipped: number;
  failed: number;
  durationMs: number;
};

export function AdminEnrichmentControls() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnrichResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [force, setForce] = useState(false);

  async function handleRun() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/enrich-offers${force ? "?force=true" : ""}`, {
        method: "POST",
        headers: { "x-admin-token": ADMIN_TOKEN },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        setError(body.error ?? `HTTP ${res.status}`);
        return;
      }

      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
      <h2 className="mb-1 text-sm font-bold text-ink">AI Enrichment</h2>
      <p className="mb-4 text-xs text-ink-tertiary">
        Runs Gemini on all non-Financeads offers. Fills empty bullets, best_for, and metrics.
        Financeads offers are always skipped.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleRun}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-accent-emerald px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-accent-emerald-strong disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Running…
            </>
          ) : (
            "Run AI enrichment"
          )}
        </button>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-secondary select-none">
          <input
            type="checkbox"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-accent-emerald"
          />
          Force (re-enrich already enriched)
        </label>
      </div>

      {result && (
        <div className="mt-4 flex flex-wrap gap-4 rounded-xl bg-accent-emerald-soft px-4 py-3">
          <Stat label="Eligible" value={result.totalEligible} />
          <Stat label="Enriched" value={result.enriched} highlight />
          <Stat label="Skipped" value={result.skipped} />
          <Stat label="Failed" value={result.failed} warn={result.failed > 0} />
          <Stat label="Duration" value={`${(result.durationMs / 1000).toFixed(1)}s`} />
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
          Error: {error}
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  warn,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-accent-emerald-strong">
        {label}
      </p>
      <p
        className={`mt-0.5 text-[18px] font-bold tabular-nums leading-tight ${
          highlight ? "text-accent-emerald-strong" : warn ? "text-red-600" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
