import { apiRequest } from "@/lib/api";
import type { AdminDashboard, AdminUsuario, AdminUsuarioCreate } from "@/types/api";

export const adminService = {
  dashboard: () => apiRequest<AdminDashboard>("/admin/dashboard"),
  listarUsuarios: (params = "") => apiRequest<AdminUsuario[]>(`/admin/usuarios${params ? `?${params}` : ""}`),
  pendentes: () => apiRequest<AdminUsuario[]>("/admin/usuarios/pendentes"),
  criarUsuario: (payload: AdminUsuarioCreate) => apiRequest<AdminUsuario>("/admin/usuarios", { method: "POST", body: JSON.stringify(payload) }),
  atualizarUsuario: (id: number, payload: Partial<AdminUsuarioCreate>) => apiRequest<AdminUsuario>(`/admin/usuarios/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  aprovar: (id: number) => apiRequest<AdminUsuario>(`/admin/usuarios/${id}/aprovar`, { method: "POST" }),
  bloquear: (id: number) => apiRequest<AdminUsuario>(`/admin/usuarios/${id}/bloquear`, { method: "POST" }),
  desbloquear: (id: number) => apiRequest<AdminUsuario>(`/admin/usuarios/${id}/desbloquear`, { method: "POST" }),
  recusar: (id: number) => apiRequest<AdminUsuario>(`/admin/usuarios/${id}/recusar`, { method: "POST" }),
  tornarAdmin: (id: number) => apiRequest<AdminUsuario>(`/admin/usuarios/${id}/tornar-administrador`, { method: "POST" }),
  removerAdmin: (id: number) => apiRequest<AdminUsuario>(`/admin/usuarios/${id}/remover-administrador`, { method: "POST" }),
  redefinirSenha: (id: number, nova_senha: string) => apiRequest<{ mensagem: string }>(`/admin/usuarios/${id}/redefinir-senha`, { method: "POST", body: JSON.stringify({ nova_senha }) }),
  excluir: (id: number) => apiRequest<{ mensagem: string }>(`/admin/usuarios/${id}`, { method: "DELETE" }),
};
