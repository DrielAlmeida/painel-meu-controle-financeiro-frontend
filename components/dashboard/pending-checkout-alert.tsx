import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import Link from "@/components/router-link";
import { clearPendingCheckout, getPendingCheckout, type PendingCheckout } from "@/services/checkout-progress";

export function PendingCheckoutAlert() {
  const [pending, setPending] = useState<PendingCheckout | null>(() => getPendingCheckout());

  useEffect(() => {
    const refresh = () => setPending(getPendingCheckout());
    window.addEventListener("storage", refresh);
    window.addEventListener("checkout-pendente-alterado", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("checkout-pendente-alterado", refresh);
    };
  }, []);

  if (!pending?.accountCreated) return null;

  return (
    <div className="mx-4 mt-4 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between lg:mx-8 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-100">
      <span className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 shrink-0" size={18} />
        <span><strong>Seu cadastro ainda não foi concluído.</strong> Vá até o pagamento para ativar o plano escolhido.</span>
      </span>
      <div className="flex items-center gap-2">
        <Link href={`/checkout?resume=1&plano_id=${pending.planId}`} className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 font-bold text-white hover:bg-amber-700">
          Concluir pagamento <ArrowRight size={15} />
        </Link>
        <button type="button" onClick={clearPendingCheckout} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-amber-200/60 dark:hover:bg-amber-900/60" aria-label="Ocultar aviso">
          <X size={17} />
        </button>
      </div>
    </div>
  );
}
