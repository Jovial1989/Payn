import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { AdminParserControls } from "@/components/admin-parser-controls";
import { AdminPushTestForm } from "@/components/admin-push-test-form";
import { AdminEnrichmentControls } from "@/components/admin-enrichment-controls";

type IngestionRun = {
  id: string;
  started_at: string;
  finished_at?: string | null;
  status?: string | null;
  offers_imported?: number | null;
  offers_skipped?: number | null;
  error_count?: number | null;
};

type IngestionLog = {
  id: string;
  created_at: string;
  level?: string | null;
  message?: string | null;
};

type AuditEntry = {
  id: string;
  created_at: string;
  actor: string;
  action: string;
  target_id?: string | null;
  target_type?: string | null;
  metadata?: Record<string, unknown> | null;
};

export default async function AdminParserPage() {
  const admin = createSupabaseAdminClient();

  let runs: IngestionRun[] = [];
  let logs: IngestionLog[] = [];
  let audit: AuditEntry[]  = [];
  let dbOfferCount = 0;
  let notConfigured = false;

  if (admin) {
    const [runsRes, logsRes, auditRes, countRes] = await Promise.all([
      admin
        .from("offer_ingestion_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(20),
      admin
        .from("offer_ingestion_logs")
        .select("id, created_at, level, message")
        .order("created_at", { ascending: false })
        .limit(60),
      admin
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30),
      admin
        .from("marketplace_offers")
        .select("*", { count: "exact", head: true }),
    ]);

    runs  = (runsRes.data  ?? []) as IngestionRun[];
    logs  = (logsRes.data  ?? []) as IngestionLog[];
    audit = (auditRes.data ?? []) as AuditEntry[];
    dbOfferCount = countRes.count ?? 0;
  } else {
    notConfigured = true;
  }

  const statusColor = (s: string | null | undefined) => {
    if (s === "success") return "bg-accent-emerald-soft text-accent-emerald-strong";
    if (s === "error")   return "bg-red-50 text-red-600";
    if (s === "running") return "bg-blue-50 text-blue-600";
    return "bg-bg-surface text-ink-tertiary";
  };

  const logColor = (l: string | null | undefined) => {
    if (l === "error") return "text-red-500";
    if (l === "warn")  return "text-orange-500";
    return "text-accent-emerald";
  };

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Parser / Import</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          {dbOfferCount.toLocaleString()} offers in DB
          {notConfigured && (
            <span className="ml-2 font-semibold text-red-500">
              — SUPABASE_SERVICE_ROLE_KEY not set
            </span>
          )}
        </p>
      </div>

      {/* Controls */}
      <AdminParserControls />
      <AdminPushTestForm />
      <AdminEnrichmentControls />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Run history */}
        <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
          <div className="border-b border-line px-5 py-3">
            <h2 className="text-sm font-bold text-ink">Run history</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-surface">
                {["Started", "Status", "Imported", "Skipped", "Errors", "Duration"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-tertiary">
                    No runs yet. Use the controls above to trigger a run.
                  </td>
                </tr>
              ) : (
                runs.map((run) => {
                  const durationMs = run.finished_at
                    ? new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()
                    : null;
                  const duration = durationMs !== null
                    ? durationMs < 1000
                      ? `${durationMs}ms`
                      : `${(durationMs / 1000).toFixed(1)}s`
                    : "—";

                  return (
                    <tr key={run.id} className="hover:bg-bg-surface">
                      <td className="whitespace-nowrap px-4 py-3 text-ink-secondary">
                        {run.started_at.slice(0, 16).replace("T", " ")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColor(run.status)}`}>
                          {run.status ?? "unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">{run.offers_imported ?? "—"}</td>
                      <td className="px-4 py-3 text-ink-secondary">{run.offers_skipped ?? "—"}</td>
                      <td className="px-4 py-3 text-ink-secondary">{run.error_count ?? 0}</td>
                      <td className="px-4 py-3 text-ink-tertiary">{duration}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Logs */}
        <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
          <h2 className="mb-3 text-sm font-bold text-ink">Ingestion logs</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-ink-tertiary">No logs yet.</p>
          ) : (
            <div className="grid gap-2 overflow-y-auto" style={{ maxHeight: 480 }}>
              {logs.map((log) => (
                <div key={log.id} className="rounded-[10px] bg-bg-surface px-3 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${logColor(log.level)}`}>
                      {log.level ?? "info"}
                    </span>
                    <span className="text-ink-tertiary">
                      {log.created_at.slice(0, 16).replace("T", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-ink-secondary">{log.message ?? "—"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Audit log */}
      <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
        <div className="border-b border-line px-5 py-3">
          <h2 className="text-sm font-bold text-ink">Admin audit log</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-surface">
              {["When", "Action", "Target", "Actor"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {audit.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-ink-tertiary">
                  No audit entries yet.
                </td>
              </tr>
            ) : (
              audit.map((entry) => (
                <tr key={entry.id} className="hover:bg-bg-surface">
                  <td className="whitespace-nowrap px-4 py-3 text-ink-tertiary">
                    {entry.created_at.slice(0, 16).replace("T", " ")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-secondary">
                      {entry.action}
                    </span>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-ink-tertiary">
                    {entry.target_id ?? entry.target_type ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{entry.actor}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
