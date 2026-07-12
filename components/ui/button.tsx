import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  const variants = {
    primary:
      "bg-blue-600 text-white shadow-[0_10px_28px_-14px_rgba(37,132,255,.85)] hover:bg-blue-500",
    secondary:
      "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:border dark:border-[#315f88] dark:bg-[#12375f] dark:text-white dark:hover:bg-[#17466f]",
    ghost:
      "hover:bg-slate-100 dark:text-[#d9e6f4] dark:hover:bg-[#17466f]",
    danger: "bg-red-600 text-white hover:bg-red-500",
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-10 px-4", lg: "h-12 px-5 text-base" };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400/70 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
