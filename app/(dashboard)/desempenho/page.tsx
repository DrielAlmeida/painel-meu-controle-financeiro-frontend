
import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarCheck2, CheckCircle2, Flame, TriangleAlert } from "lucide-react";
import { FinancialIncidentBoard } from "@/components/performance/financial-incident-board";
import { Card } from "@/components/ui/card";
import { PageError, PageLoading } from "@/components/feedback/page-state";
import { formatCurrency } from "@/lib/utils";
import { dashboardService } from "@/services/dashboard-service";
import { expensesService } from "@/services/expenses-service";
import { summarizeIncidents } from "@/lib/incident-rules";
import type { DashboardDesempenho, DashboardResumo, Gasto } from "@/types/api";

const risco = { safe: "Seguro", light: "Baixo", attention: "Atenção", critical: "Crítico" } as const;

function monthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const format = (date: Date) => date.toISOString().slice(0, 10);
  return { start: format(start), end: format(end) };
}

export default function DesempenhoPage() {
  const [data, setData] = useState<DashboardDesempenho | null>(null);
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [erro, setErro] = useState("");

  const carregar = async () => {
    try {
      const range = monthRange();
      const [performance, dashboard, expenses] = await Promise.all([
        dashboardService.desempenho(),
        dashboardService.resumo(),
        expensesService.listar({ dataInicial: range.start, dataFinal: range.end, limit: 500 }),
      ]);
      setData(performance);
      setResumo(dashboard);
      setGastos(expenses);
      setErro("");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Falha ao carregar desempenho.");
    }
  };

  useEffect(() => { void carregar(); }, []);

  const analysis = useMemo(
    () => summarizeIncidents(gastos.filter((gasto) => !gasto.excluido), Number(resumo?.meta_mensal ?? 0)),
    [gastos, resumo],
  );

  if (erro) return <PageError mensagem={erro} tentarNovamente={() => void carregar()} />;
  if (!data || !resumo) return <PageLoading />;

  const computedLevel = data.percentual_utilizado > 100
    ? "critical"
    : data.percentual_utilizado >= 80 || analysis.attentionPurchases.length > 0 || analysis.incidents.length >= 5
      ? "attention"
      : analysis.incidents.length > 0
        ? "light"
        : "safe";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-500">Central de segurança financeira</p>
        <h1 className="text-3xl font-black">Desempenho</h1>
        <p className="mt-1 text-sm text-slate-500">A análise separa compras normais de incidentes com impacto real no orçamento.</p>
      </div>

      <FinancialIncidentBoard
        percentage={data.percentual_utilizado}
        incidents={analysis.incidents.length}
        attentionIncidents={analysis.attentionPurchases.length}
        normalPurchases={analysis.normalPurchases.length}
        latestIncidentValue={analysis.latestIncidentValue}
        daysToClose={data.dias_para_fechar_mes}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Sequência segura</span><CalendarCheck2 className="text-emerald-500"/></div>
          <strong className="mt-3 block text-3xl">{data.dias_sem_incidentes} dias</strong>
          <p className="mt-1 text-xs text-slate-500">Desde o último impacto relevante</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Incidentes reais</span><TriangleAlert className="text-amber-500"/></div>
          <strong className="mt-3 block text-3xl">{analysis.incidents.length}</strong>
          <p className="mt-1 text-xs text-slate-500">Compras fora do planejamento com impacto</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Compras normais</span><CheckCircle2 className="text-blue-400"/></div>
          <strong className="mt-3 block text-3xl">{analysis.normalPurchases.length}</strong>
          <p className="mt-1 text-xs text-slate-500">Essenciais, planejadas ou recorrentes</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Risco atual</span><Flame className="text-orange-500"/></div>
          <strong className="mt-3 block text-3xl">{risco[computedLevel]}</strong>
          <p className="mt-1 text-xs text-slate-500">{data.percentual_utilizado.toFixed(1)}% da meta utilizada</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <Card>
          <h2 className="text-lg font-bold">Movimentações analisadas</h2>
          <div className="mt-4 space-y-3">
            {analysis.classified.slice(0, 8).map(({ gasto, classification, reason }) => (
              <div key={gasto.id} className="flex items-center justify-between gap-4 rounded-2xl border p-4">
                <div>
                  <p className="font-semibold">{gasto.descricao}</p>
                  <p className="text-xs text-slate-500">{reason}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(Number(gasto.valor))}</p>
                  <span className={classification === "normal" ? "text-xs font-bold text-emerald-500" : classification === "light" ? "text-xs font-bold text-amber-500" : "text-xs font-bold text-orange-500"}>
                    {classification === "normal" ? "Normal" : classification === "light" ? "Leve" : "Atenção"}
                  </span>
                </div>
              </div>
            ))}
            {analysis.classified.length === 0 && <p className="text-sm text-slate-500">Nenhuma movimentação registrada neste mês.</p>}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Como a classificação funciona</h2>
          <div className="mt-5 space-y-3">
            {[
              { name: "Compra normal", range: "Planejada, recorrente ou essencial de baixo valor", color: "bg-emerald-500" },
              { name: "Incidente leve", range: "Compra avulsa pequena fora do planejamento", color: "bg-amber-400" },
              { name: "Em observação", range: "80% da meta ou compra de impacto relevante", color: "bg-orange-500" },
              { name: "Estado crítico", range: "Acima de 100% da meta mensal", color: "bg-red-500" },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3 rounded-2xl border p-3">
                <span className={`h-3 w-3 rounded-full ${item.color}`}/>
                <div><p className="text-sm font-bold">{item.name}</p><p className="text-xs text-slate-500">{item.range}</p></div>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-xl bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            Exemplo: pão de R$ 5,00 em alimentação é considerado uma compra cotidiana, não um incidente.
          </p>
        </Card>
      </div>
    </div>
  );
}
