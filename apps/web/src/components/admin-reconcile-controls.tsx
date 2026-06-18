"use client";

import { useState } from "react";
import type { OfferReconcileResult, ReconcileResponse } from "@/app/api/admin/reconcile-offers/route";
import type { FixOfferResponse } from "@/app/api/admin/fix-offer/route";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type SummaryStats = Omit<ReconcileResponse, "results">;

type FixState = {
  loading: "ai" | "manual" | null;
  manualUrl: string;
  result: FixOfferResponse | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function confidence(c: number | undefined): string {
  if (c === undefined) return "—";
  return `${Math.round(c * 100)}%`;
}

function isBotProtected(result: OfferReconcileResult): boolean {
  return result.link_ok && result.match === undefined && (result.issues ?? []).some(i => i.includes("Bot-protected"));
}

function StatusBadge({ result }: { result: OfferReconcileResult }) {
  if (!result.link_ok) {
    return (
      <span className="inline-block rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
        {result.http_status === "timeout" ? "Timeout" : `Dead (${result.http_status})`}
      </span>
    );
  }
  if (isBotProtected(result)) {
    return (
      <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
        🔒 Bot-protected
      </span>
    );
  }
  if (result.gemini_error) {
    return (
      <span className="inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
        AI error
      </span>
    );
  }
  if (result.match === true) {
    return (
      <span className="inline-block rounded-full bg-accent-emerald-soft px-2 py-0.5 text-[11px] font-semibold text-accent-emerald-strong">
        ✓ OK
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
      ⚠ Mismatch
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function AdminReconcileControls() {
  const [loading, setLoading] = useState(false);
  const [autoFlag, setAutoFlag] = useState(true);
  const [batchOffset, setBatchOffset] = useState(0);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [allResults, setAllResults] = useState<OfferReconcileResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "issues" | "monetized-issues">("monetized-issues");
  // Per-offer fix state
  const [fixStates, setFixStates] = useState<Record<string, FixState>>({});

  function getFixState(id: string): FixState {
    return fixStates[id] ?? { loading: null, manualUrl: "", result: null };
  }
  function setFixFor(id: string, patch: Partial<FixState>) {
    setFixStates((prev) => ({ ...prev, [id]: { ...getFixState(id), ...patch } }));
  }

  async function runBatch(offset: number, reset: boolean) {
    setLoading(true);
    setError(null);
    if (reset) {
      setAllResults([]);
      setStats(null);
    }

    try {
      const res = await fetch("/api/admin/reconcile-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoFlag, batchOffset: offset }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        setError(body.error ?? `HTTP ${res.status}`);
        return;
      }

      const data = (await res.json()) as ReconcileResponse;
      setStats(data);
      setAllResults((prev) => (reset ? data.results : [...prev, ...data.results]));
      setBatchOffset(offset + data.checked);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  function normalizeUrl(raw: string): string {
    const s = raw.trim();
    if (!s) return s;
    // Auto-prepend https:// if the user pasted a bare domain or http URL
    if (!/^https?:\/\//i.test(s)) return `https://${s}`;
    // Upgrade http → https
    if (s.startsWith("http://")) return `https://${s.slice(7)}`;
    return s;
  }

  async function fixOffer(offerId: string, mode: "ai-search" | "manual") {
    const fx = getFixState(offerId);
    if (mode === "manual" && !fx.manualUrl.trim()) return;

    const resolvedUrl = mode === "manual" ? normalizeUrl(fx.manualUrl) : undefined;

    setFixFor(offerId, { loading: mode === "ai-search" ? "ai" : "manual", result: null });

    try {
      const res = await fetch("/api/admin/fix-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId,
          mode,
          ...(mode === "manual" ? { newUrl: resolvedUrl } : {}),
        }),
      });
      const data = (await res.json()) as FixOfferResponse;
      setFixFor(offerId, { loading: null, result: data });

      // If fix succeeded, mark the row as OK in local state
      if (data.success) {
        setAllResults((prev) =>
          prev.map((r) =>
            r.id === offerId
              ? { ...r, match: true, link_ok: true, suggested_status: "ok", issues: [] }
              : r
          )
        );
      }
    } catch (e) {
      setFixFor(offerId, {
        loading: null,
        result: { success: false, offer_id: offerId, error: e instanceof Error ? e.message : "Network error" },
      });
    }
  }

  // Monetized = has financeads affiliate link OR is_monetised flag
  const isMonetized = (r: OfferReconcileResult) =>
    r.is_monetised || r.url.includes("financeads") || r.url.includes("tracking.");

  const needsFix = (r: OfferReconcileResult) =>
    (!r.link_ok || r.match === false) && !isBotProtected(r);

  const displayed =
    filter === "monetized-issues"
      ? allResults.filter((r) => needsFix(r) && isMonetized(r))
      : filter === "issues"
        ? allResults.filter((r) => needsFix(r) || r.gemini_error)
        : allResults;

  return (
    <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
      {/* Header */}
      <h2 className="mb-1 text-sm font-bold text-ink">🔍 Offer Reconciliation</h2>
      <p className="mb-4 text-xs text-ink-tertiary">
        Gemini fetches each offer URL and checks whether the live page matches our stored data
        — verifying the link is alive, points to the right product, and that conditions haven't changed.
        20 offers per batch. Mismatches can be fixed automatically or with a manual link.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => runBatch(0, true)}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-ink/80 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Reconciling…
            </>
          ) : (
            "Run reconciliation"
          )}
        </button>

        {allResults.length > 0 && !loading && (
          <button
            onClick={() => runBatch(batchOffset, false)}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-bg-surface disabled:opacity-50"
          >
            Next batch (offset {batchOffset})
          </button>
        )}

        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-secondary select-none">
          <input
            type="checkbox"
            checked={autoFlag}
            onChange={(e) => setAutoFlag(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-accent-emerald"
          />
          Auto-flag mismatches as <em>needs_review</em>
        </label>
      </div>

      {/* Summary stats */}
      {stats && (
        <div className="mt-4 flex flex-wrap gap-4 rounded-xl bg-bg-surface px-4 py-3">
          <StatBox label="Checked" value={allResults.length} />
          <StatBox label="OK" value={allResults.filter((r) => r.match !== false && r.link_ok).length} highlight />
          <StatBox
            label="Mismatches"
            value={allResults.filter((r) => r.match === false && r.link_ok).length}
            warn
          />
          <StatBox
            label="Dead links"
            value={allResults.filter((r) => !r.link_ok).length}
            warn
          />
          <StatBox label="AI errors" value={allResults.filter((r) => !!r.gemini_error).length} />
          {autoFlag && <StatBox label="Flagged" value={stats.flagged} warn={stats.flagged > 0} />}
          <StatBox
            label="Fixed"
            value={Object.values(fixStates).filter((f) => f.result?.success).length}
            highlight
          />
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
          Error: {error}
        </p>
      )}

      {/* Results table */}
      {allResults.length > 0 && (
        <div className="mt-5">
          {/* Filter toggle */}
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={() => setFilter("monetized-issues")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${filter === "monetized-issues" ? "bg-accent-emerald text-white" : "border border-line text-ink-secondary hover:text-ink"}`}
            >
              💰 Monetized issues ({allResults.filter((r) => needsFix(r) && isMonetized(r)).length})
            </button>
            <button
              onClick={() => setFilter("issues")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${filter === "issues" ? "bg-ink text-white" : "border border-line text-ink-secondary hover:text-ink"}`}
            >
              All issues ({allResults.filter((r) => needsFix(r) || !!r.gemini_error).length})
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${filter === "all" ? "bg-ink text-white" : "border border-line text-ink-secondary hover:text-ink"}`}
            >
              All ({allResults.length})
            </button>
          </div>

          <div className="overflow-x-auto rounded-[16px] border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-bg-surface">
                  {["Provider", "Title", "Category", "Status", "Confidence", "Page found", "Issues", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {displayed.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-ink-tertiary">
                      No issues found in checked offers.
                    </td>
                  </tr>
                ) : (
                  displayed.map((r) => {
                    const fx = getFixState(r.id);
                    return (
                      <>
                        <tr
                          key={r.id}
                          className="cursor-pointer hover:bg-bg-surface"
                          onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                        >
                          <td className="px-4 py-3 font-semibold text-ink">{r.provider}</td>
                          <td className="max-w-[180px] truncate px-4 py-3 text-ink-secondary">{r.title}</td>
                          <td className="px-4 py-3">
                            {r.category ? (
                              <span className="inline-block rounded bg-bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-tertiary">
                                {r.category}
                              </span>
                            ) : (
                              <span className="text-xs text-ink-tertiary">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {fx.result?.success ? (
                              <span className="inline-block rounded-full bg-accent-emerald-soft px-2 py-0.5 text-[11px] font-semibold text-accent-emerald-strong">
                                ✓ Fixed
                              </span>
                            ) : (
                              <StatusBadge result={r} />
                            )}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-ink-secondary">
                            {confidence(r.confidence)}
                          </td>
                          <td className="max-w-[200px] truncate px-4 py-3 text-xs text-ink-tertiary">
                            {r.page_title || "—"}
                          </td>
                          <td className="max-w-[260px] px-4 py-3 text-xs text-ink-secondary">
                            {r.issues?.length
                              ? r.issues[0] + (r.issues.length > 1 ? ` +${r.issues.length - 1}` : "")
                              : r.gemini_error
                                ? r.gemini_error.slice(0, 60)
                                : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-accent-emerald">
                            {expandedId === r.id ? "▲" : "▼"}
                          </td>
                        </tr>

                        {/* Expanded row */}
                        {expandedId === r.id && (
                          <tr key={`${r.id}-exp`} className="bg-bg-surface">
                            <td colSpan={8} className="px-5 py-4">
                              <div className="grid gap-4 text-xs">

                                {/* URL info */}
                                <div className="flex flex-wrap gap-x-6 gap-y-1">
                                  <InfoRow label="Category" value={r.category || "—"} />
                                  <InfoRow label="Link" value={r.url} isLink />
                                  {r.final_url && <InfoRow label="Redirected to" value={r.final_url} isLink />}
                                  <InfoRow label="HTTP" value={String(r.http_status)} />
                                </div>

                                {/* All issues */}
                                {(r.issues?.length ?? 0) > 0 && (
                                  <div>
                                    <p className="mb-1 font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
                                      Issues
                                    </p>
                                    <ul className="grid gap-1">
                                      {r.issues!.map((issue, i) => (
                                        <li key={i} className="flex items-start gap-1.5 text-orange-700">
                                          <span className="mt-0.5 shrink-0">⚠</span>
                                          {issue}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Gemini error */}
                                {r.gemini_error && (
                                  <p className="text-red-600">
                                    <span className="font-semibold">AI error:</span> {r.gemini_error}
                                  </p>
                                )}

                                {/* Suggested status */}
                                {r.suggested_status && r.suggested_status !== "ok" && (
                                  <p className="text-ink-secondary">
                                    <span className="font-semibold">Suggested:</span>{" "}
                                    <span className="font-mono">{r.suggested_status}</span>
                                  </p>
                                )}

                                {/* ── FIX PANEL ── */}
                                {needsFix(r) && !fx.result?.success && (
                                  <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-3">
                                    <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-700">
                                      Fix this offer
                                    </p>

                                    {isMonetized(r) ? (
                                      /* ── MONETIZED: paste FinanceAds affiliate link ── */
                                      <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-[11px] text-ink-secondary">
                                          Paste the FinanceAds affiliate link:
                                        </span>
                                        <div className="flex min-w-[320px] flex-1 items-center gap-2">
                                          <input
                                            type="text"
                                            placeholder="https://tracking.financeads.net/…"
                                            value={fx.manualUrl}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              setFixFor(r.id, { manualUrl: e.target.value });
                                            }}
                                            onBlur={(e) => {
                                              const normalized = normalizeUrl(e.target.value);
                                              if (normalized !== e.target.value) {
                                                setFixFor(r.id, { manualUrl: normalized });
                                              }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex-1 rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] text-ink placeholder:text-ink-tertiary focus:border-accent-emerald focus:outline-none"
                                          />
                                          <button
                                            disabled={!!fx.loading || !fx.manualUrl.trim()}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              fixOffer(r.id, "manual");
                                            }}
                                            className="shrink-0 rounded-lg bg-accent-emerald px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-accent-emerald/90 disabled:opacity-40"
                                          >
                                            {fx.loading === "manual" ? (
                                              <span className="flex items-center gap-1.5">
                                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Applying…
                                              </span>
                                            ) : (
                                              "✅ Apply"
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* ── NON-MONETIZED: AI finds the correct provider URL ── */
                                      <div className="flex flex-wrap items-center gap-3">
                                        <button
                                          disabled={!!fx.loading}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            fixOffer(r.id, "ai-search");
                                          }}
                                          className="flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-ink/80 disabled:opacity-50"
                                        >
                                          {fx.loading === "ai" ? (
                                            <>
                                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                              Searching…
                                            </>
                                          ) : (
                                            "🤖 AI Find & Fix"
                                          )}
                                        </button>
                                        <span className="text-[11px] text-ink-tertiary">
                                          Gemini will find the correct page on the provider's site and update the link + conditions
                                        </span>
                                      </div>
                                    )}

                                    {/* Fix error */}
                                    {fx.result && !fx.result.success && (
                                      <p className="mt-2 text-[11px] text-red-600">
                                        ✗ {fx.result.error ?? "Fix failed"}
                                        {fx.result.tried_urls && fx.result.tried_urls.length > 0 && (
                                          <span className="ml-1 text-ink-tertiary">
                                            (tried {fx.result.tried_urls.length} URLs)
                                          </span>
                                        )}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* ── FIX RESULT (success) ── */}
                                {fx.result?.success && (
                                  <div className="rounded-xl border border-emerald-200 bg-accent-emerald-soft p-3">
                                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-emerald-strong">
                                      ✓ Fixed & Published
                                    </p>
                                    {fx.result.chosen_url && (
                                      <p className="mb-1 text-[11px] text-ink-secondary">
                                        <span className="font-semibold">New link:</span>{" "}
                                        <a
                                          href={fx.result.chosen_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="break-all text-accent-emerald hover:underline"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {fx.result.chosen_url}
                                        </a>
                                      </p>
                                    )}
                                    {fx.result.page_title && (
                                      <p className="mb-1 text-[11px] text-ink-secondary">
                                        <span className="font-semibold">Page:</span> {fx.result.page_title}
                                        {fx.result.confidence !== undefined && (
                                          <span className="ml-2 text-ink-tertiary">
                                            ({Math.round(fx.result.confidence * 100)}% confidence)
                                          </span>
                                        )}
                                      </p>
                                    )}
                                    {(fx.result.changes?.length ?? 0) > 0 && (
                                      <ul className="mt-1.5 grid gap-0.5">
                                        {fx.result.changes!.map((c, i) => (
                                          <li key={i} className="flex items-start gap-1 text-[11px] text-accent-emerald-strong">
                                            <span className="shrink-0">→</span>
                                            {c}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                )}

                                {/* Edit link */}
                                <a
                                  href={`/admin/offers/${r.id}`}
                                  className="w-fit text-accent-emerald hover:text-accent-emerald-strong"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Edit offer →
                                </a>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatBox({
  label,
  value,
  highlight,
  warn,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
        {label}
      </p>
      <p
        className={`mt-0.5 text-[18px] font-bold tabular-nums leading-tight ${
          highlight
            ? "text-accent-emerald-strong"
            : warn && value > 0
              ? "text-orange-600"
              : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  isLink,
}: {
  label: string;
  value: string;
  isLink?: boolean;
}) {
  return (
    <div>
      <span className="font-semibold text-ink-tertiary">{label}: </span>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-accent-emerald hover:text-accent-emerald-strong"
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </a>
      ) : (
        <span className="text-ink-secondary">{value}</span>
      )}
    </div>
  );
}
