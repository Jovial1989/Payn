"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import type { MarketplaceLocale } from "@payn/types";

const pillVariants = {
  rest:  { y: 0,  boxShadow: "0 0px 0px rgba(0,0,0,0)" },
  hover: { y: -2, boxShadow: "0 4px 12px -4px rgba(16,185,129,0.18)" },
};

const arrowVariants = {
  rest:  { x: 0 },
  hover: { x: 3 },
};

interface AppWaitlistPillProps {
  locale: string;
}

export function AppWaitlistPill({ locale }: AppWaitlistPillProps) {
  const shouldReduce = useReducedMotion();
  const dictionary = getDictionary(locale as MarketplaceLocale);
  const href = localePath(locale as MarketplaceLocale, "/waitlist");

  return (
    <section className="mx-auto w-full min-w-0 max-w-[1240px] px-4 py-4 sm:px-5 sm:py-5 lg:px-8">
      <motion.div
        variants={shouldReduce ? undefined : pillVariants}
        initial={shouldReduce ? undefined : "rest"}
        animate={shouldReduce ? undefined : "rest"}
        whileHover={shouldReduce ? undefined : "hover"}
        whileTap={shouldReduce ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="rounded-full"
      >
        <Link
          href={href}
          className="flex items-center justify-between gap-3 rounded-full border border-emerald-200/60 bg-emerald-50 px-5 py-3 text-sm font-medium text-[#1F2937] sm:gap-4 sm:px-7 sm:py-4"
        >
          {/* Phone icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5 shrink-0 text-emerald-600"
            aria-hidden="true"
          >
            <rect x="6" y="2" width="12" height="20" rx="2" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <span className="block text-[14px] font-medium text-[#1F2937] sm:text-[15px]">
              {dictionary.homeAtlas.appWaitlist.headline}
            </span>
          </div>

          {/* Animated arrow */}
          <motion.svg
            variants={shouldReduce ? undefined : arrowVariants}
            transition={{ duration: 0.2, ease: "easeOut" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 shrink-0 text-emerald-600"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </motion.svg>
        </Link>
      </motion.div>
    </section>
  );
}
