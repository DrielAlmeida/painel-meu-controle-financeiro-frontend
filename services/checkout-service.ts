import { apiRequest } from "@/lib/api";

export type PublicPlanSlug = "basico" | "premium";

export interface AsaasCheckoutPayload {
  nome: string;
  telefone: string;
  email: string;
  cpf_cnpj: string;
  senha: string;
  plano: PublicPlanSlug;
}

export interface AsaasCheckoutResponse {
  checkout_url: string;
  checkout_id?: string;
  usuario_id?: number;
  mensagem?: string;
}

export const checkoutService = {
  criarCheckout: (payload: AsaasCheckoutPayload) =>
    apiRequest<AsaasCheckoutResponse>("/pagamentos/asaas/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
