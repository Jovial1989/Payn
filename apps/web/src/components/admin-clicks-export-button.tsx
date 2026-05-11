"use client";

import { useState } from "react";

export function ClicksExportButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/clicks/export");
      if (!res.ok) { alert("Export failed"); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `clicks-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="rounded-[10px] border border-line bg-white px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink disabled:opacity-50"
    >
      {loading ? "Exporting…" : "Export CSV"}
    </button>
  );
}
