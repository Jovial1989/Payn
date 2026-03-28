import Link from "next/link";
import { buttonStyles } from "@/components/button";
import {
  HeroPhoneMockup,
  AppStoreButton,
  GooglePlayButton,
  WaitlistBadge,
} from "@/components/hero-phone-mockup";
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

export function HomePage() {
  return (
    <div className="grid gap-10">
      {/* ─── Hero ─── */}
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

          {/* Phone mockup — visible on md+, hidden on mobile */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_30%_20%,_rgba(16,185,129,0.12),_transparent_50%),radial-gradient(circle_at_80%_70%,_rgba(59,130,246,0.10),_transparent_50%)]" />
            <div className="relative grid min-h-full place-items-center rounded-[36px] bg-[#0c0f0e] p-6 sm:p-8">
              <HeroPhoneMockup />
            </div>
          </div>

          {/* Mobile: simplified app preview cards */}
          <div className="md:hidden">
            <div className="grid gap-3 overflow-x-auto pb-2">
              <div className="rounded-2xl bg-bg-surface p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-xs font-bold text-white">P</div>
                  <div>
                    <p className="text-sm font-bold text-ink">Payn mobile</p>
                    <p className="text-xs text-ink-secondary">Shortlist, compare, decide</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {["Shortlist", "Compare", "Apply"].map((label) => (
                    <span key={label} className="rounded-full bg-accent-green px-2.5 py-1 text-[10px] font-semibold text-accent-green-text">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Payn ─── */}
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

      {/* ─── Mobile App Section ─── */}
      <section className="overflow-hidden rounded-[32px] border border-line bg-[#0c0f0e] shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1fr_0.85fr]">
          {/* Left: copy + CTAs */}
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:py-16">
            <WaitlistBadge />

            <h2 className="mt-5 max-w-lg text-h2 text-white lg:text-h1">
              Save on web, continue on mobile
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/60 sm:text-base">
              Build your shortlist on any device. Compare side by side. When you are ready to decide, everything is right where you left it.
            </p>

            <div className="mt-5 grid gap-3">
              {[
                "Your shortlist syncs across devices",
                "Side-by-side comparison on the go",
                "Pick up where you left off",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-6" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/55">{item}</span>
                </div>
              ))}
            </div>

            {/* App store buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <AppStoreButton />
              <GooglePlayButton />
            </div>

            <p className="mt-4 text-[12px] text-white/30">
              Join the waitlist for early access. iOS and Android.
            </p>
          </div>

          {/* Right: phone mockup — visible on lg+ */}
          <div className="relative hidden lg:flex lg:items-center lg:justify-center">
            {/* Gradient backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(16,185,129,0.08),_transparent_60%)]" />
            <div className="relative py-10">
              <HeroPhoneMockup variant="dark" />
            </div>
          </div>

          {/* Tablet/mobile: show phone inline centered */}
          <div className="flex items-center justify-center px-6 pb-10 lg:hidden">
            <div className="scale-90">
              <HeroPhoneMockup variant="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
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

      {/* ─── Trusted Providers ─── */}
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
