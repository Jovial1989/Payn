"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function AdminParserControls() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function trigger(action: string) {
    setLoading(action);
    setStatus(null);
    try {
      const res  = await fetch("/api/v1/admin/parser/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) {
        setStatus(`Error: ${data.error ?? "Unknown"}`);
      } else if (action === "resync") {
        setStatus(`Re-synced ${data.seeded ?? 0} offers successfully.`);
      } else if (action === "dedupe") {
        setStatus(`Removed ${data.removed ?? 0} duplicate(s).`);
      }
      router.refresh();
    } catch {
      setStatus("Network error");
    } finally {
      setLoading(null);
    }
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading("csv");
    setStatus(null);

    try {
      const text  = await file.text();
      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows = lines.slice(1).map((line) => {
        const vals = line.split(",");
        return Object.fromEntries(headers.map((h, i) => [h, vals[i]?.trim() ?? ""]));
      });
      setStatus(`Parsed ${rows.length} rows. (CSV import requires a manual DB step — rows shown in console.)`);
      console.info("[CSV import preview]", rows.slice(0, 5));
    } catch {
      setStatus("Failed to parse CSV.");
    } finally {
      setLoading(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const btn = "rounded-[10px] border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-bg-surface disabled:opacity-40 transition-colors";

  return (
    <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
      <h2 className="mb-4 text-sm font-bold text-ink">Controls</h2>
      <div className="flex flex-wrap gap-3">
        <button
          className={btn}
          disabled={!!loading}
          onClick={() => trigger("resync")}
        >
          {loading === "resync" ? "Running…" : "Re-sync static offers"}
        </button>
        <button
          className={btn}
          disabled={!!loading}
          onClick={() => trigger("dedupe")}
        >
          {loading === "dedupe" ? "Running…" : "Remove duplicates"}
        </button>
        <label className={btn + " cursor-pointer"}>
          {loading === "csv" ? "Reading…" : "Import CSV"}
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCsvUpload}
            disabled={!!loading}
          />
        </label>
      </div>
      {status && (
        <p className={`mt-3 rounded-xl px-3 py-2.5 text-sm ${
          status.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-accent-emerald-soft text-accent-emerald-strong"
        }`}>
          {status}
        </p>
      )}
    </div>
  );
}
