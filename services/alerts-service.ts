import { apiRequest } from "@/lib/api";
import type { AlertaFinanceiro } from "@/types/api";
export const alertsService = {
  listar: () => apiRequest<AlertaFinanceiro[]>("/alertas"),
  marcarLido: (id: number) => apiRequest<AlertaFinanceiro>(`/alertas/${id}/lido`, { method: "POST" }),
};
