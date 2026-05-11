"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminOffersSeedButton({ label = "Seed from static" }: { label?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSeed() {
    if (!confirm(`${label} — this will upsert all static offers into the DB. Continue?`)) return;
    setPending(true);
    setResult(null);
    try {
      const res = await fetch("/api/v1/admin/offers/seed", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setResult(`✓ Seeded ${data.seeded} offers`);
        router.refresh();
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch {
      setResult("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleSeed}
        disabled={pending}
        className="rounded-[10px] border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-bg-surface disabled:opacity-50"
      >
        {pending ? "Seeding…" : label}
      </button>
      {result && (
        <span className={`text-xs font-medium ${result.startsWith("✓") ? "text-accent-emerald-strong" : "text-red-500"}`}>
          {result}
        </span>
      )}
    </div>
  );
}
