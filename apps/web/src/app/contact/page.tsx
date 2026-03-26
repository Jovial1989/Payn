import { SiteShell } from "@/components/site-shell";
import { getDictionary } from "@/lib/i18n";
import { getRequestPreferences } from "@/lib/request-preferences";

export default async function ContactPage() {
  const preferences = await getRequestPreferences();
  const dictionary = getDictionary(preferences.locale);

  return (
    <SiteShell
      activePage="contact"
      eyebrow={dictionary.contact.eyebrow}
      title={dictionary.contact.title}
      description={dictionary.contact.description}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[32px] border border-line bg-white p-6 shadow-card lg:p-8">
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
            {dictionary.contact.reachTitle}
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-secondary">
            {dictionary.contact.reachBody}
          </p>
          <a
            href="mailto:petrov.cpay@gmail.com"
            className="mt-6 inline-flex items-center rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            petrov.cpay@gmail.com
          </a>
        </section>

        <section className="rounded-[32px] border border-line bg-white p-6 shadow-card lg:p-8">
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
            {dictionary.contact.partnershipTitle}
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-secondary">
            {dictionary.contact.partnershipBody}
          </p>
          <a
            href="mailto:petrov.cpay@gmail.com?subject=Partnership%20enquiry%20-%20Payn"
            className="mt-6 inline-flex items-center rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-bg-surface"
          >
            petrov.cpay@gmail.com
          </a>
        </section>
      </div>
    </SiteShell>
  );
}
