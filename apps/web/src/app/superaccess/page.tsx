"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminSignIn } from "@/actions/admin-auth";

export default function SuperAccessPage() {
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
      setError("Invalid credentials.");
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-line bg-white p-8 shadow-card">
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
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="mt-2 h-11 rounded-xl bg-ink text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "…" : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
