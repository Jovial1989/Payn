import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { ProviderStrip } from "@/components/provider-strip";

const featuredProviders = [
  "Revolut",
  "Wise",
  "Klarna",
  "N26",
  "Santander",
  "BNP Paribas",
];

const valuePoints = [
  "Transparent ranking",
  "Real filters, not ads",
  "One place for all financial decisions",
];

const steps = [
  "Choose country",
  "Select category",
  "Apply filters",
  "Get ranked offers",
];

function PhoneMock() {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="rounded-[44px] bg-[#101111] p-[10px] shadow-[0_30px_90px_rgba(0,0,0,0.16)]">
        <div className="relative overflow-hidden rounded-[36px] bg-[#F3F6F4] p-4">
          <div className="absolute left-1/2 top-3 h-7 w-28 -translate-x-1/2 rounded-full bg-black/90" />

          <div className="mt-10 grid gap-3">
            <div className="rounded-[22px] bg-white p-4 shadow-subtle">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                Payn
              </p>
              <h3 className="mt-2 text-lg font-bold tracking-tight text-ink">
                Your financial marketplace
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                Europe selected. Ranked offers ready.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[20px] bg-[#DFF3E7] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#216B45]">
                  Country
                </p>
                <p className="mt-2 text-sm font-bold text-[#123B27]">Germany</p>
              </div>
              <div className="rounded-[20px] bg-[#E8EEF8] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#40618E]">
                  Category
                </p>
                <p className="mt-2 text-sm font-bold text-[#1D2A3D]">Transfers</p>
              </div>
            </div>

            <div className="rounded-[24px] bg-white p-4 shadow-subtle">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink">Wise Transfer</p>
                  <p className="mt-1 text-xs text-ink-secondary">Matches your country and payout speed filter</p>
                </div>
                <span className="rounded-full bg-accent-blue px-2.5 py-1 text-xs font-semibold text-accent-blue-text">
                  #1
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Fee", value: "EUR 2.10" },
                  { label: "Speed", value: "Same day" },
                  { label: "FX", value: "0.41%" },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-2xl bg-bg-surface px-3 py-3">
                    <p className="text-[11px] text-ink-tertiary">{metric.label}</p>
                    <p className="mt-1 text-xs font-bold text-ink">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] bg-[#121716] p-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                Saved shortlist
              </p>
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">3 offers saved</p>
                  <p className="mt-1 text-xs text-white/60">Ready to review on mobile</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3l4.5 2.7v4.6L8 13 3.5 10.3V5.7L8 3z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <div className="grid gap-10">
      <section className="overflow-hidden rounded-[40px] border border-line bg-white shadow-card">
        <div className="grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[0.94fr_1.06fr] lg:px-10 lg:py-12">
          <div className="flex flex-col justify-center">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
              European financial marketplace
            </p>
            <h1 className="mt-4 max-w-xl text-display text-ink">
              Your financial marketplace, in your pocket
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-secondary sm:text-lg">
              Compare loans, cards, transfers, insurance and investments across Europe - fast and transparently.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className={buttonStyles({ variant: "primary", size: "lg" })}>
                Get started
              </Link>
              <Link href="/explore" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                Explore offers
              </Link>
            </div>

            <div className="mt-8 grid gap-3">
              {valuePoints.map((point) => (
                <div key={point} className="flex items-center gap-3 text-sm font-medium text-ink-secondary">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-green text-accent-green-text">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_top,_rgba(24,94,69,0.16),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(26,115,232,0.14),_transparent_36%)]" />
            <div className="relative grid min-h-full place-items-center rounded-[36px] bg-[#F4F5F2] p-4 sm:p-6">
              <PhoneMock />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Why Payn</p>
            <h2 className="mt-3 text-h2 text-ink">A calmer way to compare financial products</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {valuePoints.map((point) => (
              <div key={point} className="rounded-[24px] bg-bg-surface px-5 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="mt-4 text-sm font-semibold leading-relaxed text-ink">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[32px] border border-line bg-[#101717] px-6 py-8 text-white shadow-card sm:px-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-white/55">Mobile app</p>
            <h2 className="mt-3 max-w-xl text-h2 text-white">Take Payn with you from shortlist to decision</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
              Save offers on the web, review them later on mobile, and keep your next decision close without losing context.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/waitlist" className="inline-flex h-12 items-center gap-3 rounded-full bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-white/90">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.707 12.293a1 1 0 010 1.414l-5 5A1 1 0 0111 18V8a1 1 0 011.707-.707l5 5zM6 5a1 1 0 011 1v12a1 1 0 11-2 0V6a1 1 0 011-1z" />
                </svg>
                App Store
              </Link>
              <Link href="/waitlist" className="inline-flex h-12 items-center gap-3 rounded-full border border-white/15 bg-white/[0.05] px-5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.09]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.5 3.5l10.5 6-3.5 3.5-7-9.5zm11.8 6.7l3.7 2.1c.7.4.7 1.4 0 1.8l-3.7 2.1-3.6-3.1 3.6-2.9zM7 14l3.5 3.5-7 3 3.5-6.5zm4.2-.5l3.8 3.3-10.2 4.4 6.4-7.7z" />
                </svg>
                Google Play
              </Link>
            </div>
          </div>

          <div className="justify-self-center">
            <PhoneMock />
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">How it works</p>
            <h2 className="mt-3 text-h2 text-ink">A simple path from search to shortlist</h2>
          </div>
          <Link href="/explore" className={buttonStyles({ variant: "secondary", size: "md" })}>
            Open Explore
          </Link>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="rounded-[24px] bg-bg-surface px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                Step {index + 1}
              </p>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-ink">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Trusted providers</p>
            <h2 className="mt-3 text-h2 text-ink">Real brands, visible side by side</h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-secondary">
            Payn compares products from recognizable European providers without turning the experience into an ad wall.
          </p>
        </div>

        <div className="mt-6">
          <ProviderStrip providers={featuredProviders} />
        </div>
      </section>
    </div>
  );
}
