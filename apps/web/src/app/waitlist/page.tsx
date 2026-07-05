import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { SiteShell } from "@/components/site-shell";
import { WaitlistForm } from "@/components/waitlist-form";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import { getRequestPreferences } from "@/lib/request-preferences";
import { getUiCopy } from "@/lib/ui-copy";

function getInitialPlatform(value?: string): "ios" | "android" | "both" {
  if (value === "ios" || value === "android" || value === "both") {
    return value;
  }

  return "both";
}

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; source?: string }>;
}) {
  const preferences = await getRequestPreferences();
  const dictionary = getDictionary(preferences.locale);
  const uiCopy = getUiCopy(preferences.locale);
  const { platform, source } = await searchParams;
  const initialPlatform = getInitialPlatform(platform);

  return (
    <SiteShell
      activePage="waitlist"
      eyebrow={dictionary.nav.mobileWaitlist}
      title={dictionary.home.appTitle}
      description={dictionary.home.appDescription}
      heroTags={uiCopy.waitlist.heroTags}
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <WaitlistForm initialPlatform={initialPlatform} source={source ?? "waitlist-page"} />

        <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
            {uiCopy.waitlist.nextStepsEyebrow}
          </p>
          <div className="mt-5 grid gap-4">
            {uiCopy.waitlist.nextSteps.map((item) => (
              <div key={item.title} className="rounded-2xl border border-line bg-bg-surface p-5">
                <h2 className="text-base font-bold text-ink">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-bg-surface px-5 py-4">
            <p className="text-sm font-semibold text-ink">{uiCopy.waitlist.warningTitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              {uiCopy.waitlist.warningDescription}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={localePath(preferences.locale, "/")} className={buttonStyles({ variant: "primary", size: "lg" })}>
              {dictionary.nav.marketplace}
            </Link>
            <Link href={localePath(preferences.locale, "/contact")} className={buttonStyles({ variant: "secondary", size: "lg" })}>
              {dictionary.nav.contact}
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
