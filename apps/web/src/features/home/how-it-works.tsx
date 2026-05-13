"use client";

import { getDictionary } from "@/lib/i18n";
import type { MarketplaceLocale } from "@payn/types";

interface HowItWorksProps {
  locale: string;
}

export function HowItWorks({ locale }: HowItWorksProps) {
  const dictionary = getDictionary(locale as MarketplaceLocale);
  const t = dictionary.homeAtlas.howItWorks;

  const cols = [
    { title: t.col1Title, body: t.col1Body },
    { title: t.col2Title, body: t.col2Body },
    { title: t.col3Title, body: t.col3Body },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-10 text-2xl font-medium text-[#1F2937]">
        {t.sectionHeadline}
      </h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {cols.map((col, i) => (
          <div key={i} className="border-l-2 border-[#10B981] pl-5">
            <h3 className="text-base font-medium text-[#1F2937]">{col.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#6b7280]">{col.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
