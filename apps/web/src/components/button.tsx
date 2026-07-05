import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
} = {}) {
  return clsx(
    "inline-flex items-center justify-center font-semibold tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,138,75,0.22)] focus-visible:ring-offset-2",
    size === "sm" && "h-10 rounded-full px-4 text-sm",
    size === "md" && "h-12 rounded-full px-6 text-sm",
    size === "lg" && "h-14 rounded-full px-8 text-base",
    variant === "primary" &&
      "bg-gradient-to-r from-[#14D474] to-[#0A7A40] text-white shadow-[0_8px_24px_rgba(15,138,75,0.28)] hover:-translate-y-1 hover:brightness-110 hover:shadow-[0_14px_32px_rgba(15,138,75,0.40)] active:translate-y-0 active:scale-[0.985]",
    variant === "secondary" &&
      "border border-line bg-white/94 text-ink shadow-[0_10px_24px_rgba(10,14,10,0.04)] hover:-translate-y-1 hover:border-accent-emerald/30 hover:bg-bg-surface hover:shadow-[0_18px_34px_rgba(10,14,10,0.06)] active:translate-y-0 active:scale-[0.985]",
    variant === "ghost" &&
      "bg-transparent text-ink hover:bg-bg-surface hover:text-accent-emerald-strong active:scale-[0.985]",
    fullWidth && "w-full",
  );
}

export function providerCtaStyles({ fullWidth = false }: { fullWidth?: boolean } = {}) {
  return clsx(
    "inline-flex min-h-12 min-w-[148px] items-center justify-center rounded-full bg-gradient-to-r from-[#14D474] to-[#0A7A40] px-5 py-3 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_8px_24px_rgba(15,138,75,0.28)] transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_14px_32px_rgba(15,138,75,0.40)] active:scale-[0.985] active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,138,75,0.25)] focus-visible:ring-offset-2 sm:min-w-[164px]",
    fullWidth && "w-full",
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button type={type} className={clsx(buttonStyles({ variant, size }), className)} {...props} />;
}
