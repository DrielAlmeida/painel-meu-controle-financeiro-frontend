export interface PendingCheckout {
  planId: number;
  nome: string;
  telefone: string;
  email: string | null;
  cpfCnpj: string;
  accountCreated: boolean;
  updatedAt: string;
}

const STORAGE_KEY = "painel-financeiro:checkout-pendente";
const MAX_PENDING_AGE_MS = 2 * 60 * 60 * 1000;

function isPendingCheckout(value: unknown): value is PendingCheckout {
  if (!value || typeof value !== "object") return false;

  const pending = value as Record<string, unknown>;
  return (
    typeof pending.planId === "number" &&
    Number.isSafeInteger(pending.planId) &&
    pending.planId > 0 &&
    typeof pending.nome === "string" &&
    typeof pending.telefone === "string" &&
    pending.telefone.length > 0 &&
    (pending.email === null || typeof pending.email === "string") &&
    typeof pending.cpfCnpj === "string" &&
    pending.cpfCnpj.length > 0 &&
    typeof pending.accountCreated === "boolean" &&
    typeof pending.updatedAt === "string"
  );
}

function removeLegacyStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // O checkout continua funcionando mesmo quando o navegador bloqueia storage.
  }
}

function readStoredValue() {
  try {
    const current = sessionStorage.getItem(STORAGE_KEY);
    if (current) {
      removeLegacyStorage();
      return current;
    }

    const legacy = localStorage.getItem(STORAGE_KEY);
    removeLegacyStorage();
    if (legacy) sessionStorage.setItem(STORAGE_KEY, legacy);
    return legacy;
  } catch {
    removeLegacyStorage();
    return null;
  }
}

export function getPendingCheckout(): PendingCheckout | null {
  try {
    const raw = readStoredValue();
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isPendingCheckout(parsed)) {
      clearPendingCheckout();
      return null;
    }

    const updatedAt = Date.parse(parsed.updatedAt);
    if (
      !Number.isFinite(updatedAt) ||
      Date.now() - updatedAt > MAX_PENDING_AGE_MS
    ) {
      clearPendingCheckout();
      return null;
    }

    return parsed;
  } catch {
    clearPendingCheckout();
    return null;
  }
}

export function savePendingCheckout(
  data: Omit<PendingCheckout, "updatedAt">,
) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...data, updatedAt: new Date().toISOString() }),
    );
    removeLegacyStorage();
  } catch {
    removeLegacyStorage();
  }
  window.dispatchEvent(new Event("checkout-pendente-alterado"));
}

export function markPendingAccountCreated() {
  const current = getPendingCheckout();
  if (!current) return;
  savePendingCheckout({ ...current, accountCreated: true });
}

export function clearPendingCheckout() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sem ação: o storage pode estar desabilitado pelo navegador.
  }
  removeLegacyStorage();
  window.dispatchEvent(new Event("checkout-pendente-alterado"));
}
