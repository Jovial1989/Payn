"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN ?? "";

type Campaign = { id: string; status: string };

export function AdminPushCampaignActions({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const action = async (act: "send" | "cancel" | "duplicate") => {
    setBusy(true);
    const res = await fetch(`/api/admin/push/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-token": ADMIN_TOKEN },
      body: JSON.stringify({ action: act }),
    });
    if (res.ok && act === "duplicate") {
      const data = await res.json() as { id?: string };
      if (data.id) router.push(`/admin/push/${data.id}`);
    } else {
      router.refresh();
    }
    setBusy(false);
  };

  const isMutable = campaign.status === "draft" || campaign.status === "scheduled";
  const isSent = campaign.status === "sent";

  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      {isMutable && (
        <>
          <button
            disabled={busy}
            onClick={() => action("send")}
            className="rounded-full bg-accent-emerald px-4 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send now"}
          </button>
          <button
            disabled={busy}
            onClick={() => action("cancel")}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-bg-surface disabled:opacity-50"
          >
            Cancel
          </button>
        </>
      )}
      {isSent && (
        <button
          disabled={busy}
          onClick={() => action("duplicate")}
          className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-bg-surface disabled:opacity-50"
        >
          Duplicate
        </button>
      )}
    </div>
  );
}
