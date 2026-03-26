"use client";

import { useState } from "react";

const platformLabels = {
  ios: "iPhone / iPad",
  android: "Android",
  both: "Both",
} as const;

function getSubmitLabel(platform: keyof typeof platformLabels) {
  if (platform === "both") {
    return "Join the mobile waitlist";
  }

  return `Join ${platformLabels[platform]} waitlist`;
}

export function WaitlistForm({
  initialPlatform = "both",
  source = "waitlist-page",
}: {
  initialPlatform?: "ios" | "android" | "both";
  source?: string;
}) {
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState<"ios" | "android" | "both">(initialPlatform);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/v1/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          platform,
          source,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;

      if (!response.ok) {
        setStatus("error");
        setMessage(payload?.error ?? "Could not save your waitlist request. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(payload?.message ?? "You are on the waitlist.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Could not save your waitlist request. Please try again.");
    }
  }

  return (
    <div className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
        Mobile access
      </p>
      <h2 className="mt-4 text-h2 text-ink">Register your interest</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-secondary">
        Choose the platform you care about and we will email you when the first Payn mobile release is ready.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
        <div>
          <label htmlFor="waitlist-email" className="text-xs font-semibold text-ink-secondary">
            Email
          </label>
          <input
            id="waitlist-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            disabled={status === "loading"}
            className="mt-1.5 h-12 w-full rounded-2xl border border-line bg-bg-surface px-4 text-sm text-ink placeholder:text-ink-tertiary focus:border-line-active focus:outline-none focus:ring-2 focus:ring-black/5 disabled:opacity-60"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-ink-secondary">Platform</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {(Object.keys(platformLabels) as Array<keyof typeof platformLabels>).map((value) => {
              const active = platform === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPlatform(value)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                    active
                      ? "border-black bg-black/[0.04] text-ink"
                      : "border-line bg-white text-ink-secondary hover:text-ink"
                  }`}
                >
                  {platformLabels[value]}
                </button>
              );
            })}
          </div>
        </div>

        {message && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              status === "success"
                ? "border border-emerald-100 bg-emerald-50 text-emerald-800"
                : "border border-red-100 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {status === "loading" ? "Joining waitlist..." : getSubmitLabel(platform)}
        </button>
      </form>
    </div>
  );
}
