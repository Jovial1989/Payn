import Image from "next/image";
import { buttonStyles } from "@/components/button";
import { ChatLaunchButton } from "@/components/chat-launch-button";
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
      <div className="grid gap-5">
        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[28px] border border-line bg-white p-6 sm:p-8">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
              {dictionary.contact.chatTitle}
            </p>
            <h2 className="mt-3 text-h2 text-ink">{dictionary.contact.chatCta}</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-secondary">
              {dictionary.contact.chatBody}
            </p>
            <div className="mt-6">
              <ChatLaunchButton className={buttonStyles({ variant: "primary", size: "lg" }) + " w-full justify-center sm:w-auto"}>
                {dictionary.contact.chatCta}
              </ChatLaunchButton>
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-[#F7F8F9] p-6 sm:p-8">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
              {dictionary.contact.reachTitle}
            </p>
            <h2 className="mt-3 text-h2 text-ink">{dictionary.contact.emailCta}</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-secondary">
              {dictionary.contact.reachBody}
            </p>
            <a
              href="mailto:petrov.cpay@gmail.com"
              className={buttonStyles({ variant: "secondary", size: "lg" }) + " w-full justify-center sm:w-auto"}
            >
              {dictionary.contact.emailCta}
            </a>
            <p className="mt-4 text-sm text-ink-tertiary">petrov.cpay@gmail.com</p>
          </div>
        </section>

        <section className="rounded-[28px] border border-line bg-white p-6 sm:p-8">
          <div className="grid gap-5 md:grid-cols-[200px_minmax(0,1fr)] md:items-center">
            <div className="overflow-hidden rounded-[22px] border border-line bg-bg-surface">
              <Image
                src="/founders/kyrylo.jpeg"
                alt="Kyrylo Petrov"
                width={720}
                height={900}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="max-w-3xl">
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
        </section>
      </div>
    </SiteShell>
  );
}
