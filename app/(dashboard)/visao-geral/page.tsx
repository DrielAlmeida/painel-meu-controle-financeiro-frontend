import { useEffect, useMemo, useState } from "react";
import {
  CircleDollarSign,
  HandCoins,
  PiggyBank,
  Target,
  Wallet,
  WalletCards,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { FinancialIncidentBoard } from "@/components/performance/financial-incident-board";
import { TrafficLight } from "@/components/dashboard/traffic-light";
import { WhatsAppEntryCard } from "@/components/dashboard/whatsapp-entry-card";
import { ExpensesChart } from "@/components/charts/expenses-chart";
import { Card } from "@/components/ui/card";
import { PageError, PageLoading } from "@/components/feedback/page-state";
import { formatCurrency } from "@/lib/utils";
import { summarizeIncidents } from "@/lib/incident-rules";
import { dashboardService } from "@/services/dashboard-service";
import { expensesService } from "@/services/expenses-service";
import type { DashboardDesempenho, DashboardResumo, Gasto } from "@/types/api";

function currentMonthRange() {
  const now = new Date();
  const format = (date: Date) => date.toISOString().slice(0, 10);
  return {
    start: format(new Date(now.getFullYear(), now.getMonth(), 1)),
    end: format(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
}

export default function Page() {
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [desempenho, setDesempenho] = useState<DashboardDesempenho | null>(
    null,
  );
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [erro, setErro] = useState("");
  const carregar = async () => {
    setErro("");
    try {
      const range = currentMonthRange();
      const [r, d, g] = await Promise.all([
        dashboardService.resumo(),
        dashboardService.desempenho(),
        expensesService.listar({
          dataInicial: range.start,
          dataFinal: range.end,
          limit: 500,
        }),
      ]);
      setResumo(r);
      setDesempenho(d);
      setGastos(g);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar o painel.");
    }
  };
  useEffect(() => {
    void carregar();
  }, []);
  const incidentAnalysis = useMemo(
    () =>
      summarizeIncidents(
        gastos.filter((g) => !g.excluido),
        Number(resumo?.meta_mensal ?? 0),
      ),
    [gastos, resumo],
  );
  if (erro)
    return (
      <PageError mensagem={erro} tentarNovamente={() => void carregar()} />
    );
  if (!resumo || !desempenho) return <PageLoading />;
  const n = (v: string) => Number(v || 0);
  return (
    <div className="space-y-6">
      <WhatsAppEntryCard />
      <FinancialIncidentBoard
        percentage={desempenho.percentual_utilizado}
        incidents={incidentAnalysis.incidents.length}
        attentionIncidents={incidentAnalysis.attentionPurchases.length}
        normalPurchases={incidentAnalysis.normalPurchases.length}
        latestIncidentValue={incidentAnalysis.latestIncidentValue}
        daysToClose={desempenho.dias_para_fechar_mes}
        compact
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Salário mensal"
          value={formatCurrency(n(resumo.salario_mensal))}
          icon={Wallet}
        />
        <MetricCard
          title="Outras rendas"
          value={formatCurrency(n(resumo.outras_rendas))}
          icon={HandCoins}
        />
        <MetricCard
          title="Renda total"
          value={formatCurrency(n(resumo.renda_total))}
          icon={CircleDollarSign}
        />
        <MetricCard
          title="Gastos do mês"
          value={formatCurrency(n(resumo.gastos_mes))}
          icon={WalletCards}
        />
        <MetricCard
          title="Valor disponível"
          value={formatCurrency(n(resumo.valor_disponivel))}
          icon={PiggyBank}
        />
        <MetricCard
          title="Meta mensal"
          value={formatCurrency(n(resumo.meta_mensal))}
          subtitle={`${Math.round(resumo.percentual_utilizado)}% utilizado`}
          icon={Target}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <TrafficLight percentage={resumo.percentual_utilizado} />
        <Card>
          <h2 className="font-bold">Resumo rápido</h2>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex justify-between">
              <span>Economia prevista</span>
              <strong>{formatCurrency(n(resumo.economia_prevista))}</strong>
            </div>
            <div className="flex justify-between">
              <span>Parcelas futuras</span>
              <strong>
                {formatCurrency(n(resumo.total_parcelas_futuras))}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Recorrentes do próximo mês</span>
              <strong>
                {formatCurrency(n(resumo.recorrentes_proximo_mes))}
              </strong>
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <div className="mb-4">
          <h2 className="text-lg font-bold">Gastos por dia</h2>
          <p className="text-sm text-slate-500">
            Visualização diária dos gastos
          </p>
        </div>
        <ExpensesChart gastos={gastos} />
      </Card>
    </div>
  );
}
