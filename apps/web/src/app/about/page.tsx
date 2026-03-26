import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { SiteShell } from "@/components/site-shell";
import { getDictionary } from "@/lib/i18n";
import { getRequestPreferences } from "@/lib/request-preferences";

export default async function AboutPage() {
  const preferences = await getRequestPreferences();
  const dictionary = getDictionary(preferences.locale);

  return (
    <SiteShell
      activePage="about"
      eyebrow={dictionary.about.eyebrow}
      title={dictionary.about.title}
      description={dictionary.about.description}
    >
      <div className="grid gap-8">
        <section className="rounded-[32px] border border-line bg-white p-6 shadow-card lg:p-8">
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
            {dictionary.about.missionTitle}
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-secondary">
            {dictionary.about.missionBody}
          </p>
        </section>

        <section className="rounded-[32px] border border-line bg-white p-6 shadow-card lg:p-8">
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
            {dictionary.about.coverageTitle}
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-secondary">
            {dictionary.about.coverageBody}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className={buttonStyles({ variant: "primary", size: "lg" })}>
              {dictionary.nav.marketplace}
            </Link>
            <Link href="/contact" className={buttonStyles({ variant: "secondary", size: "lg" })}>
              {dictionary.nav.contact}
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
