import type { Expense, Goal, RecurringExpense } from "@/types";
export const demoExpenses: Expense[] = [
  { id: "1", descricao: "Supermercado", categoria: "Alimentação", valor: 386.42, formaPagamento: "Cartão de crédito", dataGasto: "2026-07-03" },
  { id: "2", descricao: "Combustível", categoria: "Transporte", valor: 180, formaPagamento: "Pix", dataGasto: "2026-07-05" },
  { id: "3", descricao: "Notebook", categoria: "Tecnologia", valor: 420, formaPagamento: "Cartão de crédito", dataGasto: "2026-07-07", parcelaAtual: 2, totalParcelas: 10, compraId: "compra-001" },
  { id: "4", descricao: "Internet", categoria: "Casa", valor: 109.9, formaPagamento: "Débito automático", dataGasto: "2026-07-08" },
  { id: "5", descricao: "Farmácia", categoria: "Saúde", valor: 86.75, formaPagamento: "Pix", dataGasto: "2026-07-09" }
];
export const demoRecurring: RecurringExpense[] = [
  { id: "r1", descricao: "Internet", categoria: "Casa", valor: 109.9, frequencia: "mensal", proximaExecucao: "2026-08-08", ativo: true },
  { id: "r2", descricao: "Academia", categoria: "Saúde", valor: 89.9, frequencia: "mensal", proximaExecucao: "2026-08-05", ativo: true }
];
export const demoGoals: Goal[] = [
  { id: "m1", titulo: "Reserva de emergência", valorMeta: 12000, valorAtual: 4650, dataLimite: "2027-12-31", status: "ativa" },
  { id: "m2", titulo: "Moto nova", valorMeta: 18000, valorAtual: 3200, dataLimite: "2028-06-30", status: "ativa" }
];
