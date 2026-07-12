import { apiRequest } from "@/lib/api";

export type FormaPagamento = "UNDEFINED" | "PIX" | "BOLETO" | "CREDIT_CARD";

export interface CriarClienteAsaasPayload {
  nome: string;
  cpf_cnpj: string;
  email?: string | null;
  telefone?: string | null;
  usuario_id: number;
}

export interface ClienteAsaasResponse {
  sucesso: boolean;
  criado: boolean;
  cliente_id: string;
  nome: string;
  cpf_cnpj: string;
  mensagem: string;
}

export interface CriarAssinaturaPayload {
  cliente_id?: string | null;
  plano_id: number;
  forma_pagamento?: FormaPagamento;
  primeira_data_vencimento?: string | null;
  usuario_id: number;
}

export interface AssinaturaAsaasResponse {
  sucesso: boolean;
  assinatura_id: string;
  cliente_id: string;
  plano: string;
  valor: number;
  ciclo: string;
  forma_pagamento: string;
  status?: string | null;
  primeira_cobranca_id?: string | null;
  invoice_url?: string | null;
  mensagem: string;
}

export const pagamentosService = {
  criarOuLocalizarCliente: (payload: CriarClienteAsaasPayload) =>
    apiRequest<ClienteAsaasResponse>("/pagamentos/asaas/clientes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  criarAssinatura: (payload: CriarAssinaturaPayload) =>
    apiRequest<AssinaturaAsaasResponse>("/pagamentos/asaas/assinaturas", {
      method: "POST",
      body: JSON.stringify({
        cliente_id: payload.cliente_id ?? null,
        plano_id: payload.plano_id,
        forma_pagamento: payload.forma_pagamento ?? "UNDEFINED",
        primeira_data_vencimento: payload.primeira_data_vencimento ?? null,
        usuario_id: payload.usuario_id,
      }),
    }),
};
