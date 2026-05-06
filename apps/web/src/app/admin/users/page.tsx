import { createSupabaseAdminClient } from "@/server/supabase/admin";

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminUsersPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  const perPage = 50;

  const admin = createSupabaseAdminClient();

  let users: {
    id: string;
    email?: string;
    created_at: string;
    last_sign_in_at?: string | null;
    profile: {
      first_name?: string | null;
      last_name?: string | null;
      home_country?: string | null;
      preferred_locale?: string | null;
      user_type?: string | null;
    } | null;
  }[] = [];
  let total = 0;

  if (admin) {
    const { data: authData } = await admin.auth.admin.listUsers({ page, perPage });
    const authUsers = authData?.users ?? [];
    total = authData?.total ?? authUsers.length;
    const userIds = authUsers.map((u) => u.id);
    const { data: profiles } = userIds.length
      ? await admin.from("user_profiles").select("*").in("user_id", userIds)
      : { data: [] };
    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));
    users = authUsers.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      profile: profileMap[u.id] ?? null,
    }));
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Users</h1>
          <p className="mt-1 text-sm text-ink-secondary">{total} total accounts</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-surface">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Email</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Name</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Country</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Type</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Joined</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Last sign in</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-tertiary">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-bg-surface">
                  <td className="px-4 py-3 font-medium text-ink">{u.email ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-secondary">
                    {[u.profile?.first_name, u.profile?.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{u.profile?.home_country ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-secondary">{u.profile?.user_type ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-secondary">{u.created_at.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-ink-secondary">{u.last_sign_in_at?.slice(0, 10) ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > perPage ? (
        <div className="flex items-center gap-3 text-sm">
          {page > 1 ? (
            <a
              href={`/admin/users?page=${page - 1}`}
              className="rounded-[10px] border border-line bg-white px-4 py-2 font-medium text-ink hover:bg-bg-surface"
            >
              Previous
            </a>
          ) : null}
          <span className="text-ink-secondary">Page {page} of {Math.ceil(total / perPage)}</span>
          {page * perPage < total ? (
            <a
              href={`/admin/users?page=${page + 1}`}
              className="rounded-[10px] border border-line bg-white px-4 py-2 font-medium text-ink hover:bg-bg-surface"
            >
              Next
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
