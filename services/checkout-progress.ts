export interface PendingCheckout {
  planId: number;
  accountCreated: boolean;
  updatedAt: string;
}

const STORAGE_KEY = "painel-financeiro:checkout-pendente";
const MAX_PENDING_AGE_MS = 2 * 60 * 60 * 1000;

function parsePendingCheckout(value: unknown): PendingCheckout | null {
  if (!value || typeof value !== "object") return null;

  const pending = value as Record<string, unknown>;
  if (
    typeof pending.planId !== "number" ||
    !Number.isSafeInteger(pending.planId) ||
    pending.planId <= 0 ||
    typeof pending.accountCreated !== "boolean" ||
    typeof pending.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    planId: pending.planId,
    accountCreated: pending.accountCreated,
    updatedAt: pending.updatedAt,
  };
}

function removeLegacyStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // O checkout continua funcionando mesmo quando o navegador bloqueia storage.
  }
}

function writeStoredValue(value: PendingCheckout) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    removeLegacyStorage();
  } catch {
    removeLegacyStorage();
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

    const pending = parsePendingCheckout(JSON.parse(raw));
    if (!pending) {
      clearPendingCheckout();
      return null;
    }

    const updatedAt = Date.parse(pending.updatedAt);
    if (
      !Number.isFinite(updatedAt) ||
      Date.now() - updatedAt > MAX_PENDING_AGE_MS
    ) {
      clearPendingCheckout();
      return null;
    }

    // Remove PII de objetos persistidos por versões antigas.
    writeStoredValue(pending);
    return pending;
  } catch {
    clearPendingCheckout();
    return null;
  }
}

export function savePendingCheckout(
  data: Omit<PendingCheckout, "updatedAt">,
) {
  writeStoredValue({ ...data, updatedAt: new Date().toISOString() });
  window.dispatchEvent(new Event("checkout-pendente-alterado"));
}

export function markPendingAccountCreated() {
  const current = getPendingCheckout();
  if (!current) return;
  savePendingCheckout({ planId: current.planId, accountCreated: true });
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
