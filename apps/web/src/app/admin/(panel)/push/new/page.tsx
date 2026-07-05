"use client";

import { useRouter } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useRef, useState } from "react";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

// SEC-FIX SEC-002: removed NEXT_PUBLIC_ADMIN_API_TOKEN — session cookie handles auth

// Pre-built offer list from the static catalog — no API call needed.
const CATALOG_OFFERS = marketplaceOffers
  .slice()
  .sort((a, b) => (b.affiliatePriorityScore ?? 0) - (a.affiliatePriorityScore ?? 0))
  .map((o) => ({
    id: o.id,
    slug: o.slug,
    title: o.title,
    provider_name: o.providerName,
    category: String(o.category),
  }));

const COUNTRIES = ["DE", "ES", "IT", "FR", "UK", "NL", "PT", "All"];
const LANGUAGES = ["en", "de", "es", "fr", "it", "pt", "All"];
const LAST_ACTIVE_OPTIONS = [
  { label: "Anyone", value: 0 },
  { label: "Active in last 7 days", value: 7 },
  { label: "Active in last 30 days", value: 30 },
  { label: "Active in last 90 days", value: 90 },
];

// All navigable screens in the Flutter app (keep in sync with go_router)
const SCREENS: { label: string; route: string; icon: string; description: string }[] = [
  { label: "Home",           route: "/home",                 icon: "⌂", description: "Main dashboard" },
  { label: "Discover",       route: "/en/discover",          icon: "◎", description: "All categories" },
  { label: "Cards",          route: "/en/cards",             icon: "▭", description: "Credit & debit cards" },
  { label: "Savings",        route: "/en/savings",           icon: "◈", description: "Savings accounts" },
  { label: "Send money",     route: "/en/transfers",         icon: "→", description: "Transfers & remittance" },
  { label: "Bank accounts",  route: "/en/banking",           icon: "◻", description: "Current accounts" },
  { label: "Investing",      route: "/en/investments",       icon: "↗", description: "Stocks, ETFs, crypto" },
  { label: "Loans",          route: "/en/loans",             icon: "◇", description: "Personal & business loans" },
  { label: "Insurance",      route: "/en/insurance",         icon: "◉", description: "Health, travel, life" },
  { label: "Saved",          route: "/saved",                icon: "♡", description: "Bookmarked offers" },
  { label: "Profile",        route: "/profile",              icon: "◯", description: "Account & settings" },
];

function ChipGroup({ options, selected, onChange }: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (v: string) => {
    if (v === "All") return onChange(["All"]);
    const next = selected.filter((x) => x !== "All");
    onChange(next.includes(v) ? next.filter((x) => x !== v) : [...next, v]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => toggle(o)}
          className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
            selected.includes(o)
              ? "border-accent-emerald bg-accent-emerald-soft text-accent-emerald-strong"
              : "border-line bg-white text-ink-secondary hover:border-accent-emerald/40"
          }`}
        >{o}</button>
      ))}
    </div>
  );
}

type OfferRow = { id: string; slug: string; title: string; provider_name: string; category: string };

// Fully inline — no dropdown, no API call. Filters CATALOG_OFFERS locally.
function ScreenPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [tab, setTab] = useState<"screens" | "offers">("screens");
  const [offerQ, setOfferQ] = useState("");

  const selected = SCREENS.find((s) => s.route === value);
  const isOfferRoute = value.startsWith("/offer/");

  const filteredOffers = offerQ.trim()
    ? CATALOG_OFFERS.filter((o) => {
        const q = offerQ.toLowerCase();
        return (
          o.title.toLowerCase().includes(q) ||
          o.provider_name.toLowerCase().includes(q) ||
          o.slug.toLowerCase().includes(q)
        );
      })
    : CATALOG_OFFERS;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-bg-surface">
      {/* Selected indicator */}
      {value && (
        <div className="flex items-center gap-2 border-b border-line bg-accent-emerald-soft/40 px-4 py-2.5">
          <span className="text-sm">
            {isOfferRoute ? "📦" : (selected?.icon ?? "→")}
          </span>
          <span className="flex-1 text-sm font-semibold text-ink">
            {isOfferRoute ? value.replace("/offer/", "") : (selected?.label ?? value)}
          </span>
          <span className="font-mono text-[11px] text-ink-tertiary">{value}</span>
          <button type="button" onClick={() => onChange("")}
            className="ml-2 rounded-lg border border-line bg-white px-2 py-0.5 text-xs text-ink-tertiary hover:text-ink"
          >Clear</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-line bg-white">
        {(["screens", "offers"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
              tab === t
                ? "border-b-2 border-accent-emerald bg-white text-accent-emerald-strong"
                : "text-ink-tertiary hover:text-ink-secondary"
            }`}
          >{t === "screens" ? "🗂  Screens" : "📦  Specific offer"}</button>
        ))}
      </div>

      {/* Screens grid */}
      {tab === "screens" && (
        <div className="grid grid-cols-2 gap-px bg-line p-px sm:grid-cols-3 lg:grid-cols-4">
          {SCREENS.map((s) => (
            <button key={s.route} type="button" onClick={() => onChange(s.route)}
              className={`flex flex-col gap-0.5 px-3 py-3 text-left transition-colors hover:bg-accent-emerald-soft/30 ${
                value === s.route ? "bg-accent-emerald-soft/60" : "bg-white"
              }`}
            >
              <span className="text-xl leading-none">{s.icon}</span>
              <span className="mt-1 text-sm font-semibold text-ink">{s.label}</span>
              <span className="text-[11px] text-ink-tertiary">{s.description}</span>
              <span className="mt-0.5 font-mono text-[10px] text-ink-tertiary/60">{s.route}</span>
            </button>
          ))}
        </div>
      )}

      {/* Offer search */}
      {tab === "offers" && (
        <div>
          <div className="bg-white p-3">
            <input value={offerQ} onChange={(e) => setOfferQ(e.target.value)}
              placeholder={`Search ${CATALOG_OFFERS.length} offers by name or provider…`}
              className="h-9 w-full rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
            />
          </div>
          <div className="max-h-72 divide-y divide-line overflow-y-auto bg-white">
            {filteredOffers.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-ink-tertiary">No offers match.</p>
            )}
            {filteredOffers.slice(0, 50).map((o) => (
              <button key={o.id} type="button" onClick={() => onChange(`/offer/${o.id}`)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-surface ${
                  value === `/offer/${o.id}` ? "bg-accent-emerald-soft/60" : ""
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg-surface text-xs font-bold uppercase text-ink-secondary">
                  {o.provider_name?.slice(0, 2) ?? "??"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{o.title}</p>
                  <p className="truncate text-[11px] text-ink-tertiary">
                    {o.provider_name} · <span className="capitalize">{o.category?.replace(/_/g, " ")}</span>
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-ink-tertiary/50">{o.id}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PhonePreview({ title, body, route }: { title: string; body: string; route: string }) {
  const screen = SCREENS.find((s) => s.route === route);
  return (
    <div className="mx-auto w-[220px] rounded-[32px] border-4 border-ink bg-bg-surface p-3 shadow-elevated">
      <div className="mb-2 flex items-center gap-1.5 rounded-xl bg-white p-3 shadow-card">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-emerald-soft">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M4 12L8 4L12 12" stroke="#0F8A4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-bold text-ink">{title || "Notification title"}</p>
          <p className="line-clamp-2 text-[10px] leading-tight text-ink-secondary">
            {body || "Your notification message will appear here."}
          </p>
        </div>
      </div>
      {route ? (
        <div className="mt-1 flex items-center justify-center gap-1">
          {screen && <span className="text-[10px]">{screen.icon}</span>}
          <p className="truncate text-center text-[9px] text-accent-emerald-strong">
            → {screen ? screen.label : route}
          </p>
        </div>
      ) : (
        <div className="mt-1 text-center text-[9px] text-ink-tertiary">Opens home screen</div>
      )}
    </div>
  );
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [countries, setCountries] = useState<string[]>(["All"]);
  const [languages, setLanguages] = useState<string[]>(["All"]);
  const [lastActiveDays, setLastActiveDays] = useState(0);
  const [scheduledAt, setScheduledAt] = useState("");
  const [audienceSize, setAudienceSize] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI generation state
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Test push state
  const [testToken, setTestToken] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const deferredCountries = useDeferredValue(countries);
  const deferredLanguages = useDeferredValue(languages);
  const deferredLastActive = useDeferredValue(lastActiveDays);

  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/push/audience-size", {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify({
            audience_countries: deferredCountries.includes("All") ? [] : deferredCountries,
            audience_languages: deferredLanguages.includes("All") ? [] : deferredLanguages,
            audience_last_active_days: deferredLastActive || null,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { size?: number };
          setAudienceSize(data.size ?? 0);
        }
      } catch { /* ignore */ }
    }, 400);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [deferredCountries, deferredLanguages, deferredLastActive]);

  const generateWithAI = useCallback(async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/admin/push/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          screen: deepLink || undefined,
          audience_countries: countries.includes("All") ? [] : countries,
          audience_languages: languages.includes("All") ? [] : languages,
        }),
      });
      const data = await res.json() as { title?: string; body?: string; error?: string };
      if (!res.ok || data.error) { setAiError(data.error ?? "Generation failed"); return; }
      if (data.title) setTitle(data.title);
      if (data.body) setBody(data.body);
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setAiLoading(false);
    }
  }, [aiTopic, deepLink, countries, languages]);

  const sendTest = useCallback(async () => {
    if (!testToken.trim() || !title.trim() || !body.trim()) {
      setTestResult("Fill in title, body, and FCM token first.");
      return;
    }
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/push/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: testToken.trim(), title, body, deep_link: deepLink || undefined }),
      });
      const data = await res.json() as { successCount?: number; failureCount?: number; error?: string };
      if (data.error) { setTestResult(`Error: ${data.error}`); return; }
      setTestResult(data.successCount === 1 ? "✅ Delivered!" : `⚠️ ${JSON.stringify(data)}`);
    } catch (e: unknown) {
      setTestResult(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setTestSending(false);
    }
  }, [testToken, title, body, deepLink]);

  const submit = useCallback(async (mode: "draft" | "now" | "scheduled") => {
    if (!title.trim() || !body.trim()) { setError("Title and body are required."); return; }
    if (mode === "scheduled" && !scheduledAt) { setError("Pick a date/time to schedule."); return; }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/push/campaigns", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          deep_link: deepLink.trim() || undefined,
          audience_countries: countries.includes("All") ? [] : countries,
          audience_languages: languages.includes("All") ? [] : languages,
          audience_last_active_days: lastActiveDays || null,
          send_mode: mode,
          scheduled_at: mode === "scheduled" ? scheduledAt : undefined,
        }),
      });
      const data = await res.json() as { id?: string; error?: string };
      if (!res.ok) { setError(data.error ?? "Failed"); setSubmitting(false); return; }
      router.push(`/admin/push/${data.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setSubmitting(false);
    }
  }, [title, body, deepLink, countries, languages, lastActiveDays, scheduledAt, router]);

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Push Campaigns</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">New campaign</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="grid gap-5">

          {/* AI Generation */}
          <div className="rounded-[20px] border border-accent-emerald/20 bg-accent-emerald-soft/30 p-6">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-emerald-strong">Generate with AI</p>
            </div>
            <p className="mt-1 text-sm text-ink-secondary">Describe what this push is about — Gemini writes the copy.</p>
            <div className="mt-4 flex gap-2">
              <input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") generateWithAI(); }}
                placeholder="e.g. New 4.5% savings offer from Raisin, for German users"
                className="h-10 flex-1 rounded-xl border border-accent-emerald/30 bg-white px-3 text-sm text-ink outline-none placeholder:text-ink-tertiary focus:border-accent-emerald"
              />
              <button
                type="button"
                onClick={generateWithAI}
                disabled={aiLoading || !aiTopic.trim()}
                className="rounded-xl bg-accent-emerald px-4 text-sm font-semibold text-white hover:bg-accent-emerald-strong disabled:opacity-50"
              >
                {aiLoading ? "…" : "Generate"}
              </button>
            </div>
            {aiError && <p className="mt-2 text-sm text-red-600">{aiError}</p>}
          </div>

          {/* Message */}
          <div className="rounded-[20px] border border-line bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Message</p>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-secondary">Title</span>
                  <span className={`text-xs ${title.length > 50 ? "text-red-500" : "text-ink-tertiary"}`}>{title.length}/50</span>
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 50))}
                  placeholder="e.g. 4.5% on your savings — is your bank keeping up?"
                  className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
                />
              </label>
              <label className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-secondary">Body</span>
                  <span className={`text-xs ${body.length > 120 ? "text-red-500" : "text-ink-tertiary"}`}>{body.length}/120</span>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, 120))}
                  rows={3}
                  placeholder="e.g. Raisin now offers 4.5% p.a. on easy-access savings. Compare and switch in 2 minutes."
                  className="rounded-xl border border-line bg-bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent-emerald"
                />
              </label>
            </div>
          </div>

          {/* Target screen */}
          <div className="rounded-[20px] border border-line bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Target screen</p>
            <p className="mt-1 text-sm text-ink-secondary">Which screen opens when the user taps the notification?</p>
            <div className="mt-4">
              <ScreenPicker value={deepLink} onChange={setDeepLink} />
            </div>
          </div>

          {/* Audience */}
          <div className="rounded-[20px] border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Audience</p>
              {audienceSize !== null && (
                <span className="text-xs text-ink-secondary">
                  ~<strong className="text-ink">{audienceSize.toLocaleString()}</strong> devices match
                </span>
              )}
            </div>
            <div className="mt-4 grid gap-4">
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
                <select value={lastActiveDays} onChange={(e) => setLastActiveDays(Number(e.target.value))}
                  className="h-10 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
                >
                  {LAST_ACTIVE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="rounded-[20px] border border-line bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Schedule</p>
            <div className="mt-4">
              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-ink-secondary">Send at (leave blank to send now or save as draft)</span>
                <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                  className="h-10 w-full max-w-xs rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald"
                />
              </label>
            </div>
          </div>

          {/* Test push */}
          <div className="rounded-[20px] border border-line bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Test on device</p>
            <p className="mt-1 text-sm text-ink-secondary">Send to one FCM token before blasting the campaign.</p>
            <div className="mt-4 flex gap-2">
              <input value={testToken} onChange={(e) => setTestToken(e.target.value)}
                placeholder="FCM registration token…"
                className="h-10 flex-1 rounded-xl border border-line bg-bg-surface px-3 text-sm text-ink outline-none focus:border-accent-emerald font-mono text-xs"
              />
              <button type="button" onClick={sendTest} disabled={testSending}
                className="rounded-xl border border-line px-4 text-sm font-semibold text-ink-secondary hover:bg-bg-surface disabled:opacity-50"
              >
                {testSending ? "…" : "Send test"}
              </button>
            </div>
            {testResult && (
              <p className={`mt-2 text-sm ${testResult.startsWith("✅") ? "text-accent-emerald-strong" : "text-ink-secondary"}`}>
                {testResult}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={submitting} onClick={() => submit("draft")}
              className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-ink-secondary hover:bg-bg-surface disabled:opacity-50"
            >Save as draft</button>
            {scheduledAt && (
              <button type="button" disabled={submitting} onClick={() => submit("scheduled")}
                className="rounded-full border border-accent-emerald/40 bg-accent-emerald-soft px-5 py-2 text-sm font-semibold text-accent-emerald-strong hover:bg-accent-emerald-soft/80 disabled:opacity-50"
              >Schedule</button>
            )}
            <button type="button" disabled={submitting} onClick={() => submit("now")}
              className="rounded-full bg-accent-emerald px-5 py-2 text-sm font-semibold text-white hover:bg-accent-emerald-strong disabled:opacity-50"
            >{submitting ? "Sending…" : "Send now"}</button>
          </div>
        </div>

        {/* Preview */}
        <div className="sticky top-6 self-start">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Preview</p>
          <PhonePreview title={title} body={body} route={deepLink} />
          {deepLink && (
            <p className="mt-3 text-center text-[11px] text-ink-tertiary">
              Tapping opens <span className="font-mono text-ink-secondary">{deepLink}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
