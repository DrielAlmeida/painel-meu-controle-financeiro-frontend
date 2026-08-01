import {
  apiRequest,
  clearCsrfToken,
  setCsrfToken,
} from "@/lib/api";
import type {
  CadastroPayload,
  CadastroResponse,
  LoginPayload,
  LoginResponse,
  Usuario,
} from "@/types/api";

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      csrf: false,
      handleUnauthorized: false,
    });
    setCsrfToken(response.csrf_token);
    return response;
  },

  cadastro: (payload: CadastroPayload) =>
    apiRequest<CadastroResponse>("/auth/cadastro", {
      method: "POST",
      body: JSON.stringify(payload),
      csrf: false,
      handleUnauthorized: false,
    }),

  me: () =>
    apiRequest<Usuario>("/auth/me", { handleUnauthorized: false }),

  logout: async () => {
    try {
      return await apiRequest<{ mensagem: string }>("/auth/logout", {
        method: "POST",
      });
    } finally {
      clearCsrfToken();
    }
  },
};
