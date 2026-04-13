"use client";

import type { MarketplaceCategory } from "@payn/types";
import clsx from "clsx";

const iconContainerClasses = {
  sm: "h-10 w-10 rounded-2xl",
  md: "h-12 w-12 rounded-[18px]",
  lg: "h-14 w-14 rounded-[20px]",
} as const;

const iconClasses = {
  sm: "h-[18px] w-[18px]",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

function LoansIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.5 12 6l8 5.5" />
      <path d="M6 10.5V18h12v-7.5" />
      <path d="M9 18v-4.5h6V18" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
      <path d="M3.5 10.5h17" />
      <path d="M7.5 15h4" />
    </svg>
  );
}

function TransfersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8h11" />
      <path d="m12 4 4 4-4 4" />
      <path d="M19 16H8" />
      <path d="m12 12-4 4 4 4" />
    </svg>
  );
}

function ExchangeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7h9" />
      <path d="m13 3 4 4-4 4" />
      <path d="M17 17H8" />
      <path d="m11 13-4 4 4 4" />
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function InsuranceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5 19 6v5.5c0 4.4-2.7 7.9-7 9.8-4.3-1.9-7-5.4-7-9.8V6L12 3.5Z" />
      <path d="m9.5 12 1.8 1.8L15 10.2" />
    </svg>
  );
}

function InvestmentsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 18V6" />
      <path d="M5 18h14" />
      <path d="m8 14 3-3 2.5 2.5L19 8" />
      <path d="M15 8h4v4" />
    </svg>
  );
}

function getCategoryIcon(category: MarketplaceCategory) {
  switch (category) {
    case "loans":
      return <LoansIcon />;
    case "cards":
      return <CardsIcon />;
    case "transfers":
      return <TransfersIcon />;
    case "exchange":
      return <ExchangeIcon />;
    case "insurance":
      return <InsuranceIcon />;
    case "investments":
      return <InvestmentsIcon />;
    default:
      return <TransfersIcon />;
  }
}

function getToneClasses(category: MarketplaceCategory) {
  switch (category) {
    case "transfers":
      return "bg-[#ECF7FF] text-[#175CD3]";
    case "loans":
      return "bg-[#F6F1FF] text-[#6E44FF]";
    case "cards":
      return "bg-[#EEF7F1] text-[#067647]";
    case "exchange":
      return "bg-[#EFF4FF] text-[#175CD3]";
    case "insurance":
      return "bg-[#F4F5F7] text-[#111827]";
    case "investments":
      return "bg-[#F6F1FF] text-[#7A42F4]";
    default:
      return "bg-[#F4F5F7] text-[#111827]";
  }
}

export function CategoryIcon({
  category,
  size = "md",
  className,
}: {
  category: MarketplaceCategory;
  size?: keyof typeof iconContainerClasses;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center border border-white/70 shadow-[0_6px_14px_rgba(17,24,39,0.06)] transition-transform duration-200 group-hover:-translate-y-0.5",
        iconContainerClasses[size],
        getToneClasses(category),
        className,
      )}
      aria-hidden="true"
    >
      <span className={clsx(iconClasses[size])}>{getCategoryIcon(category)}</span>
    </span>
  );
}
