"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// SEC-FIX SEC-002: removed NEXT_PUBLIC_ADMIN_API_TOKEN — session cookie handles auth

type Campaign = { id: string; status: string };

export function AdminMailCampaignActions({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const isMutable = campaign.status === "draft" || campaign.status === "scheduled";
  const isSent = campaign.status === "sent";

  const sendNow = async () => {
    setBusy(true);
    await fetch(`/api/admin/mail/campaigns/${campaign.id}/send`, {
      method: "POST",
    });
    router.refresh();
    setBusy(false);
  };

  const cancel = async () => {
    setBusy(true);
    await fetch(`/api/admin/mail/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "draft" }),
    });
    router.refresh();
    setBusy(false);
  };

  const duplicate = async () => {
    setBusy(true);
    const res = await fetch(`/api/admin/mail/campaigns/${campaign.id}`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json() as { id?: string };
      if (data.id) router.push(`/admin/mail/campaigns/${data.id}`);
    }
    setBusy(false);
  };

  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      {isMutable && (
        <>
          <button disabled={busy} onClick={sendNow} className="rounded-full bg-accent-emerald px-4 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong disabled:opacity-50">
            {busy ? "Sending…" : "Send now"}
          </button>
          <button disabled={busy} onClick={cancel} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-bg-surface disabled:opacity-50">
            Cancel
          </button>
        </>
      )}
      {isSent && (
        <button disabled={busy} onClick={duplicate} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-bg-surface disabled:opacity-50">
          Duplicate
        </button>
      )}
    </div>
  );
}
