import { apiRequest } from "@/lib/api";
import type {
  AtivoFinanceiro,
  CriarAtivoFinanceiroPayload,
  CriarMovimentacaoPatrimonioPayload,
  MovimentacaoPatrimonio,
} from "@/types/api";

export const investmentsService = {
  listarAtivos: (incluirInativos = false) =>
    apiRequest<AtivoFinanceiro[]>(
      `/ativos-financeiros?incluir_inativos=${incluirInativos}`,
    ),

  criarAtivo: (payload: CriarAtivoFinanceiroPayload) =>
    apiRequest<AtivoFinanceiro>("/ativos-financeiros", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  atualizarAtivo: (
    id: number,
    payload: Partial<CriarAtivoFinanceiroPayload> & { ativo?: boolean },
  ) =>
    apiRequest<AtivoFinanceiro>(`/ativos-financeiros/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  excluirAtivo: (id: number) =>
    apiRequest<AtivoFinanceiro>(`/ativos-financeiros/${id}`, {
      method: "DELETE",
    }),

  listarMovimentacoes: (ativoId?: number) => {
    const query = ativoId ? `?ativo_financeiro_id=${ativoId}` : "";
    return apiRequest<MovimentacaoPatrimonio[]>(
      `/movimentacoes-financeiras${query}`,
    );
  },

  criarMovimentacao: (payload: CriarMovimentacaoPatrimonioPayload) =>
    apiRequest<MovimentacaoPatrimonio>("/movimentacoes-financeiras", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
