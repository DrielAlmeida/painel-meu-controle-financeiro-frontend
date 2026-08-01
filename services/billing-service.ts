import { apiRequest } from "@/lib/api";
import type { FormaPagamento } from "@/services/pagamentos";

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
  invoice_url: string | null;
  mensagem: string;
}

export interface SincronizarPagamentoResponse {
  pago: boolean;
  mensagem: string;
}

export interface RenovarPlanoOptions {
  formaPagamento?: FormaPagamento;
  cpfCnpj?: string;
}

export const billingService = {
  minhaAssinatura: () =>
    apiRequest<MinhaAssinatura | null>("/pagamentos/minha-assinatura", {
      cache: "no-store",
    }),

  sincronizarPagamento: () =>
    apiRequest<SincronizarPagamentoResponse>("/pagamentos/sincronizar", {
      method: "POST",
    }),

  renovar: (planoId: number, options: RenovarPlanoOptions = {}) => {
    const cpfCnpj = options.cpfCnpj?.replace(/\D/g, "");
    return apiRequest<RenovarPlanoResponse>("/pagamentos/renovar", {
      method: "POST",
      body: JSON.stringify({
        plano_id: planoId,
        forma_pagamento: options.formaPagamento ?? "UNDEFINED",
        ...(cpfCnpj ? { cpf_cnpj: cpfCnpj } : {}),
      }),
    });
  },
};
