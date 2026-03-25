import { SiteShell } from "@/components/site-shell";

export default function ContactPage() {
  return (
    <SiteShell
      activeHref="/contact"
      eyebrow="Contact"
      title="Get in touch"
      description="Questions, partnerships, or feedback? We'd love to hear from you."
      hideHero
    >
      <div className="grid gap-16">
        {/* Main contact */}
        <section className="rounded-3xl bg-white p-8 shadow-card lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-tertiary">Contact</p>
          <h1 className="mt-4 text-h1 tracking-tight text-ink">Let&apos;s talk</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-secondary">
            Whether you have a question about how Payn works, want to discuss a partnership,
            or have feedback on the platform, reach out directly.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {/* Email */}
            <div className="rounded-3xl border border-line bg-bg-surface p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent-blue-text">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M22 7l-10 7L2 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-h3 text-ink">Email</h3>
              <p className="mt-1 text-sm text-ink-secondary">For general enquiries and support</p>
              <a
                href="mailto:petrov.cpay@gmail.com"
                className="mt-4 inline-block text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
              >
                petrov.cpay@gmail.com
              </a>
            </div>

            {/* LinkedIn */}
            <div className="rounded-3xl border border-line bg-bg-surface p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-accent-blue-text">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <h3 className="mt-4 text-h3 text-ink">LinkedIn</h3>
              <p className="mt-1 text-sm text-ink-secondary">Connect with the founder directly</p>
              <a
                href="https://www.linkedin.com/in/petrovkyrylo/"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
              >
                Kyrylo Petrov
              </a>
            </div>
          </div>
        </section>

        {/* Partnerships */}
        <section className="rounded-3xl bg-white p-8 shadow-card lg:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-tertiary">Partnerships</p>
              <h2 className="mt-4 text-h2 text-ink">Work with Payn</h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-secondary">
                If you&apos;re a financial provider, affiliate network, or fintech company interested in
                being listed on Payn or exploring a commercial partnership, we&apos;d love to hear from you.
              </p>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-secondary">
                We work with regulated European providers across loans, credit cards, money transfers,
                and currency exchange. All partnerships are subject to our independent ranking methodology.
                Compensation does not determine placement.
              </p>
            </div>
            <div className="shrink-0 rounded-3xl border border-line bg-bg-surface p-6 lg:w-[300px]">
              <h3 className="text-h3 text-ink">Partnership enquiries</h3>
              <p className="mt-2 text-sm text-ink-secondary">
                Send a message with your company name, product type, and markets covered.
              </p>
              <a
                href="mailto:petrov.cpay@gmail.com?subject=Partnership%20enquiry%20-%20Payn"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Email us
              </a>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
