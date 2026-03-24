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
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-deep",
    size === "sm" && "h-9 rounded-lg px-3.5 text-sm",
    size === "md" && "h-11 rounded-xl px-5 text-sm",
    size === "lg" && "h-12 rounded-xl px-6 text-base",
    variant === "primary" &&
      "gradient-primary text-bg-deep shadow-glow hover:shadow-glow-strong",
    variant === "secondary" &&
      "border border-line-strong bg-bg-elevated text-ink hover:bg-bg-surface hover:border-line-active",
    variant === "ghost" &&
      "bg-transparent text-primary hover:bg-primary-soft",
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
