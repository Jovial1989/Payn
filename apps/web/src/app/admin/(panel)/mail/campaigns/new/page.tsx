"use client";

import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TEMPLATE_REGISTRY, type TemplateId } from "@/lib/email/templates";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN ?? "";

const COUNTRIES = ["DE", "ES", "IT", "FR", "UK", "NL", "PT", "All"];
const LANGUAGES = ["en", "de", "es", "fr", "it", "pt", "All"];
const LAST_ACTIVE_OPTIONS = [
  { label: "Anyone", value: 0 },
  { label: "Active in last 7 days", value: 7 },
  { label: "Active in last 30 days", value: 30 },
  { label: "Active in last 90 days", value: 90 },
];

function ChipGroup({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (v: string) => {
    if (v === "All") return onChange(["All"]);
    const next = selected.filter((x) => x !== "All");
    onChange(next.includes(v) ? next.filter((x) => x !== v) : [...next, v]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => toggle(o)}
          className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${selected.includes(o) ? "border-accent-emerald bg-accent-emerald-soft text-accent-emerald-strong" : "border-line bg-white text-ink-secondary hover:border-accent-emerald/40"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function StepIndicator({ step, current }: { step: number; current: number }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-accent-emerald text-white" : active ? "border-2 border-accent-emerald text-accent-emerald" : "border-2 border-line text-ink-tertiary"}`}>
      {done ? "✓" : step}
    </div>
  );
}

export default function NewEmailCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId | "">("");
  const [templateProps, setTemplateProps] = useState<Record<string, string>>({});

  // Step 2
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [countries, setCountries] = useState<string[]>(["All"]);
  const [languages, setLanguages] = useState<string[]>(["All"]);
  const [lastActiveDays, setLastActiveDays] = useState(0);
  const [audienceSize, setAudienceSize] = useState<number | null>(null);

  // Step 3
  const [sendMode, setSendMode] = useState<"draft" | "now" | "scheduled">("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const dCountries = useDeferredValue(countries);
  const dLanguages = useDeferredValue(languages);
  const dLastActive = useDeferredValue(lastActiveDays);

  useEffect(() => {
    if (templateId) {
      if (!subject) setSubject(TEMPLATE_REGISTRY[templateId].defaultSubject);
      const sample = TEMPLATE_REGISTRY[templateId].sampleProps;
      setTemplateProps(Object.fromEntries(
        Object.entries(sample).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])
      ));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  // Debounced audience size
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!ADMIN_TOKEN) return;
      try {
        const audience = {
          countries: dCountries.includes("All") ? [] : dCountries,
          languages: dLanguages.includes("All") ? [] : dLanguages,
          marketing_opt_in: marketingOptIn,
          last_active_days: dLastActive || null,
        };
        const res = await fetch("/api/admin/mail/campaigns/audience-size", {
          method: "POST",
          headers: { "content-type": "application/json", "x-admin-token": ADMIN_TOKEN },
          body: JSON.stringify(audience),
        });
        if (res.ok) setAudienceSize(((await res.json()) as { count: number }).count);
      } catch { /* ignore */ }
    }, 400);
    return () => clearTimeout(t);
  }, [dCountries, dLanguages, dLastActive, marketingOptIn]);

  // Live preview
  useEffect(() => {
    if (!templateId) { setPreviewHtml(null); return; }
    const t = setTimeout(async () => {
      const res = await fetch("/api/admin/mail/preview", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify({ templateId, props: TEMPLATE_REGISTRY[templateId].sampleProps }),
      });
      if (res.ok) setPreviewHtml(((await res.json()) as { html: string }).html);
    }, 400);
    return () => clearTimeout(t);
  }, [templateId]);

  const submit = useCallback(async () => {
    if (!name.trim() || !subject.trim() || !templateId) { setError("Name, subject, and template are required."); return; }
    if (sendMode === "scheduled" && !scheduledAt) { setError("Pick a date/time to schedule."); return; }
    setError(null);
    setSubmitting(true);

    const audience = {
      countries: countries.includes("All") ? [] : countries,
      languages: languages.includes("All") ? [] : languages,
      marketing_opt_in: marketingOptIn,
      last_active_days: lastActiveDays || null,
    };
    const variables = Object.fromEntries(
      Object.entries(templateProps).map(([k, v]) => { try { return [k, JSON.parse(v)]; } catch { return [k, v]; } })
    );

    try {
      const res = await fetch("/api/admin/mail/campaigns", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
          preheader: preheader.trim() || undefined,
          template_id: templateId,
          audience,
          variables,
          send_mode: sendMode,
          scheduled_at: sendMode === "scheduled" ? scheduledAt : undefined,
          audience_size: audienceSize ?? 0,
        }),
      });
      const data = await res.json() as { id?: string; error?: string };
      if (!res.ok) { setError(data.error ?? "Failed"); setSubmitting(false); return; }
      router.push(`/admin/mail/campaigns/${data.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setSubmitting(false);
    }
  }, [name, subject, preheader, templateId, templateProps, sendMode, scheduledAt, countries, languages, marketingOptIn, lastActiveDays, audienceSize, router]);

  const sampleProps = templateId ? TEMPLATE_REGISTRY[templateId].sampleProps : {};

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Mail / Campaigns</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">New campaign</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {[{ n: 1, label: "Basics" }, { n: 2, label: "Audience" }, { n: 3, label: "Schedule" }].map(({ n, label }) => (
          <button key={n} type="button" onClick={() => setStep(n)} className="flex items-center gap-2">
            <StepIndicator step={n} current={step} />
            <span className={`text-sm font-medium ${step === n ? "text-ink" : "text-ink-tertiary"}`}>{label}</span>
            {n < 3 && <span className="text-ink-tertiary">→</span>}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {/* Step 1 */}
          {step === 1 && (
            <div className="grid gap-5">
              <div className="rounded-[20px] border border-line bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Basics</p>
                <div className="mt-4 grid gap-4">
                  <label className="grid gap-1.5">
                    <span className="text-sm font-medium text-ink-secondary">Campaign name (internal)</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="May 2026 DE digest" className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald" />
                  </label>
                  <label className="grid gap-1.5">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-ink-secondary">Subject</span>
                      <span className={`text-xs ${subject.length > 100 ? "text-red-500" : "text-ink-tertiary"}`}>{subject.length}/100</span>
                    </div>
                    <input value={subject} onChange={(e) => setSubject(e.target.value.slice(0, 100))} placeholder="Top offers in {country} this month" className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald" />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-sm font-medium text-ink-secondary">Preheader (optional)</span>
                    <input value={preheader} onChange={(e) => setPreheader(e.target.value)} placeholder="Short preview text shown in inbox" className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald" />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-sm font-medium text-ink-secondary">Template</span>
                    <select value={templateId} onChange={(e) => setTemplateId(e.target.value as TemplateId)} className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald">
                      <option value="">Select a template…</option>
                      {(Object.keys(TEMPLATE_REGISTRY) as TemplateId[]).map((id) => (
                        <option key={id} value={id}>{TEMPLATE_REGISTRY[id].name}</option>
                      ))}
                    </select>
                  </label>
                  {templateId && Object.keys(sampleProps).filter((k) => !["firstName", "country", "unsubscribeUrl"].includes(k)).map((key) => (
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
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setStep(2)} disabled={!name || !subject || !templateId} className="rounded-full bg-accent-emerald px-6 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong disabled:opacity-50">
                  Next: Audience →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="grid gap-5">
              <div className="rounded-[20px] border border-line bg-white p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Audience</p>
                  {audienceSize !== null && (
                    <span className="text-xs text-ink-secondary">~<strong className="text-ink">{audienceSize.toLocaleString()}</strong> recipients</span>
                  )}
                </div>
                <div className="mt-4 grid gap-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={marketingOptIn} onChange={(e) => setMarketingOptIn(e.target.checked)} className="accent-accent-emerald" />
                    <span className="text-sm text-ink-secondary">Require marketing opt-in</span>
                  </label>
                  <div>
                    <p className="mb-2 text-sm font-medium text-ink-secondary">Country</p>
                    <ChipGroup options={COUNTRIES} selected={countries} onChange={setCountries} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-ink-secondary">Language</p>
                    <ChipGroup options={LANGUAGES} selected={languages} onChange={setLanguages} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-ink-secondary">Last active</p>
                    <select value={lastActiveDays} onChange={(e) => setLastActiveDays(Number(e.target.value))} className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald">
                      {LAST_ACTIVE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="rounded-full border border-line px-6 py-2 text-sm font-semibold text-ink-secondary hover:bg-bg-surface">← Back</button>
                <button type="button" onClick={() => setStep(3)} className="rounded-full bg-accent-emerald px-6 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong">Next: Schedule →</button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="grid gap-5">
              <div className="rounded-[20px] border border-line bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Schedule</p>
                <div className="mt-4 grid gap-3">
                  {(["draft", "now", "scheduled"] as const).map((mode) => (
                    <label key={mode} className="flex cursor-pointer items-center gap-3">
                      <input type="radio" name="sendMode" value={mode} checked={sendMode === mode} onChange={() => setSendMode(mode)} className="accent-accent-emerald" />
                      <span className="text-sm text-ink capitalize">{mode === "now" ? "Send now" : mode === "draft" ? "Save as draft" : "Schedule for"}</span>
                    </label>
                  ))}
                  {sendMode === "scheduled" && (
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="ml-6 h-10 w-64 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
                    />
                  )}
                </div>
              </div>
              {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="rounded-full border border-line px-6 py-2 text-sm font-semibold text-ink-secondary hover:bg-bg-surface">← Back</button>
                <button type="button" disabled={submitting} onClick={submit} className="rounded-full bg-accent-emerald px-6 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong disabled:opacity-50">
                  {submitting ? "Saving…" : sendMode === "draft" ? "Save draft" : sendMode === "now" ? "Send now" : "Schedule"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="sticky top-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Preview</p>
          <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-card">
            {previewHtml ? (
              <iframe sandbox="" srcDoc={previewHtml} title="Email preview" className="h-[500px] w-full" />
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-ink-tertiary">Select a template</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
