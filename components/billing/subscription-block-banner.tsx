import { AlertTriangle } from "lucide-react";
import { useSubscriptionBlock } from "@/components/billing/subscription-block-provider";

export function SubscriptionBlockBanner({
  className = "",
  mensagem,
}: {
  className?: string;
  mensagem?: string;
}) {
  const { bloqueioAssinatura } = useSubscriptionBlock();
  const texto = mensagem?.trim() ? mensagem : bloqueioAssinatura?.mensagem;
  if (!texto) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-500/50 dark:bg-amber-950/60 dark:text-amber-100 ${className}`}
    >
      <AlertTriangle className="mt-0.5 shrink-0" size={20} />
      <div>
        <strong className="block">Acesso temporariamente limitado</strong>
        <p className="mt-1 text-sm">{texto}</p>
      </div>
    </div>
  );
}
