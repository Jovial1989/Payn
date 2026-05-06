"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.replace("/admin");
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-surface">
      <div className="w-full max-w-sm rounded-[24px] border border-line bg-white p-8 shadow-card">
        <div className="mb-6">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-accent-emerald-soft">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="4.5" y="9" width="11" height="7.5" rx="2" stroke="#0f8a4b" strokeWidth="1.7" />
              <path d="M7.5 9V7a2.5 2.5 0 0 1 5 0v2" stroke="#0f8a4b" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-[-0.03em] text-ink">Payn Admin</h1>
          <p className="mt-1 text-sm text-ink-secondary">Internal panel — authorized access only</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="rounded-[10px] border border-line bg-bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent-emerald/30 focus:ring-2 focus:ring-accent-emerald/10"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-[10px] border border-line bg-bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent-emerald/30 focus:ring-2 focus:ring-accent-emerald/10"
            />
          </div>
          {error ? (
            <p className="text-sm font-medium text-red-500">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-[10px] bg-accent-emerald px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-emerald-strong disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
