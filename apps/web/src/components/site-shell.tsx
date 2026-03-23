import type { Route } from "next";
import { Header } from "@/components/header";
import { SectionContainer } from "@/components/section-container";
import { Tag } from "@/components/tag";

export function SiteShell({
  title,
  eyebrow,
  description,
  children,
  activeHref,
  heroTags = [],
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
  activeHref?: Route;
  heroTags?: string[];
}) {
  return (
    <div className="min-h-screen bg-bg">
      <Header activeHref={activeHref} />
      <main className="mx-auto flex max-w-[1160px] flex-col gap-6 px-5 py-8 lg:px-8 lg:py-10">
        <SectionContainer padding="lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{description}</p>
          {heroTags.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2.5">
              {heroTags.map((tag) => (
                <Tag key={tag} tone="muted">
                  {tag}
                </Tag>
              ))}
            </div>
          ) : null}
        </SectionContainer>
        {children}
      </main>
    </div>
  );
}
