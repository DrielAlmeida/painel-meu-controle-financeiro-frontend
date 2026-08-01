import {
  clearSubscriptionBlock,
  parseSubscriptionBlock,
  publishSubscriptionBlock,
} from "@/services/subscription-block";

const API_BASE = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/+$/, "");

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const CSRF_VALIDATION_ERROR =
  "Não foi possível validar a origem da requisição.";

export const AUTH_SESSION_EXPIRED_EVENT = "auth-session-expired";

export interface ApiRequestOptions extends RequestInit {
  csrf?: boolean;
  handleUnauthorized?: boolean;
}

let csrfToken: string | null = null;
let csrfRefreshPromise: Promise<string> | null = null;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function errorMessage(status: number, detail: unknown, errorId?: string) {
  let message = "Não foi possível concluir a solicitação.";

  if (status >= 500) {
    message = "O serviço está temporariamente indisponível. Tente novamente.";
  } else if (typeof detail === "string" && detail.trim()) {
    message = detail;
  } else if (Array.isArray(detail)) {
    const firstMessage = asRecord(detail[0])?.msg;
    if (typeof firstMessage === "string" && firstMessage.trim()) {
      message = firstMessage;
    }
  } else if (status === 401) {
    message = "Sua sessão expirou. Entre novamente.";
  } else if (status === 403) {
    message = "Você não tem permissão para concluir esta ação.";
  } else if (status === 404) {
    message = "O recurso solicitado não foi encontrado.";
  } else if (status === 422) {
    message = "Revise os dados informados e tente novamente.";
  }

  return errorId ? `${message} Código de suporte: ${errorId}.` : message;
}

export class ApiError extends Error {
  readonly status: number;
  readonly detail: unknown;
  readonly errorId?: string;

  constructor(status: number, detail: unknown, errorId?: string) {
    super(errorMessage(status, detail, errorId));
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.errorId = errorId;
  }
}

export function setCsrfToken(token: string | null) {
  csrfToken = typeof token === "string" && token.trim() ? token : null;
}

export function clearCsrfToken() {
  csrfToken = null;
}

function notifySessionExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => "");
  return text || null;
}

function createApiError(response: Response, data: unknown) {
  const body = asRecord(data);
  const detail =
    body?.detail ?? body?.mensagem ?? data ?? `HTTP ${response.status}`;
  const rawErrorId = body?.error_id;
  const errorId =
    typeof rawErrorId === "string" && rawErrorId.trim()
      ? rawErrorId
      : undefined;

  return new ApiError(response.status, detail, errorId);
}

function throwIfSubscriptionBlocked(response: Response, data: unknown) {
  if (response.status !== 402) return;

  const block = parseSubscriptionBlock(
    data,
    response.headers.get("X-Assinatura-Bloqueio"),
  );
  publishSubscriptionBlock(block);
  throw new ApiError(response.status, block.mensagem);
}

async function requestCsrfToken() {
  const response = await fetch(`${API_BASE}/auth/csrf`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const data = await readResponseBody(response);

  if (!response.ok) {
    throwIfSubscriptionBlocked(response, data);
    clearCsrfToken();
    throw createApiError(response, data);
  }

  const token = asRecord(data)?.csrf_token;
  if (typeof token !== "string" || !token.trim()) {
    clearCsrfToken();
    throw new ApiError(
      500,
      "A API não retornou um token de segurança válido.",
    );
  }

  setCsrfToken(token);
  return token;
}

export async function refreshCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  if (!csrfRefreshPromise) {
    csrfRefreshPromise = requestCsrfToken().finally(() => {
      csrfRefreshPromise = null;
    });
  }

  return csrfRefreshPromise;
}

async function requiredCsrfToken(handleUnauthorized: boolean) {
  try {
    return csrfToken ?? (await refreshCsrfToken());
  } catch (error) {
    if (
      handleUnauthorized &&
      error instanceof ApiError &&
      error.status === 401
    ) {
      clearSubscriptionBlock();
      notifySessionExpired();
    }
    throw error;
  }
}

async function executeRequest<T>(
  endpoint: string,
  options: RequestInit,
  requiresCsrf: boolean,
  handleUnauthorized: boolean,
  csrfRetried = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  if (requiresCsrf) {
    headers.set(
      "X-CSRF-Token",
      await requiredCsrfToken(handleUnauthorized),
    );
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const data = await readResponseBody(response);

  if (response.ok) return data as T;

  throwIfSubscriptionBlocked(response, data);

  const detail = asRecord(data)?.detail;
  if (
    response.status === 403 &&
    requiresCsrf &&
    !csrfRetried &&
    detail === CSRF_VALIDATION_ERROR
  ) {
    clearCsrfToken();
    await requiredCsrfToken(handleUnauthorized);
    return executeRequest<T>(
      endpoint,
      options,
      requiresCsrf,
      handleUnauthorized,
      true,
    );
  }

  if (response.status === 401) {
    clearCsrfToken();
    clearSubscriptionBlock();
    if (handleUnauthorized) notifySessionExpired();
  }

  throw createApiError(response, data);
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    csrf,
    handleUnauthorized = true,
    ...requestOptions
  } = options;
  const method = (requestOptions.method ?? "GET").toUpperCase();
  const requiresCsrf = csrf ?? UNSAFE_METHODS.has(method);

  return executeRequest<T>(
    endpoint,
    { ...requestOptions, method },
    requiresCsrf,
    handleUnauthorized,
  );
}
