import { createSupabaseAdminClient } from "@/server/supabase/admin";

type Props = {
  searchParams: Promise<{ groupBy?: string }>;
};

export default async function AdminClicksPage({ searchParams }: Props) {
  const { groupBy = "offer" } = await searchParams;
  const admin = createSupabaseAdminClient();

  type Row = Record<string, string | number>;
  let data: Row[] = [];
  let totalClicks = 0;
  let clicksToday = 0;

  if (admin) {
    const [totalRes, todayRes] = await Promise.all([
      admin.from("offer_click_events").select("*", { count: "exact", head: true }),
      admin
        .from("offer_click_events")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    ]);
    totalClicks = totalRes.count ?? 0;
    clicksToday = todayRes.count ?? 0;

    if (groupBy === "offer") {
      const { data: rows } = await admin.rpc("admin_top_clicked_offers", { limit_n: 20 });
      data = (rows ?? []) as Row[];
    } else if (groupBy === "provider") {
      const { data: rows } = await admin.rpc("admin_top_clicked_providers", { limit_n: 20 });
      data = (rows ?? []) as Row[];
    } else {
      const col = groupBy === "country" ? "country" : groupBy === "category" ? "category" : "language";
      const { data: rows } = await admin.from("offer_click_events").select(col).limit(5000);
      const counts: Record<string, number> = {};
      for (const row of rows ?? []) {
        const val = String((row as Record<string, unknown>)[col] ?? "unknown");
        counts[val] = (counts[val] ?? 0) + 1;
      }
      data = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([key, count]) => ({ [col]: key, count }));
    }
  }

  const tabs = [
    { key: "offer", label: "By offer" },
    { key: "provider", label: "By provider" },
    { key: "country", label: "By country" },
    { key: "category", label: "By category" },
    { key: "language", label: "By language" },
  ];

  const colKey = groupBy === "offer" ? "offer_id" : groupBy === "provider" ? "provider_id" : groupBy;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Clicks</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          {totalClicks.toLocaleString()} total · {clicksToday.toLocaleString()} today
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <a
            key={tab.key}
            href={`/admin/clicks?groupBy=${tab.key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              groupBy === tab.key
                ? "bg-accent-emerald text-white"
                : "border border-line bg-white text-ink-secondary hover:text-ink"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-surface">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
                {colKey}
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Clicks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-sm text-ink-tertiary">No click data yet.</td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-bg-surface">
                  <td className="px-4 py-3 font-medium text-ink">{String(row[colKey] ?? "—")}</td>
                  <td className="px-4 py-3 font-bold text-accent-emerald">{Number(row.click_count ?? row.count ?? 0).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
