import { apiRequest } from "@/lib/api";
import type { DashboardDesempenho, DashboardResumo } from "@/types/api";
export const dashboardService = {
  resumo: () => apiRequest<DashboardResumo>("/dashboard/resumo"),
  desempenho: () => apiRequest<DashboardDesempenho>("/dashboard/desempenho"),
};
