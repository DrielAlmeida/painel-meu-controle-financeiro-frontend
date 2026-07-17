import Link from "@/components/router-link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ShieldCheck,
  Siren,
  TriangleAlert,
} from "lucide-react";
import {
  IncidentMascot,
  type IncidentLevel,
} from "@/components/performance/incident-mascot";
import { cn, formatCurrency } from "@/lib/utils";

function getLevel(
  percentage: number,
  incidents: number,
  attentionIncidents: number,
): IncidentLevel {
  if (percentage > 100) return "critical";
  if (percentage >= 80 || attentionIncidents > 0 || incidents >= 5)
    return "attention";
  if (incidents > 0) return "light";
  return "safe";
}

const content: Record<
  IncidentLevel,
  {
    eyebrow: string;
    title: string;
    description: string;
    panel: string;
    accent: string;
  }
> = {
  safe: {
    eyebrow: "Rotina financeira saudável",
    title: "Nenhum incidente relevante foi identificado",
    description:
      "Compras cotidianas de baixo valor, como pão, café ou passagem, são tratadas como movimentações normais — não como incidentes.",
    panel:
      "border-emerald-300 bg-emerald-50 dark:border-emerald-400/40 dark:bg-emerald-950/70",
    accent: "text-emerald-700 dark:text-emerald-300",
  },
  light: {
    eyebrow: "Incidente leve em observação",
    title: "Uma compra fora do planejamento entrou no radar",
    description:
      "O impacto ainda é pequeno. Acompanhe os próximos gastos para manter o orçamento confortável.",
    panel:
      "border-amber-300 bg-amber-50 dark:border-amber-400/40 dark:bg-amber-950/70",
    accent: "text-amber-700 dark:text-amber-300",
  },
  attention: {
    eyebrow: "Orçamento em observação",
    title: "Atenção: o impacto dos gastos aumentou",
    description:
      "Você está perto da meta ou registrou uma compra não planejada de valor relevante. Vale revisar os próximos gastos antes de continuar.",
    panel:
      "border-orange-300 bg-orange-50 dark:border-orange-400/40 dark:bg-orange-950/70",
    accent: "text-orange-700 dark:text-orange-300",
  },
  critical: {
    eyebrow: "Acidente financeiro grave",
    title: "O orçamento foi parar na maca",
    description:
      "A meta mensal foi ultrapassada. Pause novas despesas não essenciais e revise as compras de maior impacto.",
    panel: "border-red-300 bg-red-50 dark:border-red-400/50 dark:bg-red-950/75",
    accent: "text-red-700 dark:text-red-300",
  },
};

export function FinancialIncidentBoard({
  percentage = 39,
  incidents = 0,
  attentionIncidents = 0,
  normalPurchases = 0,
  latestIncidentValue = 0,
  daysToClose = 21,
  compact = false,
  condensed = false,
}: {
  percentage?: number;
  incidents?: number;
  attentionIncidents?: number;
  normalPurchases?: number;
  latestIncidentValue?: number;
  daysToClose?: number;
  compact?: boolean;
  condensed?: boolean;
}) {
  const level = getLevel(percentage, incidents, attentionIncidents);
  const state = content[level];

  if (compact) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-lg border shadow-sm",
          state.panel,
        )}
      >
        <div className="flex min-h-[50px] flex-col gap-1.5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div
              className={cn(
                "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.14em]",
                state.accent,
              )}
            >
              {level === "critical" ? (
                <Siren size={13} />
              ) : level === "attention" ? (
                <TriangleAlert size={13} />
              ) : (
                <ShieldCheck size={13} />
              )}
              {state.eyebrow}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
              <h2 className="text-xs font-black text-slate-950 dark:text-white">
                {state.title}
              </h2>
              <span className="text-[11px] text-slate-600 dark:text-[#c5d5e7]">
                <strong>{incidents}</strong> incidentes
              </span>
              <span className="text-[11px] text-slate-600 dark:text-[#c5d5e7]">
                <strong>{Math.round(percentage)}%</strong> da meta
              </span>
              <span className="text-[11px] text-slate-600 dark:text-[#c5d5e7]">
                <strong>{daysToClose}</strong> dias
              </span>
            </div>
          </div>
          <Link
            href="/desempenho"
            className="inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-bold text-slate-950 shadow-sm transition hover:bg-slate-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            Detalhes <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border shadow-soft",
        state.panel,
      )}
    >
      <div className={cn("grid gap-6 p-6 lg:grid-cols-[1fr_300px] lg:items-center", condensed && "gap-4 p-4 lg:grid-cols-[1fr_220px]")}>
        <div>
          <div
            className={cn(
              "flex items-center gap-2 text-xs font-black uppercase tracking-[.24em]",
              state.accent,
            )}
          >
            {level === "critical" ? (
              <Siren size={17} />
            ) : level === "attention" ? (
              <TriangleAlert size={17} />
            ) : (
              <ShieldCheck size={17} />
            )}
            {state.eyebrow}
          </div>
          <h1 className={cn("mt-3 max-w-4xl text-2xl font-black text-slate-950 dark:text-white sm:text-4xl", condensed && "sm:text-3xl")}>
            {state.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-[#c5d5e7] sm:text-base">
            {state.description}
          </p>

          <div className={cn("mt-6 grid gap-3 sm:grid-cols-4", condensed && "mt-4 gap-2 [&>div]:p-3")}>
            <div className="rounded-2xl border border-amber-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#9fb4ca]">
                <TriangleAlert size={15} /> Incidentes reais
              </div>
              <strong className="mt-1 block text-xl text-slate-950 dark:text-white">
                {incidents}
              </strong>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#9fb4ca]">
                <CheckCircle2 size={15} /> Compras normais
              </div>
              <strong className="mt-1 block text-xl text-slate-950 dark:text-white">
                {normalPurchases}
              </strong>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#9fb4ca]">
                <CalendarDays size={15} /> Dias para fechar
              </div>
              <strong className="mt-1 block text-xl text-slate-950 dark:text-white">
                {daysToClose}
              </strong>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs text-slate-500 dark:text-[#9fb4ca]">
                Último impacto relevante
              </div>
              <strong className="mt-1 block text-xl text-slate-950 dark:text-white">
                {latestIncidentValue > 0
                  ? formatCurrency(latestIncidentValue)
                  : "—"}
              </strong>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-[#9fb4ca]">
            Regra inteligente: gastos planejados, recorrentes e compras
            essenciais de baixo valor não contam como incidente.
          </p>
        </div>
        <IncidentMascot level={level} className={condensed ? "min-h-36" : "min-h-56"} />
      </div>
    </section>
  );
}
