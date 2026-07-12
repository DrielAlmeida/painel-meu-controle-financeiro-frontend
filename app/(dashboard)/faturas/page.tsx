import { useEffect, useState } from "react";
import { CalendarClock, CreditCard, ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageError, PageLoading } from "@/components/feedback/page-state";
import { billingService, type MinhaAssinatura } from "@/services/billing-service";
import { formatCurrency } from "@/lib/utils";

function formatDate(value: string | null) {
  if (!value) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`));
}

export default function FaturasPage() {
  const [assinatura, setAssinatura] = useState<MinhaAssinatura | null | undefined>(undefined);
  const [erro, setErro] = useState("");
  const [renovando, setRenovando] = useState(false);

  async function carregar() {
    setErro("");
    try { setAssinatura(await billingService.minhaAssinatura()); }
    catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível carregar sua assinatura."); }
  }

  useEffect(() => { void carregar(); }, []);

  async function renovar() {
    if (!assinatura) return;
    setRenovando(true);
    setErro("");
    try {
      const result = await billingService.renovar(assinatura.plano_id);
      window.location.assign(result.invoice_url);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível gerar a renovação.");
    } finally { setRenovando(false); }
  }

  if (assinatura === undefined && !erro) return <PageLoading/>;
  if (erro && assinatura === undefined) return <PageError mensagem={erro} tentarNovamente={()=>void carregar()}/>;

  const urgente = assinatura?.dias_restantes != null && assinatura.dias_restantes <= 2;

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-black">Minha assinatura e faturas</h1><p className="text-sm text-slate-600 dark:text-[#9fb4ca]">Acompanhe vencimento, status e renove seu acesso.</p></div>
    {!assinatura ? <Card><h2 className="font-bold">Nenhuma assinatura encontrada</h2><p className="mt-2 text-sm text-slate-600">Escolha um plano na página inicial para começar.</p></Card> : <>
      {urgente && <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-100"><strong>Seu plano vence em {assinatura.dias_restantes} dia(s).</strong> Renove agora para não perder o acesso.</div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><div className="text-sm text-slate-500">Plano</div><strong className="mt-2 block text-xl">{assinatura.plano_nome}</strong></Card>
        <Card><div className="text-sm text-slate-500">Status</div><strong className="mt-2 block text-xl capitalize">{assinatura.status}</strong></Card>
        <Card><div className="text-sm text-slate-500">Valor</div><strong className="mt-2 block text-xl">{formatCurrency(assinatura.valor)}</strong></Card>
        <Card><div className="text-sm text-slate-500">Vencimento</div><strong className="mt-2 block text-xl">{formatDate(assinatura.data_vencimento)}</strong></Card>
      </div>
      <Card className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div><div className="flex items-center gap-2"><CalendarClock className="text-blue-600"/><h2 className="font-bold">Renovação</h2></div><p className="mt-2 text-sm text-slate-600 dark:text-[#9fb4ca]">Você pode renovar quando faltarem dois dias ou quando a assinatura estiver vencida.</p></div>
        <div className="flex flex-wrap gap-2">
          {assinatura.invoice_url && <Button variant="secondary" onClick={()=>window.open(assinatura.invoice_url!,"_blank")}><ExternalLink size={16}/> Abrir fatura</Button>}
          <Button onClick={()=>void renovar()} disabled={renovando || (!urgente && assinatura.status === "ativa")}><RefreshCw size={16}/>{renovando?"Gerando...":"Renovar plano"}</Button>
        </div>
      </Card>
      <Card><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-emerald-600"/><div><h2 className="font-bold">Pagamento protegido pelo Asaas</h2><p className="mt-1 text-sm text-slate-600 dark:text-[#9fb4ca]">Os dados de pagamento são preenchidos no ambiente seguro do Asaas.</p></div></div></Card>
    </>}
  </div>;
}
