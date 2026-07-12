import { cn } from "@/lib/utils";

export type IncidentLevel = "safe" | "light" | "attention" | "critical";

const styles: Record<IncidentLevel, { bg: string; label: string; emoji: string }> = {
  safe: { bg: "from-emerald-400/20 to-emerald-500/5", label: "Tudo seguro", emoji: "🦺" },
  light: { bg: "from-amber-400/20 to-amber-500/5", label: "Incidente leve", emoji: "🩹" },
  attention: { bg: "from-orange-400/20 to-orange-500/5", label: "Em observação", emoji: "🩼" },
  critical: { bg: "from-red-400/25 to-red-500/5", label: "Estado crítico", emoji: "🚑" },
};

export function IncidentMascot({ level, className }: { level: IncidentLevel; className?: string }) {
  const state = styles[level];
  return (
    <div className={cn("relative grid min-h-44 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br p-4", state.bg, className)}>
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
      {level === "critical" ? (
        <svg viewBox="0 0 280 170" className="h-40 w-full max-w-[300px]" role="img" aria-label="Personagem em uma maca representando orçamento em estado crítico">
          <rect x="30" y="112" width="220" height="22" rx="11" fill="currentColor" className="text-red-300 dark:text-red-900" />
          <circle cx="58" cy="145" r="11" fill="currentColor" className="text-slate-500" />
          <circle cx="222" cy="145" r="11" fill="currentColor" className="text-slate-500" />
          <path d="M50 112h180l-15-38H80z" fill="currentColor" className="text-white dark:text-[#d9e6f4]" />
          <circle cx="96" cy="69" r="24" fill="#f8c9a8" />
          <path d="M77 62c4-23 36-26 43-4-11-8-26-5-43 4z" fill="#334155" />
          <rect x="110" y="74" width="92" height="38" rx="18" fill="#60a5fa" />
          <path d="M130 77l33 31M160 77l-31 31" stroke="white" strokeWidth="10" strokeLinecap="round" />
          <rect x="190" y="76" width="46" height="15" rx="7" transform="rotate(12 190 76)" fill="#f8c9a8" />
          <rect x="199" y="72" width="22" height="24" rx="5" transform="rotate(12 199 72)" fill="white" />
          <path d="M84 69h9M103 69h9" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <path d="M92 82c6 4 12 4 18 0" stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="42" y="91" width="34" height="16" rx="8" fill="#ef4444" />
          <path d="M59 94v10M54 99h10" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        <div className="text-center">
          <div className="text-7xl drop-shadow-sm" aria-hidden="true">{state.emoji}</div>
          <div className="mt-3 rounded-full bg-white/70 px-4 py-1 text-sm font-bold shadow-sm dark:bg-[#071a31]/55">{state.label}</div>
        </div>
      )}
    </div>
  );
}
