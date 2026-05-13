import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconSpendSmarter = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18" />
    <path d="M7 15h3" />
  </svg>
);

export const IconEarnOnCash = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10" />
    <path d="M15 9.5c0-1-1.3-1.5-3-1.5s-3 .7-3 1.7c0 2.3 6 1 6 3.3 0 1-1.3 1.5-3 1.5s-3-.5-3-1.5" />
  </svg>
);

export const IconTravelAbroad = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

export const IconDailyBanking = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3 21h18" />
    <path d="M3 10l9-7 9 7" />
    <path d="M5 10v9" />
    <path d="M19 10v9" />
    <path d="M9 14v5" />
    <path d="M15 14v5" />
  </svg>
);

export const IconInvestGrow = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3 17l6-6 4 4 7-9" />
    <path d="M14 6h6v6" />
  </svg>
);

export const IconBigPurchases = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3 12l9-9 9 9" />
    <path d="M5 10v10h14V10" />
    <path d="M9 20v-7h6v7" />
  </svg>
);

export const IconForBusiness = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
    <path d="M3 13h18" />
  </svg>
);

export const IconFamilyKids = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="9" cy="7" r="3" />
    <circle cx="17" cy="9" r="2" />
    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
    <path d="M15 21v-1a3 3 0 013-3h1a3 3 0 013 3v1" />
  </svg>
);

export const IconProtect = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
