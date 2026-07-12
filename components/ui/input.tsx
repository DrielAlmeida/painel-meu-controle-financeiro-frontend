import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#315f88] dark:bg-[#071a31] dark:text-[#f4f8ff] dark:placeholder:text-[#7895b3]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
