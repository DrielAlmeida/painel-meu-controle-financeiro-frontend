export type SubscriptionBlockCode =
  | "assinatura_inexistente"
  | "pagamento_pendente"
  | "assinatura_atrasada"
  | "assinatura_vencida";

export type SubscriptionBlockAction =
  | "escolher_plano"
  | "pagar_fatura"
  | "renovar_plano";

export interface BlockedSubscriptionDetails {
  assinatura_id?: number;
  plano_id?: number;
  plano_nome?: string;
  status?: string;
  valor?: number;
  data_vencimento?: string | null;
  dias_em_atraso?: number;
  invoice_url?: string | null;
}

export interface SubscriptionBlock {
  mensagem: string;
  codigo: SubscriptionBlockCode;
  acao: SubscriptionBlockAction;
  assinatura: BlockedSubscriptionDetails;
}

type Listener = () => void;

const FALLBACK_MESSAGES: Record<SubscriptionBlockCode, string> = {
  assinatura_inexistente:
    "Você ainda não possui um plano contratado. Escolha um plano para acessar o sistema.",
  pagamento_pendente:
    "Existe uma fatura aguardando pagamento. Conclua o pagamento para liberar o acesso.",
  assinatura_atrasada:
    "Sua fatura está em atraso. Efetue o pagamento para liberar o acesso.",
  assinatura_vencida:
    "Sua assinatura venceu. Renove o plano para voltar a usar o sistema.",
};

const ACTION_BY_CODE: Record<
  SubscriptionBlockCode,
  SubscriptionBlockAction
> = {
  assinatura_inexistente: "escolher_plano",
  pagamento_pendente: "pagar_fatura",
  assinatura_atrasada: "pagar_fatura",
  assinatura_vencida: "renovar_plano",
};

const PROTECTED_PATHS = [
  "/visao-geral",
  "/desempenho",
  "/gastos",
  "/compras-parceladas",
  "/gastos-recorrentes",
  "/planejamento",
  "/metas",
  "/patrimonio",
  "/relatorios",
  "/notificacoes",
  "/perfil",
  "/configuracoes",
];

let currentBlock: SubscriptionBlock | null = null;
const listeners = new Set<Listener>();

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function optionalNullableString(value: unknown) {
  return value === null || typeof value === "string" ? value : undefined;
}

function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function parseCode(value: unknown): SubscriptionBlockCode | null {
  return value === "assinatura_inexistente" ||
    value === "pagamento_pendente" ||
    value === "assinatura_atrasada" ||
    value === "assinatura_vencida"
    ? value
    : null;
}

function parseSubscriptionDetails(value: unknown): BlockedSubscriptionDetails {
  const details = asRecord(value);
  if (!details) return {};

  return {
    assinatura_id: optionalNumber(details.assinatura_id),
    plano_id: optionalNumber(details.plano_id),
    plano_nome: optionalString(details.plano_nome),
    status: optionalString(details.status),
    valor: optionalNumber(details.valor),
    data_vencimento: optionalNullableString(details.data_vencimento),
    dias_em_atraso: optionalNumber(details.dias_em_atraso),
    invoice_url: optionalNullableString(details.invoice_url),
  };
}

export function parseSubscriptionBlock(
  payload: unknown,
  headerCode?: string | null,
): SubscriptionBlock {
  const body = asRecord(payload);
  const rawDetail = body?.detail;
  const detail = asRecord(rawDetail);
  const codigo =
    parseCode(body?.codigo) ??
    parseCode(body?.motivo) ??
    parseCode(detail?.codigo) ??
    parseCode(detail?.motivo) ??
    parseCode(headerCode) ??
    "pagamento_pendente";
  const apiMessage =
    body?.mensagem ??
    detail?.mensagem ??
    (typeof rawDetail === "string" ? rawDetail : undefined) ??
    (typeof payload === "string" ? payload : undefined);
  const mensagem =
    typeof apiMessage === "string" && apiMessage.trim()
      ? apiMessage
      : FALLBACK_MESSAGES[codigo];

  return {
    mensagem,
    codigo,
    acao: ACTION_BY_CODE[codigo],
    assinatura: parseSubscriptionDetails(
      body?.assinatura ?? detail?.assinatura,
    ),
  };
}

export function publishSubscriptionBlock(block: SubscriptionBlock) {
  currentBlock = block;
  listeners.forEach((listener) => listener());
}

export function clearSubscriptionBlock() {
  if (!currentBlock) return;
  currentBlock = null;
  listeners.forEach((listener) => listener());
}

export function updateSubscriptionBlockMessage(mensagem: string) {
  if (!currentBlock || !mensagem.trim()) return;
  currentBlock = { ...currentBlock, mensagem };
  listeners.forEach((listener) => listener());
}

export function getSubscriptionBlockSnapshot() {
  return currentBlock;
}

export function subscribeSubscriptionBlock(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSubscriptionBlockDestination(block: SubscriptionBlock) {
  return block.acao === "escolher_plano" ? "/checkout" : "/faturas";
}

export function isSubscriptionProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
