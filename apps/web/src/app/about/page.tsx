import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { buttonStyles } from "@/components/button";

export default function AboutPage() {
  return (
    <SiteShell
      activeHref="/about"
      eyebrow="About"
      title="About Payn"
      description="A European financial marketplace built on transparency, independent ranking, and real product data."
      hideHero
    >
      <div className="grid gap-16">
        {/* Intro */}
        <section className="rounded-3xl bg-white p-8 shadow-card lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-tertiary">Our mission</p>
          <h1 className="mt-4 max-w-2xl text-h1 tracking-tight text-ink">
            Making financial comparison transparent and fair
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-secondary">
            Payn is a European financial marketplace that helps consumers compare loans, credit cards,
            money transfers, and currency exchange services. We believe financial decisions should be
            made with full context, not hidden terms or misleading rankings.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-secondary">
            Every offer on Payn is ranked by product fit, cost, and provider quality. When we earn
            commission from a provider, we disclose it. Compensation alone never determines ranking
            order. That&apos;s not a marketing claim. It&apos;s how the system is built.
          </p>
        </section>

        {/* What we do */}
        <section>
          <h2 className="text-h2 text-ink">What Payn covers</h2>
          <p className="mt-3 text-base text-ink-secondary">Four categories across 13 European markets</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { title: "Loans", description: "Personal loans and credit lines from neobanks, traditional banks, and specialist lenders." },
              { title: "Credit Cards", description: "Travel, cashback, and everyday cards with visible fees, rewards, and FX terms." },
              { title: "Transfers", description: "International money transfers compared by fee, speed, and corridor coverage." },
              { title: "Exchange", description: "Currency exchange with spread visibility, rate alerts, and multi-currency accounts." },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-line bg-white p-6 shadow-card">
                <h3 className="text-h3 text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Founder */}
        <section className="rounded-3xl bg-white p-8 shadow-card lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-tertiary">Founder</p>
          <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-start">
            <Image
              src="/kyrylo.jpeg"
              alt="Kyrylo Petrov"
              width={80}
              height={80}
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
            <div>
              <h2 className="text-h2 text-ink">Kyrylo Petrov</h2>
              <p className="mt-1 text-sm font-medium text-ink-secondary">Founder &amp; CEO</p>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-secondary">
                Kyrylo is building Payn to bring transparency and clarity to European financial
                product comparison. With a background in fintech and product development, he&apos;s
                focused on creating a marketplace that puts consumers first: honest rankings,
                visible methodology, and no hidden incentives.
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

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-h2 text-ink">Ready to compare?</h2>
          <p className="mt-3 text-base text-ink-secondary">Browse financial products across Europe</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/loans" className={buttonStyles({ variant: "primary", size: "lg" })}>
              Explore offers
            </Link>
            <Link href="/contact" className={buttonStyles({ variant: "secondary", size: "lg" })}>
              Get in touch
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
