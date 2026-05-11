"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminOffersDeleteButton({
  offerId,
  providerName,
}: {
  offerId: string;
  providerName: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete / archive "${providerName}" (${offerId})?\n\nDB offers are deleted. Static offers are archived.`)) return;
    setPending(true);
    try {
      await fetch(`/api/v1/admin/offers/${offerId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-[11px] font-semibold text-red-400 hover:text-red-600 disabled:opacity-40"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
