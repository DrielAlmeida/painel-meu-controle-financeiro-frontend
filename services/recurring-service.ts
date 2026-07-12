import { apiRequest } from "@/lib/api";
import type { GastoRecorrente, GastoRecorrentePayload } from "@/types/api";

export const recurringService = {
  listar: () => apiRequest<GastoRecorrente[]>("/gastos-recorrentes"),
  criar: (payload: GastoRecorrentePayload) =>
    apiRequest<GastoRecorrente>("/gastos-recorrentes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  atualizar: (id: number, payload: Partial<GastoRecorrentePayload> & { ativo?: boolean }) =>
    apiRequest<GastoRecorrente>(`/gastos-recorrentes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  excluir: (id: number) =>
    apiRequest<GastoRecorrente>(`/gastos-recorrentes/${id}`, { method: "DELETE" }),
};
