import type { Gasto } from "@/types/api";

export type IncidentClassification = "normal" | "light" | "attention";

export interface ClassifiedExpense {
  gasto: Gasto;
  classification: IncidentClassification;
  reason: string;
}

const ESSENTIAL_CATEGORIES = new Set([
  "alimentacao",
  "alimentação",
  "mercado",
  "supermercado",
  "padaria",
  "transporte",
  "saude",
  "saúde",
  "farmacia",
  "farmácia",
  "moradia",
  "contas",
  "educacao",
  "educação",
]);

const SMALL_ESSENTIAL_WORDS = [
  "pao",
  "pão",
  "cafe",
  "café",
  "agua",
  "água",
  "onibus",
  "ônibus",
  "passagem",
  "remedio",
  "remédio",
  "lanche",
  "leite",
];

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function classifyExpense(gasto: Gasto, monthlyGoal: number): ClassifiedExpense {
  const value = Number(gasto.valor || 0);
  const category = normalize(gasto.categoria);
  const description = normalize(gasto.descricao);
  const dailyReference = monthlyGoal > 0 ? monthlyGoal / 30 : 100;
  const smallPurchaseLimit = Math.max(15, Math.min(50, dailyReference * 0.5));
  const relevantPurchaseLimit = Math.max(80, monthlyGoal * 0.03);

  if (gasto.planejado) {
    return { gasto, classification: "normal", reason: "Compra marcada como planejada" };
  }

  if (gasto.origem === "recorrente" || gasto.gasto_recorrente_id) {
    return { gasto, classification: "normal", reason: "Conta recorrente prevista" };
  }

  const essentialCategory = ESSENTIAL_CATEGORIES.has(category);
  const smallEssentialDescription = SMALL_ESSENTIAL_WORDS.some((word) => description.includes(normalize(word)));

  if ((essentialCategory || smallEssentialDescription) && value <= smallPurchaseLimit) {
    return { gasto, classification: "normal", reason: "Compra cotidiana de baixo valor" };
  }

  if (value >= relevantPurchaseLimit || (!essentialCategory && value > smallPurchaseLimit)) {
    return { gasto, classification: "attention", reason: "Compra não planejada com impacto relevante" };
  }

  return { gasto, classification: "light", reason: "Compra avulsa fora do planejamento" };
}

export function summarizeIncidents(gastos: Gasto[], monthlyGoal: number) {
  const classified = gastos.map((gasto) => classifyExpense(gasto, monthlyGoal));
  const incidents = classified.filter((item) => item.classification !== "normal");
  const normalPurchases = classified.filter((item) => item.classification === "normal");
  const attentionPurchases = incidents.filter((item) => item.classification === "attention");
  const incidentValue = incidents.reduce((sum, item) => sum + Number(item.gasto.valor || 0), 0);
  const latest = [...incidents].sort((a, b) => b.gasto.data_gasto.localeCompare(a.gasto.data_gasto))[0];

  return {
    classified,
    incidents,
    normalPurchases,
    attentionPurchases,
    incidentValue,
    latestIncidentValue: latest ? Number(latest.gasto.valor || 0) : 0,
  };
}
