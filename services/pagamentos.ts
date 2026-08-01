import { apiRequest } from "@/lib/api";

export type FormaPagamento =
  | "UNDEFINED"
  | "PIX"
  | "BOLETO"
  | "CREDIT_CARD";

export interface VincularClientePayload {
  cpf_cnpj: string;
}

export interface VincularClienteResponse {
  sucesso: boolean;
  mensagem: string;
}

export interface CriarAssinaturaPayload {
  plano_id: number;
  forma_pagamento?: FormaPagamento;
  primeira_data_vencimento?: string;
  cpf_cnpj?: string;
}

export interface AssinaturaAsaasResponse {
  sucesso: boolean;
  assinatura_id: number;
  plano: string;
  valor: number;
  ciclo: string;
  forma_pagamento: string;
  status: string | null;
  invoice_url: string | null;
  mensagem: string;
}

export interface TestarConexaoAsaasResponse {
  sucesso: boolean;
  mensagem: string;
}

export const pagamentosService = {
  vincularCliente: (payload: VincularClientePayload) =>
    apiRequest<VincularClienteResponse>("/pagamentos/asaas/clientes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  criarAssinatura: (payload: CriarAssinaturaPayload) =>
    apiRequest<AssinaturaAsaasResponse>("/pagamentos/asaas/assinaturas", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  testarConexao: () =>
    apiRequest<TestarConexaoAsaasResponse>(
      "/pagamentos/asaas/testar-conexao",
      { method: "POST" },
    ),
};
