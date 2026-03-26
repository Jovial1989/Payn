import Image from "next/image";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { SiteShell } from "@/components/site-shell";

export default function AboutPage() {
  return (
    <SiteShell
      activePage="about"
      eyebrow="About"
      title="Built to make financial decisions easier to trust"
      description="Payn is a fintech marketplace for comparing products with real filters, visible tradeoffs, and a clearer path from search to decision."
    >
      <div className="grid gap-8">
        <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Founder</p>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            <Image
              src="/kyrylo.jpeg"
              alt="Kyrylo Petrov"
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover"
            />

            <div className="max-w-2xl">
              <h2 className="text-h2 text-ink">Kyrylo Petrov</h2>
              <p className="mt-1 text-sm font-medium text-ink-secondary">Founder of Payn</p>
              <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                Serial entrepreneur and digital product builder with experience in fintech and enterprise solutions. Focused on simplifying financial decision-making.
              </p>
              <a
                href="https://www.linkedin.com/in/petrovkyrylo/"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-bg-overlay"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">What Payn does</p>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              Payn helps people compare loans, cards, transfers, insurance, exchange, and investments with country-aware availability and a cleaner explanation of why results appear.
            </p>
          </div>

          <div className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">How Payn works</p>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              The product focuses on transparent comparison, visible provider context, and product-fit ranking instead of burying decisions behind vague marketing copy.
            </p>
          </div>
        </section>

        <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Explore Payn</p>
              <h2 className="mt-3 text-h2 text-ink">See the marketplace in action</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/explore" className={buttonStyles({ variant: "primary", size: "lg" })}>
                Explore offers
              </Link>
              <Link href="/contact" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                Contact Payn
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
