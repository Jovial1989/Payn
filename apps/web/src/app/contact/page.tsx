import { SiteShell } from "@/components/site-shell";

export default function ContactPage() {
  return (
    <SiteShell
      activePage="contact"
      eyebrow="Contact"
      title="Get in touch"
      description="Questions, partnerships, or product feedback can be sent directly to Payn."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Reach Payn directly</p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-secondary">
            Use email for support, product feedback, or marketplace questions.
          </p>
          <a
            href="mailto:petrov.cpay@gmail.com"
            className="mt-6 inline-flex items-center rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            petrov.cpay@gmail.com
          </a>
        </section>

        <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Founder</p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-secondary">
            Connect directly with Kyrylo Petrov for founder conversations, product feedback, or partnership context.
          </p>
          <a
            href="https://www.linkedin.com/in/petrovkyrylo/"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-bg-surface"
          >
            LinkedIn profile
          </a>
        </section>

        <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8 lg:col-span-2">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Partnerships</p>
              <h2 className="mt-3 text-h2 text-ink">Work with Payn</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-secondary">
                Share your company, product type, and markets covered so the conversation starts with the right context.
              </p>
            </div>
            <a
              href="mailto:petrov.cpay@gmail.com?subject=Partnership%20enquiry%20-%20Payn"
              className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Email partnerships
            </a>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
