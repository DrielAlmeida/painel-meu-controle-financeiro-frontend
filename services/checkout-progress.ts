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

export function getPendingCheckout(): PendingCheckout | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCheckout;
    if (!parsed.planId || !parsed.telefone || !parsed.cpfCnpj) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePendingCheckout(data: Omit<PendingCheckout, "updatedAt">) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }));
  window.dispatchEvent(new Event("checkout-pendente-alterado"));
}

export function markPendingAccountCreated() {
  const current = getPendingCheckout();
  if (!current) return;
  savePendingCheckout({ ...current, accountCreated: true });
}

export function clearPendingCheckout() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("checkout-pendente-alterado"));
}
