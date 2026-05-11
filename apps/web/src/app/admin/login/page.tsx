"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminSignIn } from "@/actions/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const result = await adminSignIn(
      form.get("email") as string,
      form.get("password") as string,
    );

    if (result.ok) {
      router.replace("/admin");
    } else {
      setError("Invalid credentials. Check your admin username and password.");
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] border border-accent-emerald/15 bg-accent-emerald-soft shadow-[0_10px_24px_rgba(15,138,75,0.10)]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="4.5" y="9" width="11" height="7.5" rx="2" stroke="#0f8a4b" strokeWidth="1.7" />
              <path d="M7.5 9V7a2.5 2.5 0 0 1 5 0v2" stroke="#0f8a4b" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-ink">Payn Admin</h1>
          <p className="mt-1 text-sm text-ink-tertiary">Internal access only</p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                Email
              </span>
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                defaultValue="admin@admin.com"
                className="h-11 rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none placeholder:text-ink-tertiary focus:border-accent-emerald/50 focus:ring-2 focus:ring-accent-emerald/15"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                Password
              </span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="h-11 rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none placeholder:text-ink-tertiary focus:border-accent-emerald/50 focus:ring-2 focus:ring-accent-emerald/15"
              />
            </label>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="h-11 rounded-xl bg-accent-emerald px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-emerald-strong disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
