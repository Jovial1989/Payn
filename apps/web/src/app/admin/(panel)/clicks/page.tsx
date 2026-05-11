import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { ClicksExportButton } from "@/components/admin-clicks-export-button";

type Props = {
  searchParams: Promise<{ tab?: string; days?: string }>;
};

export default async function AdminClicksPage({ searchParams }: Props) {
  const { tab = "overview", days: daysParam = "30" } = await searchParams;
  const days = Math.min(90, Math.max(1, Number(daysParam) || 30));

  const admin = createSupabaseAdminClient();

  type SummaryRow = {
    total_clicks: number;
    clicks_today: number;
    monetised_clicks: number;
    mobile_clicks: number;
    unique_offers: number;
    unique_providers: number;
  };
  type DayRow = { day: string; click_count: number; monetised_count: number };
  type RankRow = Record<string, string | number>;

  let summary: SummaryRow = {
    total_clicks: 0, clicks_today: 0, monetised_clicks: 0,
    mobile_clicks: 0, unique_offers: 0, unique_providers: 0,
  };
  let byDay: DayRow[] = [];
  let byOffer: RankRow[] = [];
  let byProvider: RankRow[] = [];
  let byCountry: RankRow[] = [];
  let notConfigured = false;

  if (admin) {
    const [summaryRes, dayRes, offerRes, providerRes, countryRes] = await Promise.all([
      admin.rpc("admin_clicks_summary"),
      admin.rpc("admin_clicks_by_day", { days_back: days }),
      admin.rpc("admin_top_clicked_offers", { limit_n: 20 }),
      admin.rpc("admin_top_clicked_providers", { limit_n: 20 }),
      admin
        .from("offer_click_events")
        .select("country")
        .limit(5000),
    ]);

    if (summaryRes.data) {
      const r = Array.isArray(summaryRes.data) ? summaryRes.data[0] : summaryRes.data;
      summary = {
        total_clicks:     Number(r?.total_clicks ?? 0),
        clicks_today:     Number(r?.clicks_today ?? 0),
        monetised_clicks: Number(r?.monetised_clicks ?? 0),
        mobile_clicks:    Number(r?.mobile_clicks ?? 0),
        unique_offers:    Number(r?.unique_offers ?? 0),
        unique_providers: Number(r?.unique_providers ?? 0),
      };
    }

    byDay = ((dayRes.data ?? []) as DayRow[]).sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime(),
    );
    byOffer    = (offerRes.data    ?? []) as RankRow[];
    byProvider = (providerRes.data ?? []) as RankRow[];

    const countryCounts: Record<string, number> = {};
    for (const row of countryRes.data ?? []) {
      const c = (row as Record<string, unknown>).country as string | null;
      const k = c || "unknown";
      countryCounts[k] = (countryCounts[k] ?? 0) + 1;
    }
    byCountry = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([country, count]) => ({ country, count }));
  } else {
    notConfigured = true;
  }

  const monetisedPct = summary.total_clicks
    ? Math.round((summary.monetised_clicks / summary.total_clicks) * 100)
    : 0;
  const mobilePct = summary.total_clicks
    ? Math.round((summary.mobile_clicks / summary.total_clicks) * 100)
    : 0;

  const maxDay = byDay.reduce((m, r) => Math.max(m, r.click_count), 1);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "offers",   label: "By offer" },
    { key: "providers",label: "By provider" },
    { key: "countries",label: "By country" },
  ];

  const buildHref = (t: string) =>
    `/admin/clicks?tab=${t}&days=${days}`;
  const buildDaysHref = (d: number) =>
    `/admin/clicks?tab=${tab}&days=${d}`;

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Clicks</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {summary.total_clicks.toLocaleString()} total clicks ·{" "}
            {summary.clicks_today.toLocaleString()} today
            {notConfigured && (
              <span className="ml-2 font-semibold text-red-500">
                — SUPABASE_SERVICE_ROLE_KEY not set
              </span>
            )}
          </p>
        </div>
        <ClicksExportButton />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total clicks",    value: summary.total_clicks.toLocaleString() },
          { label: "Today",           value: summary.clicks_today.toLocaleString() },
          { label: "Monetised",       value: `${summary.monetised_clicks.toLocaleString()} (${monetisedPct}%)` },
          { label: "Mobile",          value: `${summary.mobile_clicks.toLocaleString()} (${mobilePct}%)` },
          { label: "Unique offers",   value: summary.unique_offers.toLocaleString() },
          { label: "Unique providers",value: summary.unique_providers.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-[16px] border border-line bg-white p-4 shadow-card">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">{label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* Day range picker */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Period:</span>
        {[7, 14, 30, 60, 90].map((d) => (
          <a
            key={d}
            href={buildDaysHref(d)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              days === d
                ? "bg-accent-emerald text-white"
                : "border border-line bg-white text-ink-secondary hover:text-ink"
            }`}
          >
            {d}d
          </a>
        ))}
      </div>

      {/* Clicks by day chart */}
      {byDay.length > 0 && (
        <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
          <h2 className="mb-4 text-sm font-bold text-ink">Clicks per day (last {days} days)</h2>
          <div className="flex items-end gap-1" style={{ height: 120 }}>
            {byDay.map((r) => {
              const totalH = Math.max(4, Math.round((r.click_count / maxDay) * 100));
              const monoH  = Math.round((r.monetised_count / r.click_count) * totalH);
              return (
                <div
                  key={r.day}
                  className="group relative flex flex-1 flex-col justify-end"
                  style={{ height: 120 }}
                  title={`${r.day}: ${r.click_count} clicks, ${r.monetised_count} monetised`}
                >
                  <div className="w-full overflow-hidden rounded-t-sm bg-bg-surface" style={{ height: totalH }}>
                    <div className="w-full rounded-t-sm bg-accent-emerald/30" style={{ height: totalH - monoH }} />
                    <div className="w-full bg-accent-emerald" style={{ height: monoH }} />
                  </div>
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-[10px] text-white group-hover:block">
                    {r.day.slice(5)}: {r.click_count}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-ink-tertiary">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-accent-emerald" /> Monetised
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-accent-emerald/30" /> Non-monetised
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <a
            key={t.key}
            href={buildHref(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-accent-emerald text-white"
                : "border border-line bg-white text-ink-secondary hover:text-ink"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <RankTable title="Top offers" rows={byOffer} keyCol="offer_id" />
          <RankTable title="Top providers" rows={byProvider} keyCol="provider_id" />
        </div>
      )}

      {tab === "offers" && (
        <RankTable title="Clicks by offer" rows={byOffer} keyCol="offer_id" full />
      )}

      {tab === "providers" && (
        <RankTable title="Clicks by provider" rows={byProvider} keyCol="provider_id" full />
      )}

      {tab === "countries" && (
        <RankTable title="Clicks by country" rows={byCountry} keyCol="country" full />
      )}
    </div>
  );
}

function RankTable({
  title,
  rows,
  keyCol,
  full = false,
}: {
  title: string;
  rows: Record<string, string | number>[];
  keyCol: string;
  full?: boolean;
}) {
  const maxVal = rows.reduce((m, r) => Math.max(m, Number(r.click_count ?? r.count ?? 0)), 1);

  return (
    <div className={`overflow-hidden rounded-[20px] border border-line bg-white shadow-card ${full ? "" : ""}`}>
      <div className="border-b border-line px-5 py-3">
        <h2 className="text-sm font-bold text-ink">{title}</h2>
      </div>
      <div className="divide-y divide-line">
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-tertiary">No data yet.</p>
        ) : (
          rows.map((row, i) => {
            const label = String(row[keyCol] ?? "—");
            const count = Number(row.click_count ?? row.count ?? 0);
            const pct   = Math.round((count / maxVal) * 100);
            return (
              <div key={i} className="relative px-5 py-3">
                <div
                  className="absolute inset-y-0 left-0 bg-accent-emerald/5"
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between gap-4">
                  <span className="truncate text-sm font-medium text-ink">{label}</span>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-accent-emerald">
                    {count.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
