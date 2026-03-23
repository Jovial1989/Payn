import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

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
    "inline-flex items-center justify-center rounded-xl border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    size === "sm" ? "h-10 px-4 text-sm" : "h-11 px-5 text-sm",
    variant === "primary" &&
      "border-primary bg-primary text-[#041009] hover:border-accent hover:bg-accent",
    variant === "secondary" &&
      "border-line bg-panel-strong text-ink hover:bg-panel",
    variant === "ghost" && "border-transparent bg-transparent text-primary hover:bg-primary-soft",
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
