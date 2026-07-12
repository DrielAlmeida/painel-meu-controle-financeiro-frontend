
import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarRange, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExpenseForm } from "@/components/forms/expense-form";
import { PageError, PageLoading } from "@/components/feedback/page-state";
import { expensesService } from "@/services/expenses-service";
import type { CriarGastoPayload, Gasto } from "@/types/api";

const today = new Date();
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
const todayString = today.toISOString().slice(0, 10);

export default function Page() {
  const [expenses, setExpenses] = useState<Gasto[]>([]);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataInicial, setDataInicial] = useState(monthStart);
  const [dataFinal, setDataFinal] = useState(todayString);
  const [mostrarExcluidos, setMostrarExcluidos] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [open, setOpen] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    try {
      setExpenses(await expensesService.listar({ dataInicial, dataFinal, excluidos: mostrarExcluidos, limit: 500 }));
      setErro("");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Falha ao carregar gastos.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { void carregar(); }, [dataInicial, dataFinal, mostrarExcluidos]);

  const categories = useMemo(() => Array.from(new Set(expenses.map((item) => item.categoria))).sort(), [expenses]);
  const filtered = useMemo(() => expenses.filter((item) => item.descricao.toLowerCase().includes(search.toLowerCase()) && (!categoria || item.categoria === categoria)), [expenses, search, categoria]);
  const totalPeriodo = useMemo(() => filtered.filter((item) => !item.excluido).reduce((sum, item) => sum + Number(item.valor), 0), [filtered]);
  const days = useMemo(() => Math.max(1, Math.floor((new Date(`${dataFinal}T00:00:00`).getTime() - new Date(`${dataInicial}T00:00:00`).getTime()) / 86400000) + 1), [dataInicial, dataFinal]);

  async function criar(data: CriarGastoPayload) {
    setSalvando(true);
    try {
      const response = await expensesService.criar(data);
      setSucesso(response.mensagem);
      setOpen(false);
      await carregar();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Falha ao salvar gasto.");
    } finally { setSalvando(false); }
  }

  async function excluir(id: number) {
    if (!confirm("Deseja mover este gasto para os excluídos?")) return;
    try { await expensesService.excluir(id); await carregar(); }
    catch (error) { setErro(error instanceof Error ? error.message : "Falha ao excluir."); }
  }

  async function restaurar(id: number) {
    try { await expensesService.restaurar(id); await carregar(); }
    catch (error) { setErro(error instanceof Error ? error.message : "Falha ao restaurar."); }
  }

  return <div className="space-y-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold">Gastos</h1><p className="text-sm text-slate-500">Filtre por período e acompanhe o total dos dias selecionados.</p></div><Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger asChild><Button><Plus size={18} />Inserir gasto</Button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" /><Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0d2b4d]"><div className="mb-5 flex items-center justify-between"><Dialog.Title className="text-xl font-bold">Novo gasto</Dialog.Title><Dialog.Close><X /></Dialog.Close></div><ExpenseForm onSubmit={criar} carregando={salvando} /></Dialog.Content></Dialog.Portal></Dialog.Root></div>
  {erro && <PageError mensagem={erro} tentarNovamente={() => void carregar()} />}{sucesso && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30">{sucesso}</p>}
  <div className="grid gap-4 sm:grid-cols-3"><Card><p className="text-sm text-slate-500">Total no período</p><p className="mt-2 text-2xl font-bold">{formatCurrency(totalPeriodo)}</p></Card><Card><p className="text-sm text-slate-500">Período selecionado</p><p className="mt-2 text-2xl font-bold">{days} dias</p></Card><Card><p className="text-sm text-slate-500">Média por dia</p><p className="mt-2 text-2xl font-bold">{formatCurrency(totalPeriodo / days)}</p></Card></div>
  <Card><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"><label className="grid gap-1 text-sm"><span>Data inicial</span><Input type="date" value={dataInicial} onChange={(event) => setDataInicial(event.target.value)} /></label><label className="grid gap-1 text-sm"><span>Data final</span><Input type="date" value={dataFinal} onChange={(event) => setDataFinal(event.target.value)} /></label><label className="grid gap-1 text-sm"><span>Categoria</span><select className="h-10 rounded-xl border bg-transparent px-3" value={categoria} onChange={(event) => setCategoria(event.target.value)}><option value="">Todas</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="grid gap-1 text-sm"><span>Descrição</span><div className="relative"><Search className="absolute left-3 top-3 text-[#9fb4ca]" size={18} /><Input className="pl-10" placeholder="Buscar" value={search} onChange={(event) => setSearch(event.target.value)} /></div></label><label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" checked={mostrarExcluidos} onChange={(event) => setMostrarExcluidos(event.target.checked)} />Mostrar somente excluídos</label></div><div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><CalendarRange size={15} />Os valores acima consideram exatamente o intervalo informado.</div></Card>
  {carregando ? <PageLoading texto="Carregando gastos..." /> : filtered.length === 0 ? <Card><p className="text-sm text-slate-500">Você ainda não registrou nenhum gasto neste período.</p></Card> : <><div className="grid gap-4 lg:hidden">{filtered.map((item) => <Card key={item.id} className={item.excluido ? "opacity-60" : ""}><div className="flex justify-between"><div><p className="font-semibold">{item.descricao}</p><p className="text-xs text-slate-500">{item.categoria} • {formatDate(item.data_gasto)}</p></div><strong>{formatCurrency(Number(item.valor))}</strong></div><div className="mt-4 flex justify-between"><Badge variant={item.excluido ? "warning" : item.total_parcelas && item.total_parcelas > 1 ? "info" : "neutral"}>{item.excluido ? "Excluído" : item.total_parcelas && item.total_parcelas > 1 ? `${item.parcela_atual}/${item.total_parcelas}` : "À vista"}</Badge>{item.excluido ? <Button variant="ghost" size="sm" onClick={() => void restaurar(item.id)}><RotateCcw size={16} />Restaurar</Button> : <Button variant="ghost" size="sm" onClick={() => void excluir(item.id)}><Trash2 size={16} /></Button>}</div></Card>)}</div><Card className="hidden overflow-x-auto p-0 lg:block"><table className="w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-[#12375f]"><tr>{["Descrição", "Categoria", "Valor", "Pagamento", "Data", "Parcela", "Origem", "Ações"].map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className={`border-t ${item.excluido ? "opacity-60" : ""}`}><td className="px-4 py-3 font-medium">{item.descricao}</td><td className="px-4 py-3">{item.categoria}</td><td className="px-4 py-3">{formatCurrency(Number(item.valor))}</td><td className="px-4 py-3">{item.forma_pagamento ?? "—"}</td><td className="px-4 py-3">{formatDate(item.data_gasto)}</td><td className="px-4 py-3">{item.total_parcelas && item.total_parcelas > 1 ? `${item.parcela_atual}/${item.total_parcelas}` : "À vista"}</td><td className="px-4 py-3">{item.origem}</td><td className="px-4 py-3">{item.excluido ? <Button variant="ghost" size="sm" onClick={() => void restaurar(item.id)}><RotateCcw size={16} /></Button> : <Button variant="ghost" size="sm" onClick={() => void excluir(item.id)}><Trash2 size={16} /></Button>}</td></tr>)}</tbody></table></Card></>}</div>;
}
