export type Expense = {
  id: string; descricao: string; categoria: string; valor: number; formaPagamento: string;
  dataGasto: string; parcelaAtual?: number; totalParcelas?: number; compraId?: string; excluido?: boolean;
};
export type RecurringExpense = { id: string; descricao: string; categoria: string; valor: number; frequencia: string; proximaExecucao: string; ativo: boolean; };
export type Goal = { id: string; titulo: string; valorMeta: number; valorAtual: number; dataLimite: string; status: "ativa" | "concluida" | "cancelada"; };
