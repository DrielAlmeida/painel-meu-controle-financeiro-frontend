import { apiRequest } from "@/lib/api";
import type { CriarGastoPayload, CriarGastoResponse, Gasto } from "@/types/api";

export interface ExpenseFilters {
  dataInicial?: string;
  dataFinal?: string;
  categoria?: string;
  formaPagamento?: string;
  descricao?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  excluidos?: boolean;
  limit?: number;
}

export const expensesService = {
  listar: (filters: ExpenseFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.dataInicial) params.set("data_inicial", filters.dataInicial);
    if (filters.dataFinal) params.set("data_final", filters.dataFinal);
    if (filters.categoria) params.set("categoria", filters.categoria);
    if (filters.formaPagamento) params.set("forma_pagamento", filters.formaPagamento);
    if (filters.descricao) params.set("descricao", filters.descricao);
    if (filters.valorMinimo !== undefined) params.set("valor_minimo", String(filters.valorMinimo));
    if (filters.valorMaximo !== undefined) params.set("valor_maximo", String(filters.valorMaximo));
    params.set("excluidos", String(Boolean(filters.excluidos)));
    params.set("limit", String(filters.limit ?? 500));
    return apiRequest<Gasto[]>(`/gastos?${params.toString()}`);
  },
  criar: (payload: CriarGastoPayload) =>
    apiRequest<CriarGastoResponse>("/gastos", { method: "POST", body: JSON.stringify(payload) }),
  excluir: (id: number) => apiRequest<Gasto>(`/gastos/${id}`, { method: "DELETE" }),
  restaurar: (id: number) => apiRequest<Gasto>(`/gastos/${id}/restaurar`, { method: "POST" }),
};
