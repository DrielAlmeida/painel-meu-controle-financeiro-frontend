
import { useEffect, useMemo, useState } from "react";
import { Download, PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnChart } from "@/components/charts/column-chart";
import { PageError, PageLoading } from "@/components/feedback/page-state";
import { exportCsv, exportExcel, exportPdf } from "@/lib/export-utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import { expensesService } from "@/services/expenses-service";
import { profileService } from "@/services/profile-service";
import type { Gasto, PerfilFinanceiro, PerfilFinanceiroPayload } from "@/types/api";

const now = new Date();
const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

function monthKey(date: string) {
  return date.slice(0, 7);
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" }).format(new Date(year, month - 1, 1));
}

export default function Page() {
  const [expenses, setExpenses] = useState<Gasto[]>([]);
  const [profile, setProfile] = useState<PerfilFinanceiro | null>(null);
  const [dataInicial, setDataInicial] = useState(currentMonthStart);
  const [dataFinal, setDataFinal] = useState(currentMonthEnd);
  const [categoria, setCategoria] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    Promise.all([expensesService.listar({ limit: 500 }), profileService.buscar()])
      .then(([expenseData, profileData]) => { setExpenses(expenseData.filter((item) => !item.excluido)); setProfile(profileData); })
      .catch((error) => setErro(error instanceof Error ? error.message : "Falha ao carregar relatório."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => Array.from(new Set(expenses.map((item) => item.categoria))).sort(), [expenses]);
  const filtered = useMemo(() => expenses.filter((item) => item.data_gasto >= dataInicial && item.data_gasto <= dataFinal && (!categoria || item.categoria === categoria)), [expenses, dataInicial, dataFinal, categoria]);
  const total = useMemo(() => filtered.reduce((sum, item) => sum + Number(item.valor), 0), [filtered]);
  const days = Math.max(1, Math.floor((new Date(`${dataFinal}T00:00:00`).getTime() - new Date(`${dataInicial}T00:00:00`).getTime()) / 86400000) + 1);
  const maxExpense = filtered.reduce((max, item) => Math.max(max, Number(item.valor)), 0);

  const dailyData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((item) => map.set(item.data_gasto, (map.get(item.data_gasto) || 0) + Number(item.valor)));
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ periodo: formatDate(date), gasto: value }));
  }, [filtered]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((item) => map.set(item.categoria, (map.get(item.categoria) || 0) + Number(item.valor)));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ categoria: name, gasto: value }));
  }, [filtered]);

  const monthlyData = useMemo(() => {
    const keys: string[] = [];
    for (let offset = 5; offset >= 0; offset--) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      keys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
    }
    const map = new Map(keys.map((key) => [key, 0]));
    expenses.forEach((item) => { const key = monthKey(item.data_gasto); if (map.has(key)) map.set(key, (map.get(key) || 0) + Number(item.valor)); });
    return keys.map((key) => ({ mes: monthLabel(key), gasto: map.get(key) || 0 }));
  }, [expenses]);

  const comparisonData = useMemo(() => {
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousKey = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, "0")}`;
    const current = expenses.filter((item) => monthKey(item.data_gasto) === currentKey).reduce((sum, item) => sum + Number(item.valor), 0);
    const previous = expenses.filter((item) => monthKey(item.data_gasto) === previousKey).reduce((sum, item) => sum + Number(item.valor), 0);
    return { current, previous, chart: [{ periodo: "Mês anterior", gasto: previous }, { periodo: "Mês atual", gasto: current }] };
  }, [expenses]);

  const income = profile ? Number(profile.salario_mensal) + Number(profile.outras_rendas) : 0;
  const currentSavings = profile ? Number(profile.reserva_emergencia_atual) : 0;
  const availableToSave = Math.max(0, income - comparisonData.current);
  const variation = comparisonData.previous > 0 ? ((comparisonData.current - comparisonData.previous) / comparisonData.previous) * 100 : 0;

  const rows = filtered.map((item) => ({ Data: formatDate(item.data_gasto), Descrição: item.descricao, Categoria: item.categoria, Valor: Number(item.valor).toFixed(2), Pagamento: item.forma_pagamento || "", Origem: item.origem }));

  async function addSavings() {
    if (!profile || availableToSave <= 0) return;
    if (!confirm(`Adicionar ${formatCurrency(availableToSave)} à reserva de emergência?`)) return;
    setSaving(true);
    try {
      const payload: PerfilFinanceiroPayload = {
        salario_mensal: profile.salario_mensal,
        outras_rendas: profile.outras_rendas,
        meta_gasto_mensal: profile.meta_gasto_mensal,
        dia_recebimento_salario: profile.dia_recebimento_salario,
        reserva_emergencia_atual: String(currentSavings + availableToSave),
        meta_reserva_emergencia: profile.meta_reserva_emergencia,
        moeda: profile.moeda,
      };
      const updated = await profileService.salvar(payload);
      setProfile(updated);
      setSucesso(`${formatCurrency(availableToSave)} foram acrescentados à sua reserva.`);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Falha ao atualizar a poupança.");
    } finally { setSaving(false); }
  }

  if (loading) return <PageLoading texto="Montando relatório..." />;

  return <div className="space-y-6"><div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-sm text-slate-500">Comparativos, categorias, evolução mensal e exportações.</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => exportCsv(rows, "relatorio-financeiro")} disabled={!rows.length}><Download size={18} />CSV</Button><Button variant="secondary" onClick={() => exportExcel(rows, "relatorio-financeiro")} disabled={!rows.length}><Download size={18} />Excel</Button><Button onClick={() => exportPdf(rows, "Relatório financeiro")} disabled={!rows.length}><Download size={18} />PDF</Button></div></div>
  {erro && <PageError mensagem={erro} />}{sucesso && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30">{sucesso}</p>}
  <Card><div className="grid gap-4 md:grid-cols-3"><label className="grid gap-1 text-sm">Data inicial<Input type="date" value={dataInicial} onChange={(event) => setDataInicial(event.target.value)} /></label><label className="grid gap-1 text-sm">Data final<Input type="date" value={dataFinal} onChange={(event) => setDataFinal(event.target.value)} /></label><label className="grid gap-1 text-sm">Categoria<select className="h-10 rounded-xl border bg-transparent px-3" value={categoria} onChange={(event) => setCategoria(event.target.value)}><option value="">Todas as categorias</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div></Card>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card><p className="text-sm text-slate-500">Total gasto</p><p className="mt-2 text-xl font-bold">{formatCurrency(total)}</p></Card><Card><p className="text-sm text-slate-500">Média diária</p><p className="mt-2 text-xl font-bold">{formatCurrency(total / days)}</p></Card><Card><p className="text-sm text-slate-500">Maior gasto</p><p className="mt-2 text-xl font-bold">{formatCurrency(maxExpense)}</p></Card><Card><p className="text-sm text-slate-500">Quantidade</p><p className="mt-2 text-xl font-bold">{filtered.length} registros</p></Card></div>
  <div className="grid gap-4 xl:grid-cols-2"><Card><h2 className="mb-4 font-bold">Gastos por dia</h2>{dailyData.length ? <ColumnChart data={dailyData} xKey="periodo" series={[{ key: "gasto", label: "Gastos" }]} /> : <p className="text-sm text-slate-500">Sem dados no período.</p>}</Card><Card><h2 className="mb-4 font-bold">Gastos por categoria</h2>{categoryData.length ? <ColumnChart data={categoryData} xKey="categoria" series={[{ key: "gasto", label: "Gastos" }]} /> : <p className="text-sm text-slate-500">Sem dados no período.</p>}</Card></div>
  <div className="grid gap-4 xl:grid-cols-2"><Card><h2 className="mb-4 font-bold">Últimos seis meses</h2><ColumnChart data={monthlyData} xKey="mes" series={[{ key: "gasto", label: "Gastos" }]} /></Card><Card><div className="flex items-start justify-between"><div><h2 className="font-bold">Comparativo mensal</h2><p className="text-sm text-slate-500">Mês atual versus mês anterior</p></div><span className={`flex items-center gap-1 text-sm font-bold ${variation <= 0 ? "text-emerald-500" : "text-red-500"}`}>{variation <= 0 ? <TrendingDown size={17} /> : <TrendingUp size={17} />}{Math.abs(variation).toFixed(1)}%</span></div><ColumnChart data={comparisonData.chart} xKey="periodo" series={[{ key: "gasto", label: "Gastos" }]} height={260} /></Card></div>
  <Card><div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex items-center gap-2"><PiggyBank className="text-emerald-500" /><h2 className="text-lg font-bold">Poupança e economia do mês</h2></div><p className="mt-2 text-sm text-slate-500">Reserva atual: <strong className="text-slate-900 dark:text-white">{formatCurrency(currentSavings)}</strong></p><p className="mt-1 text-sm text-slate-500">Economia disponível neste mês: <strong className="text-emerald-500">{formatCurrency(availableToSave)}</strong></p></div><Button onClick={() => void addSavings()} disabled={!profile || availableToSave <= 0 || saving}>{saving ? "Adicionando..." : "Adicionar economia à poupança"}</Button></div></Card>
  </div>;
}
