"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN ?? "";

export function AdminMailMessageActions({
  messageId,
  subject,
  toAddress,
}: {
  messageId: string;
  subject: string;
  toAddress: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const markFailed = async () => {
    setBusy(true);
    await fetch(`/api/admin/mail/messages/${messageId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-token": ADMIN_TOKEN },
      body: JSON.stringify({ status: "failed" }),
    });
    router.refresh();
    setBusy(false);
  };

  const resend = () => {
    const params = new URLSearchParams({ to: toAddress, subject, messageId });
    router.push(`/admin/mail/compose?${params.toString()}`);
  };

  return (
    <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Actions</p>
      <div className="mt-3 grid gap-2">
        <button
          onClick={resend}
          className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-bg-surface"
        >
          Resend (clone to compose)
        </button>
        <button
          disabled={busy}
          onClick={markFailed}
          className="rounded-xl border border-red-100 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Mark as failed
        </button>
      </div>
    </div>
  );
}
