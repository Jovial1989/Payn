"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TEMPLATE_REGISTRY, type TemplateId } from "@/lib/email/templates";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN ?? "";

type UserResult = { id: string; email: string };
type SendResult = { id: string; to: string; status: string; error?: string };

function UserPickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (emails: string[]) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/mail/users?q=${encodeURIComponent(query)}`, {
          headers: { "x-admin-token": ADMIN_TOKEN },
        });
        if (res.ok) setResults(await res.json() as UserResult[]);
      } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const toggle = (email: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-[20px] border border-line bg-white p-6 shadow-elevated">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Select users</h2>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink">✕</button>
        </div>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email…"
          className="h-10 w-full rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
        />
        <div className="mt-3 max-h-64 overflow-y-auto">
          {loading && <p className="py-3 text-center text-sm text-ink-tertiary">Loading…</p>}
          {!loading && results.length === 0 && query && (
            <p className="py-3 text-center text-sm text-ink-tertiary">No users found.</p>
          )}
          {results.map((u) => (
            <label key={u.id} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-bg-surface">
              <input type="checkbox" checked={selected.has(u.email)} onChange={() => toggle(u.email)} className="accent-accent-emerald" />
              <span className="text-sm text-ink">{u.email}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-bg-surface">Cancel</button>
          <button
            onClick={() => { onSelect(Array.from(selected)); onClose(); }}
            disabled={selected.size === 0}
            className="rounded-full bg-accent-emerald px-4 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong disabled:opacity-50"
          >
            Add {selected.size > 0 ? `(${selected.size})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminMailComposePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTemplate = (searchParams.get("template") ?? "") as TemplateId | "";

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId | "">(initialTemplate);
  const [templateProps, setTemplateProps] = useState<Record<string, string>>({});
  const [customHtml, setCustomHtml] = useState("");
  const [customText, setCustomText] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [tags, setTags] = useState("");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SendResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const templateIds = Object.keys(TEMPLATE_REGISTRY) as TemplateId[];

  // Auto-fill subject from registry default
  useEffect(() => {
    if (templateId && !subject) {
      setSubject(TEMPLATE_REGISTRY[templateId].defaultSubject);
    }
    if (templateId) {
      const sample = TEMPLATE_REGISTRY[templateId].sampleProps;
      setTemplateProps(Object.fromEntries(
        Object.entries(sample).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])
      ));
    } else {
      setTemplateProps({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  // Live preview
  useEffect(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(async () => {
      if (!templateId && !customHtml) { setPreviewHtml(null); return; }
      try {
        const body = templateId
          ? { templateId, props: templateProps }
          : { templateId: null, props: {}, html: customHtml };
        const res = await fetch("/api/admin/mail/preview", {
          method: "POST",
          headers: { "content-type": "application/json", "x-admin-token": ADMIN_TOKEN },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json() as { html: string };
          setPreviewHtml(data.html);
        }
      } catch { /* ignore */ }
    }, 500);
    return () => { if (previewTimer.current) clearTimeout(previewTimer.current); };
  }, [templateId, templateProps, customHtml]);

  const buildPayload = useCallback((recipients: string[]) => {
    const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => {
      const [name, ...rest] = t.split(":");
      return { name: name.trim(), value: rest.join(":").trim() };
    });
    return {
      to: recipients,
      subject,
      ...(replyTo && { replyTo }),
      ...(parsedTags.length && { tags: parsedTags }),
      ...(templateId
        ? {
            templateId,
            templateProps: Object.fromEntries(
              Object.entries(templateProps).map(([k, v]) => {
                try { return [k, JSON.parse(v)]; } catch { return [k, v]; }
              })
            ),
          }
        : { html: customHtml, text: customText || undefined }),
    };
  }, [subject, replyTo, tags, templateId, templateProps, customHtml, customText]);

  const send = useCallback(async (testOnly: boolean) => {
    setError(null);
    if (!subject.trim()) { setError("Subject is required."); return; }
    const recipients = to.split(",").map((e) => e.trim()).filter(Boolean);
    if (!testOnly && recipients.length === 0) { setError("Add at least one recipient."); return; }
    if (testOnly && recipients.length === 0) { setError("No recipients — enter your email in the To field first."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/mail/send", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify(buildPayload(testOnly ? [recipients[0]] : recipients)),
      });
      const data = await res.json() as { messages?: SendResult[]; error?: string };
      if (!res.ok) { setError(data.error ?? "Send failed."); return; }
      setResult(data.messages ?? []);
      const firstId = data.messages?.[0]?.id;
      if (firstId) router.push(`/admin/mail/${firstId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }, [subject, to, buildPayload, router]);

  const sampleProps = templateId ? TEMPLATE_REGISTRY[templateId].sampleProps : {};

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Mail</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Compose</h1>
      </div>

      {showPicker && (
        <UserPickerModal
          onSelect={(emails) => setTo((prev) => [...prev.split(",").map((e) => e.trim()).filter(Boolean), ...emails].join(", "))}
          onClose={() => setShowPicker(false)}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-5">
          {/* To */}
          <div className="rounded-[20px] border border-line bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Recipients</p>
            <div className="mt-3 flex gap-2">
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="email@example.com, email2@example.com"
                className="h-10 flex-1 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
              />
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="h-10 rounded-xl border border-line px-4 text-sm font-medium text-ink-secondary hover:bg-bg-surface"
              >
                Select users
              </button>
            </div>
          </div>

          {/* Subject + Template */}
          <div className="rounded-[20px] border border-line bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Message</p>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-secondary">Subject</span>
                  <span className={`text-xs ${subject.length > 100 ? "text-red-500" : "text-ink-tertiary"}`}>{subject.length}/100</span>
                </div>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value.slice(0, 100))}
                  placeholder="Email subject…"
                  className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-ink-secondary">Template</span>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value as TemplateId | "")}
                  className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
                >
                  <option value="">Custom HTML</option>
                  {templateIds.map((id) => (
                    <option key={id} value={id}>{TEMPLATE_REGISTRY[id].name}</option>
                  ))}
                </select>
              </label>

              {templateId ? (
                <div className="grid gap-3">
                  {Object.keys(sampleProps).map((key) => (
                    <label key={key} className="grid gap-1">
                      <span className="text-xs font-medium text-ink-secondary capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <input
                        value={templateProps[key] ?? ""}
                        onChange={(e) => setTemplateProps((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="h-9 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid gap-3">
                  <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-2 text-xs text-orange-700">
                    Custom HTML bypasses templates. Verify it renders in Gmail and Outlook before sending.
                  </div>
                  <label className="grid gap-1">
                    <span className="text-sm font-medium text-ink-secondary">HTML</span>
                    <textarea
                      value={customHtml}
                      onChange={(e) => setCustomHtml(e.target.value)}
                      rows={8}
                      placeholder="<html>…</html>"
                      className="rounded-xl border border-line bg-bg-surface px-3 py-2 font-mono text-xs text-ink outline-none focus:border-accent-emerald"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm font-medium text-ink-secondary">Plain text (optional)</span>
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      rows={4}
                      className="rounded-xl border border-line bg-bg-surface px-3 py-2 font-mono text-xs text-ink outline-none focus:border-accent-emerald"
                    />
                  </label>
                </div>
              )}

              <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-medium text-ink-secondary">Reply-To</span>
                  <input
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    placeholder="support@payn.online"
                    className="h-9 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-medium text-ink-secondary">Tags (key:value, comma-separated)</span>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="kind:welcome, campaign:may-2026"
                    className="h-9 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
                  />
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          {result && (
            <div className="rounded-xl border border-accent-emerald/30 bg-accent-emerald-soft px-4 py-3 text-sm text-accent-emerald-strong">
              Sent {result.length} message{result.length !== 1 ? "s" : ""}.
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => send(true)}
              className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-ink-secondary hover:bg-bg-surface disabled:opacity-50"
            >
              Send test to me
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => send(false)}
              className="rounded-full bg-accent-emerald px-5 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send"}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="sticky top-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Preview</p>
          <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
            {previewHtml ? (
              <iframe sandbox="" srcDoc={previewHtml} title="Email preview" className="h-[600px] w-full" />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-ink-tertiary">
                Choose a template or enter HTML to see preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
