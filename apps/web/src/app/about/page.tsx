import Image from "next/image";
import { buttonStyles } from "@/components/button";
import { MotionReveal } from "@/components/motion-reveal";
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
        <MotionReveal as="section" className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          {/* RESP.6 — Outer card padded p-5 on 375px (was p-6, gave the
              founder block 24px less horizontal room). Inner founder
              layout now stacks single-column on mobile with a centred
              140×175 photo (rather than the previous left-aligned
              220px which fought the bio column for space). md+ keeps
              the side-by-side layout. */}
          <div className="rounded-[28px] border border-line bg-white p-5 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="mx-auto w-full max-w-[200px] overflow-hidden rounded-[22px] border border-line bg-bg-surface sm:mx-0 sm:max-w-none">
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
                {/* RESP.6 — text-h2 (32px) breaks badly when concatenated
                    with the leading "Built by" label at 375px. Lock the
                    headline to its own line and shrink the base size on
                    mobile so it stays on two lines. */}
                <h2 className="mt-3 text-h2 font-bold leading-tight tracking-tight text-ink">
                  {dictionary.about.builtByTitle}{" "}
                  <span className="block sm:inline">{dictionary.about.builtByName}</span>
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

          <div className="rounded-[28px] border border-line bg-bg-surface p-5 sm:p-8">
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
        </MotionReveal>

        <MotionReveal as="section" className="grid gap-5 md:grid-cols-2">
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
        </MotionReveal>
      </div>
    </SiteShell>
  );
}
