import { apiRequest } from "@/lib/api";

export interface MinhaAssinatura {
  assinatura_id: number;
  plano_id: number;
  plano_nome: string;
  status: "ativa" | "pendente" | "atrasada" | "cancelada" | "expirada";
  valor: number;
  data_inicio: string;
  data_vencimento: string | null;
  dias_restantes: number | null;
  invoice_url: string | null;
  renovacao_automatica: boolean;
}

export const billingService = {
  minhaAssinatura: () => apiRequest<MinhaAssinatura | null>("/pagamentos/minha-assinatura"),
  renovar: (planoId?: number) => apiRequest<{ invoice_url: string }>("/pagamentos/renovar", {
    method: "POST",
    body: JSON.stringify({ plano_id: planoId ?? null }),
  }),
};
