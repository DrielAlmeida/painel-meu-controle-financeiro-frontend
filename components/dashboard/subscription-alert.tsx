import { useEffect, useState } from "react";
import Link from "@/components/router-link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { billingService, type MinhaAssinatura } from "@/services/billing-service";

export function SubscriptionAlert() {
  const [assinatura, setAssinatura] = useState<MinhaAssinatura | null>(null);
  useEffect(() => { billingService.minhaAssinatura().then(setAssinatura).catch(()=>undefined); }, []);
  if (!assinatura || assinatura.dias_restantes == null || assinatura.dias_restantes > 2) return null;
  return <div className="mx-4 mt-4 flex flex-col gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between lg:mx-8 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-100"><span className="flex items-center gap-2"><AlertTriangle size={17}/><strong>Seu plano vence em {assinatura.dias_restantes} dia(s).</strong> Renove para manter o acesso.</span><Link href="/faturas" className="inline-flex items-center gap-1 font-bold">Ver fatura <ArrowRight size={15}/></Link></div>;
}
