"use client";

import { useState } from "react";

// SEC-FIX SEC-002: removed NEXT_PUBLIC_ADMIN_API_TOKEN — session cookie handles auth

export function AdminPushTestForm() {
  const [token, setToken] = useState("");
  const [title, setTitle] = useState("Test from Payn Admin");
  const [body, setBody] = useState("Push notification working ✓");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/push/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, title, body }),
      });
      const data = await res.json() as unknown;
      setResult(JSON.stringify(data, null, 2));
    } catch (e: unknown) {
      setResult(e instanceof Error ? e.message : "Error");
    }
    setLoading(false);
  };

  return (
    <div className="rounded-[20px] border border-line bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Send test push</p>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1">
          <span className="text-xs font-medium text-ink-secondary">FCM Token</span>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste a device FCM token…"
            className="h-10 rounded-xl border border-line bg-bg-surface px-3 font-mono text-xs text-ink outline-none focus:border-accent-emerald"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-medium text-ink-secondary">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-medium text-ink-secondary">Body</span>
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
          />
        </label>
        <button
          type="button"
          disabled={loading || !token.trim()}
          onClick={send}
          className="self-start rounded-full bg-accent-emerald px-5 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send test"}
        </button>
        {result && (
          <pre className="overflow-auto rounded-xl border border-line bg-bg-surface p-3 font-mono text-xs text-ink-secondary">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}
