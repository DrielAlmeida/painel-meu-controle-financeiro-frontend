import { apiRequest } from "@/lib/api";
import type { Assinatura, AssinaturaPayload, Plano, PlanoPayload } from "@/types/api";

export const plansService = {
  listarPlanos: (incluirInativos = true) => apiRequest<Plano[]>(`/admin/planos?incluir_inativos=${incluirInativos}`),
  criarPlano: (payload: PlanoPayload) => apiRequest<Plano>("/admin/planos", { method: "POST", body: JSON.stringify(payload) }),
  atualizarPlano: (id: number, payload: Partial<PlanoPayload>) => apiRequest<Plano>(`/admin/planos/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  desativarPlano: (id: number) => apiRequest<Plano>(`/admin/planos/${id}`, { method: "DELETE" }),
  listarAssinaturas: () => apiRequest<Assinatura[]>("/admin/assinaturas"),
  criarAssinatura: (payload: AssinaturaPayload) => apiRequest<Assinatura>("/admin/assinaturas", { method: "POST", body: JSON.stringify(payload) }),
  atualizarAssinatura: (id: number, payload: Partial<AssinaturaPayload>) => apiRequest<Assinatura>(`/admin/assinaturas/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
};
