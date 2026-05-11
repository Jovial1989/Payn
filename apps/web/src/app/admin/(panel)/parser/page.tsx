import { createSupabaseAdminClient } from "@/server/supabase/admin";

type IngestionRun = {
  id: string;
  started_at: string;
  finished_at?: string | null;
  status?: string;
  offers_imported?: number | null;
  offers_skipped?: number | null;
  error_count?: number | null;
};

type IngestionLog = {
  id: string;
  created_at: string;
  level?: string;
  message?: string;
  context?: unknown;
};

export default async function AdminParserPage() {
  const admin = createSupabaseAdminClient();

  let runs: IngestionRun[] = [];
  let logs: IngestionLog[] = [];

  if (admin) {
    const [runsResult, logsResult] = await Promise.all([
      admin
        .from("offer_ingestion_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(20),
      admin
        .from("offer_ingestion_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    runs = (runsResult.data ?? []) as IngestionRun[];
    logs = (logsResult.data ?? []) as IngestionLog[];
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Parser / Import</h1>
        <p className="mt-1 text-sm text-ink-secondary">Offer ingestion run history and logs.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
          <div className="border-b border-line px-5 py-3">
            <h2 className="text-sm font-bold text-ink">Recent runs</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-surface">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Started</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Imported</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-ink-tertiary">No runs yet.</td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id} className="hover:bg-bg-surface">
                    <td className="px-4 py-3 text-ink-secondary">{run.started_at.slice(0, 16).replace("T", " ")}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        run.status === "success"
                          ? "bg-accent-emerald-soft text-accent-emerald-strong"
                          : run.status === "error"
                            ? "bg-red-50 text-red-600"
                            : "bg-bg-surface text-ink-tertiary"
                      }`}>
                        {run.status ?? "unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{run.offers_imported ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-secondary">{run.error_count ?? 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
          <h2 className="mb-4 text-sm font-bold text-ink">Recent logs</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-ink-tertiary">No logs yet.</p>
          ) : (
            <div className="grid gap-2">
              {logs.map((log) => (
                <div key={log.id} className="rounded-[10px] bg-bg-surface px-3 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${
                      log.level === "error"
                        ? "text-red-500"
                        : log.level === "warn"
                          ? "text-orange-500"
                          : "text-accent-emerald"
                    }`}>
                      {log.level ?? "info"}
                    </span>
                    <span className="text-ink-tertiary">{log.created_at.slice(0, 16).replace("T", " ")}</span>
                  </div>
                  <p className="mt-1 text-ink-secondary">{log.message ?? "—"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
