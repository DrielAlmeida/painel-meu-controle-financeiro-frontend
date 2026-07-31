import { apiRequest } from "@/lib/api";

export interface PasswordRequest {
  telefone: string;
}

export interface ValidateRequest {
  telefone: string;
  codigo: string;
}

export interface ValidateResponse {
  valido: boolean;
}

export interface ConfirmRequest {
  telefone: string;
  codigo: string;
  nova_senha: string;
}

export async function solicitarCodigo(
  dados: PasswordRequest
) {
  return apiRequest("/password/request", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function validarCodigo(
  dados: ValidateRequest
) {
  return apiRequest<ValidateResponse>("/password/validate", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function alterarSenha(
  dados: ConfirmRequest
) {
  return apiRequest("/password/confirm", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}