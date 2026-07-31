const ASAAS_DOMAIN = "asaas.com";

function isAllowedAsaasHost(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/\.$/, "");
  return (
    normalized === ASAAS_DOMAIN || normalized.endsWith(`.${ASAAS_DOMAIN}`)
  );
}

function isAllowedDevelopmentHost(url: URL) {
  if (!import.meta.env.DEV) return false;
  return (
    (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
    (url.protocol === "http:" || url.protocol === "https:")
  );
}

export function getSafePaymentUrl(value: string | null | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.username || url.password) return null;

    if (isAllowedDevelopmentHost(url)) return url.href;
    if (url.protocol !== "https:" || !isAllowedAsaasHost(url.hostname)) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

export function requireSafePaymentUrl(value: string | null | undefined) {
  const safeUrl = getSafePaymentUrl(value);
  if (!safeUrl) {
    throw new Error(
      "O link de pagamento recebido não pertence ao ambiente seguro do Asaas.",
    );
  }
  return safeUrl;
}
