import Image from "next/image";
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
      <div className="grid gap-5">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="rounded-[28px] border border-line bg-white p-6 sm:p-8">
            <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
              <div className="overflow-hidden rounded-[22px] border border-line bg-bg-surface">
                <Image
                  src="/founders/kyrylo.jpeg"
                  alt="Kyrylo Petrov"
                  width={720}
                  height={900}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>

              <div>
                <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
                  {dictionary.about.builtByTitle}
                </p>
                <h2 className="mt-3 text-h2 text-ink">
                  {dictionary.about.builtByTitle} {dictionary.about.builtByName}
                </h2>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                  {dictionary.about.builtByBody}
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                  {dictionary.about.builtByExperience}
                </p>
                <a
                  href="https://www.linkedin.com/in/petrovkyrylo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({ variant: "secondary", size: "lg" }) + " mt-6 w-full justify-center sm:w-auto"}
                >
                  {dictionary.about.linkedinLabel}
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-[#F7F8F9] p-6 sm:p-8">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
              {dictionary.about.storyTitle}
            </p>
            <div className="mt-4 grid gap-4">
              {dictionary.about.storyBody.map((paragraph) => (
                <p key={paragraph} className="text-base leading-relaxed text-ink-secondary">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[24px] border border-line bg-white p-6">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
              {dictionary.about.missionTitle}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
              {dictionary.about.missionBody}
            </p>
          </div>

          <div className="rounded-[24px] border border-line bg-white p-6">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
              {dictionary.about.coverageTitle}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
              {dictionary.about.coverageBody}
            </p>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
