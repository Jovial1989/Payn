"use client";

import { useState } from "react";
import type { FinanceAdsSyncReport, ProgramSyncRow } from "@/server/offers/financeads-sync";
import type { DiscoveryItem, DiscoveryReport } from "@/server/offers/offer-discovery-engine";
import type { CatalogReviewReport } from "@/server/offers/catalog-review";

const MARKET_CATEGORIES = [
  "transfers", "cards", "savings", "loans", "banking",
  "investments", "crypto", "insurance", "business",
] as const;

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return data as T;
}

function Pill({ tone, children }: { tone: "ok" | "warn" | "muted" | "info"; children: React.ReactNode }) {
  const map = {
    ok: "bg-accent-emerald-soft text-accent-emerald-strong",
    warn: "bg-orange-50 text-orange-600",
    muted: "bg-bg-surface text-ink-tertiary",
    info: "bg-blue-50 text-blue-600",
  } as const;
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${map[tone]}`}>
      {children}
    </span>
  );
}

function Button({
  onClick,
  disabled,
  variant = "secondary",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}) {
  const base =
    "rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-accent-emerald text-white hover:bg-accent-emerald-strong"
      : "border border-line-strong text-ink hover:bg-bg-surface";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

// ─── Section 0: Catalog Review (health score) ────────────────────────────────

function scoreTone(score: number): "ok" | "warn" | "muted" {
  if (score >= 85) return "ok";
  if (score >= 65) return "warn";
  return "muted";
}

function ReviewSection() {
  const [loading, setLoading] = useState<"dry" | "apply" | null>(null);
  const [report, setReport] = useState<CatalogReviewReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(apply: boolean) {
    setLoading(apply ? "apply" : "dry");
    setError(null);
    try {
      setReport(await postJson<CatalogReviewReport>("/api/admin/catalog-review", { apply }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review failed");
    } finally {
      setLoading(null);
    }
  }

  const t = report?.totals;
  const tone = report ? scoreTone(report.healthScore) : "muted";
  const scoreColor =
    tone === "ok" ? "text-accent-emerald-strong" : tone === "warn" ? "text-orange-600" : "text-red-500";

  return (
    <section className="rounded-[20px] border border-line bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-[-0.02em] text-ink">Catalog review</h2>
          <p className="mt-1 max-w-xl text-sm text-ink-secondary">
            Audits every offer for relevance — link health, monetisation coverage, freshness, and a
            rotating Gemini deep-check. Runs automatically every 3 days; heals what it safely can.
          </p>
        </div>
        {report && (
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
              Health score
            </p>
            <p className={`text-4xl font-extrabold tabular-nums ${scoreColor}`}>{report.healthScore}</p>
            <p className="text-[11px] text-ink-tertiary">/ 100</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => run(false)} disabled={loading !== null}>
          {loading === "dry" ? "Auditing…" : "Run review (dry run)"}
        </Button>
        <Button variant="primary" onClick={() => run(true)} disabled={loading !== null}>
          {loading === "apply" ? "Healing…" : "Run + auto-heal"}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-red-500">{error}</p>}

      {report && t && (
        <div className="mt-5">
          <div className="flex flex-wrap gap-4 text-sm">
            <Metric label="Offers" value={t.offers} />
            <Metric label="Links OK" value={t.linkOk} ok={t.linkOk === t.offers} />
            <Metric label="Dead links" value={t.deadLinks} warn={t.deadLinks > 0} />
            <Metric label="Monetisation gaps" value={t.monetizationGaps} warn={t.monetizationGaps > 0} />
            <Metric label="Coverage %" value={report.monetizationCoveragePct} ok={report.monetizationCoveragePct >= 95} />
            <Metric label="Stale" value={t.stale} />
            <Metric label="Deep-checked" value={t.deepChecked} />
            <Metric label="Relevance fails" value={t.relevanceFails} warn={t.relevanceFails > 0} />
          </div>
          {report.applied &&
            (report.autoFixed.relinked > 0 || report.autoFixed.flaggedDead > 0 || report.autoFixed.removed > 0) && (
              <p className="mt-2 text-xs font-semibold text-accent-emerald-strong">
                ✓ Auto-healed: {report.autoFixed.relinked} re-monetised, {report.autoFixed.removed} removed (dead),{" "}
                {report.autoFixed.flaggedDead} flagged for review.
              </p>
            )}

          {report.monetizationGaps.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">
                Monetisation gaps (partner, not yet earning)
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {report.monetizationGaps.map((g, i) => (
                  <span key={`${g.provider}-${i}`} className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
                    {g.provider} · {g.category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {report.worstOffers.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">
                Lowest-scoring offers
              </p>
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-tertiary">
                    <th className="py-2 pr-3 font-semibold">Score</th>
                    <th className="px-3 py-2 font-semibold">Offer</th>
                    <th className="px-3 py-2 font-semibold">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {report.worstOffers.slice(0, 20).map((o, i) => (
                    <tr key={`${o.slug}-${i}`} className="border-b border-line/60 align-top">
                      <td className="py-2 pr-3">
                        <span className={`font-bold tabular-nums ${scoreColor}`}>{o.relevanceScore}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-medium text-ink">{o.provider}</span>
                        <span className="block text-[11px] text-ink-tertiary">{o.title} · {o.category}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="flex flex-wrap gap-1">
                          {o.issues.map((iss) => (
                            <span key={iss} className="rounded bg-bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink-secondary">
                              {iss.replace(/_/g, " ")}
                            </span>
                          ))}
                          {o.fixed.length > 0 && (
                            <span className="rounded bg-accent-emerald-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent-emerald-strong">
                              ✓ {o.fixed[0]}
                            </span>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Section 1: FinanceAds sync ──────────────────────────────────────────────

function SyncSection() {
  const [loading, setLoading] = useState<"dry" | "apply" | null>(null);
  const [report, setReport] = useState<FinanceAdsSyncReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(apply: boolean) {
    setLoading(apply ? "apply" : "dry");
    setError(null);
    try {
      setReport(await postJson<FinanceAdsSyncReport>("/api/admin/financeads-sync", { apply }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setLoading(null);
    }
  }

  const outcomePill = (row: ProgramSyncRow) => {
    if (row.outcome === "matched") return <Pill tone="ok">{row.matchedOffers.length} matched</Pill>;
    if (row.outcome === "unmatched") return <Pill tone="warn">no catalog match</Pill>;
    if (row.outcome === "no_material") return <Pill tone="muted">no link</Pill>;
    return <Pill tone="warn">error</Pill>;
  };

  return (
    <section className="rounded-[20px] border border-line bg-white p-5 shadow-card">
      <h2 className="text-lg font-bold tracking-[-0.02em] text-ink">1 · FinanceAds sync</h2>
      <p className="mt-1 text-sm text-ink-secondary">
        Pull every accepted partnership + its tracking link, match to catalog offers, and mark them
        monetised with the live affiliate link. Preview first.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => run(false)} disabled={loading !== null}>
          {loading === "dry" ? "Previewing…" : "Preview (dry run)"}
        </Button>
        <Button variant="primary" onClick={() => run(true)} disabled={loading !== null}>
          {loading === "apply" ? "Applying…" : "Apply → write links"}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-red-500">{error}</p>}

      {report && (
        <div className="mt-5">
          <div className="flex flex-wrap gap-4 text-sm">
            <Metric label="Programs" value={report.programsTotal} />
            <Metric label="With link" value={report.withTrackingLink} />
            <Metric label="Matched" value={report.matchedPrograms} />
            <Metric label="Unmatched" value={report.unmatchedPrograms} warn={report.unmatchedPrograms > 0} />
            <Metric label={report.applied ? "Offers updated" : "Would update"} value={report.offersUpdated} ok={report.offersUpdated > 0} />
          </div>
          {report.applied && (
            <p className="mt-2 text-xs font-semibold text-accent-emerald-strong">
              ✓ Applied — catalog cache revalidated.
            </p>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-tertiary">
                  <th className="py-2 pr-3 font-semibold">Program</th>
                  <th className="px-3 py-2 font-semibold">Country</th>
                  <th className="px-3 py-2 font-semibold">Commission</th>
                  <th className="px-3 py-2 font-semibold">Outcome</th>
                  <th className="px-3 py-2 font-semibold">Matched offers</th>
                </tr>
              </thead>
              <tbody>
                {report.rows
                  .slice()
                  .sort((a, b) => b.matchedOffers.length - a.matchedOffers.length)
                  .map((row) => (
                    <tr key={row.programId} className="border-b border-line/60 align-top">
                      <td className="py-2 pr-3 font-medium text-ink">
                        {row.programName}
                        {row.cookieDays != null && (
                          <span className="ml-1 text-[11px] text-ink-tertiary">· {row.cookieDays}d cookie</span>
                        )}
                      </td>
                      <td className="px-3 py-2 uppercase text-ink-secondary">{row.country ?? "—"}</td>
                      <td className="px-3 py-2 text-ink-secondary">{row.commission}</td>
                      <td className="px-3 py-2">{outcomePill(row)}</td>
                      <td className="px-3 py-2 text-ink-secondary">
                        {row.matchedOffers.length === 0 ? (
                          <span className="text-ink-tertiary">—</span>
                        ) : (
                          <ul className="grid gap-0.5">
                            {row.matchedOffers.map((m) => (
                              <li key={m.id} className="flex items-center gap-1.5">
                                <span className="text-ink">{m.providerName}</span>
                                <span className="text-ink-tertiary">· {m.category}</span>
                                {m.willChange ? (
                                  <Pill tone="warn">will change</Pill>
                                ) : (
                                  <Pill tone="muted">up to date</Pill>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Section 2: Gemini discovery ─────────────────────────────────────────────

function DiscoverySection() {
  const [loading, setLoading] = useState<"dry" | "apply" | null>(null);
  const [report, setReport] = useState<DiscoveryReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"programs" | "market">("programs");
  const [categories, setCategories] = useState<string[]>(["transfers", "cards", "savings"]);
  const [country, setCountry] = useState("EU");

  function toggleCategory(cat: string) {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  async function run(apply: boolean) {
    setLoading(apply ? "apply" : "dry");
    setError(null);
    try {
      setReport(
        await postJson<DiscoveryReport>("/api/admin/discover-offers", {
          apply,
          mode,
          categories: mode === "market" ? categories : undefined,
          country: mode === "market" ? country : undefined,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Discovery failed");
    } finally {
      setLoading(null);
    }
  }

  const decisionPill = (item: DiscoveryItem) => {
    if (item.decision === "published") return <Pill tone="ok">published</Pill>;
    if (item.decision === "needs_review") return <Pill tone="warn">needs review</Pill>;
    if (item.decision === "skipped_duplicate") return <Pill tone="muted">duplicate</Pill>;
    return <Pill tone="info">invalid</Pill>;
  };

  return (
    <section className="rounded-[20px] border border-line bg-white p-5 shadow-card">
      <h2 className="text-lg font-bold tracking-[-0.02em] text-ink">2 · Gemini discovery</h2>
      <p className="mt-1 text-sm text-ink-secondary">
        Research new offers, validate that links resolve to the right provider, then publish verified
        ones (high confidence + working link) or queue the rest for review.
      </p>

      <div className="mt-4 inline-flex rounded-[10px] border border-line p-0.5">
        {(["programs", "market"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-[8px] px-3 py-1.5 text-sm font-semibold transition-colors ${
              mode === m ? "bg-accent-emerald-soft text-accent-emerald-strong" : "text-ink-secondary hover:text-ink"
            }`}
          >
            {m === "programs" ? "Partner backfill" : "Open market"}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-tertiary">
        {mode === "programs"
          ? "Builds offers for partnered programs we don't list yet — monetised, link-verified."
          : "Finds providers we don't list in the chosen categories. Monetised where a partnership exists."}
      </p>

      {mode === "market" && (
        <div className="mt-4 grid gap-3">
          <div className="flex flex-wrap gap-1.5">
            {MARKET_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                  categories.includes(cat)
                    ? "bg-accent-emerald text-white"
                    : "border border-line text-ink-secondary hover:bg-bg-surface"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            Country / region
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 14))}
              className="w-24 rounded-[8px] border border-line px-2 py-1 text-sm uppercase text-ink"
              placeholder="EU"
            />
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => run(false)} disabled={loading !== null}>
          {loading === "dry" ? "Researching…" : "Preview (dry run)"}
        </Button>
        <Button variant="primary" onClick={() => run(true)} disabled={loading !== null}>
          {loading === "apply" ? "Publishing…" : "Run → publish verified"}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-red-500">{error}</p>}

      {report && (
        <div className="mt-5">
          <div className="flex flex-wrap gap-4 text-sm">
            <Metric label="Considered" value={report.considered} />
            <Metric label={report.applied ? "Published" : "Would publish"} value={report.published} ok={report.published > 0} />
            <Metric label="Queued" value={report.queued} warn={report.queued > 0} />
            <Metric label="Skipped" value={report.skipped} />
          </div>
          {report.capped && (
            <p className="mt-2 text-xs font-semibold text-orange-600">
              ⚠ Capped at {report.items.length} this run — run again to continue.
            </p>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-tertiary">
                  <th className="py-2 pr-3 font-semibold">Provider</th>
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 font-semibold">Conf.</th>
                  <th className="px-3 py-2 font-semibold">Monetised</th>
                  <th className="px-3 py-2 font-semibold">Decision</th>
                  <th className="px-3 py-2 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody>
                {report.items.map((item, i) => (
                  <tr key={`${item.providerName}-${i}`} className="border-b border-line/60 align-top">
                    <td className="py-2 pr-3">
                      <span className="font-medium text-ink">{item.providerName}</span>
                      {item.providerDomain && (
                        <span className="block text-[11px] text-ink-tertiary">{item.providerDomain}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-ink-secondary">{item.category}</td>
                    <td className="px-3 py-2 tabular-nums text-ink-secondary">{Math.round(item.confidence * 100)}%</td>
                    <td className="px-3 py-2">
                      {item.monetized ? <Pill tone="ok">yes</Pill> : <Pill tone="muted">no</Pill>}
                    </td>
                    <td className="px-3 py-2">{decisionPill(item)}</td>
                    <td className="px-3 py-2 text-xs text-ink-tertiary">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value, ok, warn }: { label: string; value: number; ok?: boolean; warn?: boolean }) {
  return (
    <div className="min-w-[96px]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">{label}</p>
      <p
        className={`mt-0.5 text-lg font-bold tabular-nums ${
          ok ? "text-accent-emerald-strong" : warn ? "text-orange-600" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function AdminFinanceadsControls() {
  return (
    <div className="grid gap-6">
      <ReviewSection />
      <SyncSection />
      <DiscoverySection />
    </div>
  );
}
