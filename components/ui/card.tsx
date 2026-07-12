import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-colors dark:border-[#24527a] dark:bg-[#0d2b4d] dark:shadow-[0_18px_50px_-32px_rgba(0,0,0,.85)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
