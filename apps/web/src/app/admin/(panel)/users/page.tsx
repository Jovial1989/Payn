import { createSupabaseAdminClient } from "@/server/supabase/admin";

type Props = {
  searchParams: Promise<{
    page?: string; search?: string; country?: string;
    locale?: string; role?: string;
  }>;
};

const LOCALES = ["en","de","es","fr","it","pt"];

export default async function AdminUsersPage({ searchParams }: Props) {
  const { page: pageParam, search, country, locale, role } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  // Supabase admin auth has no server-side email / metadata filter, and
  // listUsers is page-based — so search + filters can only be applied to the
  // rows we actually load. Load a large page (200) so filtering covers a much
  // wider slice than the previous 50, and surface a note when filters are on.
  const perPage = 200;
  const hasFilters = Boolean(search || country || locale || role);

  const admin = createSupabaseAdminClient();

  type UserRow = {
    id: string;
    email?: string;
    created_at: string;
    last_sign_in_at?: string | null;
    provider?: string;
    role?: string;
    profile: {
      first_name?: string | null;
      last_name?: string | null;
      home_country?: string | null;
      preferred_locale?: string | null;
      user_type?: string | null;
    } | null;
    clicks: number;
    saved: number;
  };

  let users: UserRow[] = [];
  let total = 0;
  let notConfigured = false;

  if (admin) {
    const { data: authData } = await admin.auth.admin.listUsers({ page, perPage });
    let authUsers = authData?.users ?? [];
    total = (authData as { total?: number } | null)?.total ?? authUsers.length;

    // Client-side filter for email search (Supabase admin doesn't support server-side email filter)
    if (search) {
      const q = search.toLowerCase();
      authUsers = authUsers.filter(
        (u) => u.email?.toLowerCase().includes(q) ||
               u.id.toLowerCase().includes(q),
      );
    }

    const userIds = authUsers.map((u) => u.id);

    const [profilesRes, clicksRes, savedRes] = await Promise.all([
      userIds.length
        ? admin.from("user_profiles").select("*").in("user_id", userIds)
        : { data: [] },
      userIds.length
        ? admin.from("offer_click_events").select("user_id").in("user_id", userIds)
        : { data: [] },
      userIds.length
        ? admin.from("saved_offers").select("user_id").in("user_id", userIds)
        : { data: [] },
    ]);

    const profileMap = Object.fromEntries(
      (profilesRes.data ?? []).map((p) => [p.user_id, p]),
    );
    const clickMap: Record<string, number> = {};
    for (const r of clicksRes.data ?? []) {
      clickMap[r.user_id] = (clickMap[r.user_id] ?? 0) + 1;
    }
    const savedMap: Record<string, number> = {};
    for (const r of savedRes.data ?? []) {
      savedMap[r.user_id] = (savedMap[r.user_id] ?? 0) + 1;
    }

    users = authUsers.map((u) => {
      const profile = profileMap[u.id] ?? null;
      const appRole = (u.app_metadata as Record<string, unknown>)?.role as string | undefined;
      const metaRole = (u.user_metadata as Record<string, unknown>)?.role as string | undefined;
      const provider = (u.app_metadata as Record<string, unknown>)?.provider as string | undefined;
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        provider: provider ?? "email",
        role: appRole ?? metaRole ?? "user",
        profile,
        clicks: clickMap[u.id] ?? 0,
        saved: savedMap[u.id] ?? 0,
      };
    });

    // Filter by country / locale / role
    if (country) users = users.filter((u) => u.profile?.home_country === country);
    if (locale)  users = users.filter((u) => u.profile?.preferred_locale === locale);
    if (role)    users = users.filter((u) => u.role === role);
  } else {
    notConfigured = true;
  }

  const buildHref = (extra: Record<string, string>) => {
    const params = new URLSearchParams({
      ...(search  ? { search }  : {}),
      ...(country ? { country } : {}),
      ...(locale  ? { locale }  : {}),
      ...(role    ? { role }    : {}),
      ...extra,
    });
    return `/admin/users?${params.toString()}`;
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Users</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {total.toLocaleString()} total accounts
            {notConfigured && (
              <span className="ml-2 font-semibold text-red-500">
                — SUPABASE_SERVICE_ROLE_KEY not set
              </span>
            )}
          </p>
          {hasFilters && !notConfigured && (
            <p className="mt-1 text-xs text-ink-tertiary">
              Search & filters apply to the {perPage.toLocaleString()} accounts loaded on this page only — paginate to search further back.
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <form method="get" className="flex flex-wrap gap-2">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search email or user ID…"
          className="min-w-[240px] rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent-emerald/30"
        />
        <select name="locale" defaultValue={locale ?? ""} className="rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none">
          <option value="">Any language</option>
          {LOCALES.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
        </select>
        <select name="role" defaultValue={role ?? ""} className="rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none">
          <option value="">Any role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="rounded-[10px] bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/80">
          Filter
        </button>
        <a href="/admin/users" className="rounded-[10px] border border-line bg-white px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink">
          Reset
        </a>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-[20px] border border-line bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-surface">
              {["Email","Name","Country","Lang","Provider","Role","Clicks","Saved","Joined","Last sign in"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-sm text-ink-tertiary">
                  {notConfigured
                    ? "Add SUPABASE_SERVICE_ROLE_KEY to Vercel to load users."
                    : "No users found."}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-bg-surface">
                  <td className="max-w-[200px] truncate px-4 py-3 font-medium text-ink" title={u.id}>
                    {u.email ?? <span className="text-ink-tertiary">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-secondary">
                    {[u.profile?.first_name, u.profile?.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{u.profile?.home_country ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-secondary">{u.profile?.preferred_locale?.toUpperCase() ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-secondary">
                      {u.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${u.role === "admin" ? "bg-accent-emerald-soft text-accent-emerald-strong" : "bg-bg-surface text-ink-tertiary"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold tabular-nums text-ink">{u.clicks}</td>
                  <td className="px-4 py-3 text-center tabular-nums text-ink-secondary">{u.saved}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-secondary">{u.created_at.slice(0, 10)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-secondary">{u.last_sign_in_at?.slice(0, 10) ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > perPage && (
        <div className="flex items-center gap-3 text-sm">
          {page > 1 && (
            <a href={buildHref({ page: String(page - 1) })}
              className="rounded-[10px] border border-line bg-white px-4 py-2 font-medium text-ink hover:bg-bg-surface">
              ← Previous
            </a>
          )}
          <span className="text-ink-tertiary">Page {page} of {Math.ceil(total / perPage)}</span>
          {page * perPage < total && (
            <a href={buildHref({ page: String(page + 1) })}
              className="rounded-[10px] border border-line bg-white px-4 py-2 font-medium text-ink hover:bg-bg-surface">
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
