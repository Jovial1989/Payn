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
    "inline-flex items-center justify-center font-semibold tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,190,123,0.22)] focus-visible:ring-offset-2",
    size === "sm" && "h-10 rounded-full px-4 text-sm",
    size === "md" && "h-12 rounded-full px-6 text-sm",
    size === "lg" && "h-14 rounded-full px-8 text-base",
    variant === "primary" &&
      "bg-accent-emerald text-white shadow-[0_18px_38px_rgba(15,190,123,0.24)] hover:-translate-y-1 hover:bg-accent-emerald-strong hover:shadow-[0_26px_46px_rgba(15,190,123,0.3)] active:translate-y-0 active:scale-[0.985] active:brightness-95",
    variant === "secondary" &&
      "border border-line bg-white/94 text-ink shadow-[0_10px_24px_rgba(10,14,10,0.04)] hover:-translate-y-1 hover:border-accent-emerald/30 hover:bg-bg-surface hover:shadow-[0_18px_34px_rgba(10,14,10,0.06)] active:translate-y-0 active:scale-[0.985]",
    variant === "ghost" &&
      "bg-transparent text-ink hover:bg-bg-surface hover:text-accent-emerald-strong active:scale-[0.985]",
    fullWidth && "w-full",
  );
}

export function providerCtaStyles({ fullWidth = false }: { fullWidth?: boolean } = {}) {
  return clsx(
    "inline-flex min-h-12 min-w-[148px] items-center justify-center rounded-full bg-accent-emerald px-5 py-3 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_18px_38px_rgba(15,190,123,0.24)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent-emerald-strong hover:shadow-[0_24px_42px_rgba(15,190,123,0.28)] active:scale-[0.985] active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-emerald/25 focus-visible:ring-offset-2 sm:min-w-[164px]",
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
