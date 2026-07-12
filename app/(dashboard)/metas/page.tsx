
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, PiggyBank, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageError, PageLoading } from "@/components/feedback/page-state";
import { GoalForm } from "@/components/forms/goal-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import { goalsService } from "@/services/goals-service";
import type { MetaFinanceira, MetaFinanceiraPayload } from "@/types/api";

export default function Page() {
  const [data, setData] = useState<MetaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    goalsService.listar().then(setData).catch((e) => setErro(e.message)).finally(() => setLoading(false));
  }, []);

  async function criar(payload: MetaFinanceiraPayload) {
    setSaving(true);
    try {
      const created = await goalsService.criar(payload);
      setData((items) => [created, ...items]);
      setOpen(false);
      setErro("");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Falha ao cadastrar meta.");
    } finally {
      setSaving(false);
    }
  }

  async function adicionarValor(goal: MetaFinanceira) {
    const input = window.prompt("Quanto deseja acrescentar à meta?", "0");
    if (!input) return;
    const amount = Number(input.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) return;
    try {
      const updated = await goalsService.atualizar(goal.id, { valor_atual: Number(goal.valor_atual) + amount });
      setData((items) => items.map((item) => item.id === goal.id ? updated : item));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Falha ao atualizar meta.");
    }
  }

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold">Metas</h1><p className="text-sm text-slate-500">Crie objetivos e acompanhe o valor acumulado.</p></div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild><Button><Plus size={18} />Nova meta</Button></Dialog.Trigger>
          <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" /><Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0d2b4d]"><div className="mb-5 flex items-center justify-between"><Dialog.Title className="text-xl font-bold">Cadastrar meta</Dialog.Title><Dialog.Close><X /></Dialog.Close></div><GoalForm onSubmit={criar} loading={saving} /></Dialog.Content></Dialog.Portal>
        </Dialog.Root>
      </div>
      {erro && <PageError mensagem={erro} />}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.length === 0 ? <Card className="md:col-span-2 xl:col-span-3"><div className="flex items-center gap-3"><PiggyBank className="text-blue-500" /><div><p className="font-semibold">Você ainda não cadastrou nenhuma meta financeira.</p><p className="text-sm text-slate-500">Use o botão “Nova meta” para começar.</p></div></div></Card> : data.map((goal) => {
          const percent = Math.min(100, Math.round((Number(goal.valor_atual) / Number(goal.valor_meta)) * 100));
          const remaining = Math.max(0, Number(goal.valor_meta) - Number(goal.valor_atual));
          return <Card key={goal.id}><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{goal.titulo}</h2><p className="text-sm text-slate-500">{goal.categoria || "Objetivo financeiro"}</p></div><span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500">{goal.status}</span></div><div className="mt-4 flex justify-between text-sm"><span>{formatCurrency(Number(goal.valor_atual))}</span><span>{formatCurrency(Number(goal.valor_meta))}</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-[#1a4775]"><div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} /></div><div className="mt-3 flex justify-between text-sm"><strong>{percent}% concluído</strong><span>{goal.data_limite ? `Até ${formatDate(goal.data_limite)}` : "Sem prazo"}</span></div><p className="mt-3 text-sm text-slate-500">Falta {formatCurrency(remaining)}</p><Button className="mt-4 w-full" variant="secondary" onClick={() => void adicionarValor(goal)}>Acrescentar valor</Button></Card>;
        })}
      </div>
    </div>
  );
}
