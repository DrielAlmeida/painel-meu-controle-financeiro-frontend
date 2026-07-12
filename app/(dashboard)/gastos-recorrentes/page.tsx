
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Pause, Play, Plus, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageError, PageLoading } from "@/components/feedback/page-state";
import { RecurringForm } from "@/components/forms/recurring-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import { recurringService } from "@/services/recurring-service";
import type { GastoRecorrente, GastoRecorrentePayload } from "@/types/api";

export default function Page() {
  const [data, setData] = useState<GastoRecorrente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => { recurringService.listar().then(setData).catch((e) => setErro(e.message)).finally(() => setLoading(false)); }, []);

  async function criar(payload: GastoRecorrentePayload) {
    setSaving(true);
    try { const created = await recurringService.criar(payload); setData((items) => [created, ...items]); setOpen(false); setErro(""); }
    catch (error) { setErro(error instanceof Error ? error.message : "Falha ao cadastrar recorrente."); }
    finally { setSaving(false); }
  }

  async function toggle(item: GastoRecorrente) {
    try { const updated = await recurringService.atualizar(item.id, { ativo: !item.ativo }); setData((items) => items.map((current) => current.id === item.id ? updated : current)); }
    catch (error) { setErro(error instanceof Error ? error.message : "Falha ao atualizar."); }
  }

  async function excluir(item: GastoRecorrente) {
    if (!confirm(`Excluir ${item.descricao}?`)) return;
    try { await recurringService.excluir(item.id); setData((items) => items.filter((current) => current.id !== item.id)); }
    catch (error) { setErro(error instanceof Error ? error.message : "Falha ao excluir."); }
  }

  if (loading) return <PageLoading />;

  return <div className="space-y-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold">Gastos recorrentes</h1><p className="text-sm text-slate-500">Contas e assinaturas com geração automática.</p></div><Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger asChild><Button><Plus size={18} />Novo recorrente</Button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" /><Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0d2b4d]"><div className="mb-5 flex items-center justify-between"><Dialog.Title className="text-xl font-bold">Cadastrar gasto recorrente</Dialog.Title><Dialog.Close><X /></Dialog.Close></div><RecurringForm onSubmit={criar} loading={saving} /></Dialog.Content></Dialog.Portal></Dialog.Root></div>{erro && <PageError mensagem={erro} />}<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.length === 0 ? <Card className="md:col-span-2 xl:col-span-3"><p className="font-semibold">Nenhum gasto recorrente cadastrado.</p><p className="mt-1 text-sm text-slate-500">Use o botão “Novo recorrente” para adicionar aluguel, internet, academia ou assinaturas.</p></Card> : data.map((item) => <Card key={item.id}><div className="flex items-start justify-between"><div><h2 className="font-bold">{item.descricao}</h2><p className="text-sm text-slate-500">{item.categoria} • {item.frequencia}</p></div><Badge variant={item.ativo ? "success" : "warning"}>{item.ativo ? "Ativo" : "Pausado"}</Badge></div><p className="mt-4 text-2xl font-bold">{formatCurrency(Number(item.valor))}</p><p className="mt-1 text-sm text-slate-500">Próxima execução: {item.proxima_execucao ? formatDate(item.proxima_execucao) : "Não definida"}</p><p className="mt-1 text-xs text-slate-500">Vencimento: {item.dia_vencimento ? `dia ${item.dia_vencimento}` : "não definido"}</p><div className="mt-5 flex gap-2"><Button variant="secondary" size="sm" onClick={() => void toggle(item)}>{item.ativo ? <Pause size={16} /> : <Play size={16} />}{item.ativo ? "Pausar" : "Reativar"}</Button><Button variant="ghost" size="sm" onClick={() => void excluir(item)}><Trash2 size={16} /></Button></div></Card>)}</div></div>;
}
