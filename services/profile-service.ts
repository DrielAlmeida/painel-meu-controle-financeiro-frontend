import { apiRequest } from "@/lib/api";
import type { PerfilFinanceiro, PerfilFinanceiroPayload } from "@/types/api";
export const profileService = {
  buscar: () => apiRequest<PerfilFinanceiro | null>("/perfil-financeiro"),
  salvar: (payload: PerfilFinanceiroPayload) => apiRequest<PerfilFinanceiro>("/perfil-financeiro", { method: "PUT", body: JSON.stringify(payload) }),
};
