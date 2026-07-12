import { apiRequest } from "@/lib/api";
import type { MetaFinanceira, MetaFinanceiraPayload } from "@/types/api";

export const goalsService = {
  listar: () => apiRequest<MetaFinanceira[]>("/metas"),
  criar: (payload: MetaFinanceiraPayload) =>
    apiRequest<MetaFinanceira>("/metas", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  atualizar: (id: number, payload: Partial<MetaFinanceiraPayload> & { status?: MetaFinanceira["status"] }) =>
    apiRequest<MetaFinanceira>(`/metas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
