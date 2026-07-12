import { useMemo } from "react";
import { ColumnChart } from "@/components/charts/column-chart";
import type { Gasto } from "@/types/api";

export function ExpensesChart({ gastos = [] }: { gastos?: Gasto[] }) {
  const data = useMemo(() => {
    const totalPorDia = new Map<string, number>();

    for (const gasto of gastos) {
      if (gasto.excluido) continue;
      const dia = gasto.data_gasto.slice(8, 10);
      totalPorDia.set(dia, (totalPorDia.get(dia) ?? 0) + Number(gasto.valor || 0));
    }

    return Array.from(totalPorDia.entries())
      .sort(([diaA], [diaB]) => Number(diaA) - Number(diaB))
      .map(([dia, valor]) => ({ dia, valor: Number(valor.toFixed(2)) }));
  }, [gastos]);

  if (data.length === 0) {
    return (
      <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 dark:border-[#315f88] dark:bg-[#071a31]/50 dark:text-[#9fb4ca]">
        Nenhum gasto encontrado no período atual.
      </div>
    );
  }

  return <ColumnChart data={data} xKey="dia" series={[{ key: "valor", label: "Gastos" }]} height={288} />;
}
