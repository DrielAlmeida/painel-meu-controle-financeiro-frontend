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

export interface RenovarPlanoResponse {
  sucesso: boolean;
  assinatura_id: number;
  plano_id: number;
  plano_nome: string;
  valor: number;
  duracao_meses: number;
  ciclo: string;
  invoice_url: string;
  mensagem: string;
}

export const billingService = {
  minhaAssinatura: () =>
    apiRequest<MinhaAssinatura | null>("/pagamentos/minha-assinatura"),
  renovar: (planoId: number, cpfCnpj?: string) =>
    apiRequest<RenovarPlanoResponse>("/pagamentos/renovar", {
      method: "POST",
      body: JSON.stringify({
        plano_id: planoId,
        forma_pagamento: "UNDEFINED",
        cpf_cnpj: cpfCnpj?.replace(/\D/g, "") || null,
      }),
    }),
};