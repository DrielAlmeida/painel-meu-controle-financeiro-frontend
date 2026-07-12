import { apiRequest } from "@/lib/api";
import type { AuthResponse, CadastroPayload, LoginPayload, Usuario } from "@/types/api";

export const authService = {
  login: (payload: LoginPayload) => apiRequest<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  cadastro: (payload: CadastroPayload) => apiRequest<AuthResponse>("/auth/cadastro", { method: "POST", body: JSON.stringify(payload) }),
  me: () => apiRequest<Usuario>("/auth/me"),
  logout: () => apiRequest<{ mensagem: string }>("/auth/logout", { method: "POST" }),
};
