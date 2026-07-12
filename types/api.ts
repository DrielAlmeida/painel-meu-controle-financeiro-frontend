export interface Usuario {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  foto_perfil_url: string | null;
  administrador: boolean;
}

export interface AuthResponse { usuario: Usuario; mensagem: string }
export interface LoginPayload { telefone: string; senha: string }
export interface CadastroPayload {
  nome: string;
  telefone: string;
  email?: string | null;
  senha: string;
  confirmar_senha: string;
  aceitou_termos: boolean;
  aceitou_privacidade: boolean;
}

export interface DashboardResumo {
  salario_mensal: string;
  outras_rendas: string;
  renda_total: string;
  gastos_mes: string;
  valor_disponivel: string;
  meta_mensal: string;
  percentual_utilizado: number;
  economia_prevista: string;
  total_parcelas_futuras: string;
  recorrentes_proximo_mes: string;
}

export interface DashboardDesempenho {
  nivel: "safe" | "light" | "attention" | "critical";
  percentual_utilizado: number;
  incidentes_mes: number;
  valor_incidentes: string;
  dias_sem_incidentes: number;
  dias_para_fechar_mes: number;
  ultimo_incidente_valor: string | null;
}

export interface PerfilFinanceiro {
  id: number;
  usuario_id: number;
  salario_mensal: string;
  outras_rendas: string;
  meta_gasto_mensal: string;
  dia_recebimento_salario: number | null;
  reserva_emergencia_atual: string;
  meta_reserva_emergencia: string;
  moeda: string;
}

export type PerfilFinanceiroPayload = Omit<PerfilFinanceiro, "id" | "usuario_id">;

export interface Gasto {
  id: number;
  descricao: string;
  categoria: string;
  valor: string;
  forma_pagamento: string | null;
  data_gasto: string;
  mensagem_id: string | null;
  excluido: boolean;
  compra_id: string | null;
  parcela_atual: number | null;
  total_parcelas: number | null;
  valor_total: string | null;
  data_vencimento: string | null;
  origem: string;
  observacao: string | null;
  gasto_recorrente_id?: number | null;
  planejado: boolean;
  criado_em: string;
}

export interface CriarGastoPayload {
  descricao: string;
  categoria: string;
  valor_total: number;
  forma_pagamento?: string | null;
  data_gasto: string;
  quantidade_parcelas: number;
  primeiro_vencimento?: string | null;
  observacao?: string | null;
  planejado: boolean;
}

export interface CriarGastoResponse { mensagem: string; gastos: Gasto[] }

export interface GastoRecorrente {
  id: number;
  usuario_id: number;
  descricao: string;
  categoria: string;
  valor: string;
  forma_pagamento: string | null;
  frequencia: "mensal" | "semanal" | "quinzenal" | "anual" | "personalizada";
  intervalo_personalizado_dias: number | null;
  dia_vencimento: number | null;
  data_inicio: string;
  data_fim: string | null;
  proxima_execucao: string | null;
  gerar_automaticamente: boolean;
  ativo: boolean;
  excluido: boolean;
}

export interface MetaFinanceira {
  id: number;
  usuario_id: number;
  titulo: string;
  descricao: string | null;
  valor_meta: string;
  valor_atual: string;
  data_limite: string | null;
  categoria: string | null;
  status: "ativa" | "concluida" | "cancelada";
}

export interface AlertaFinanceiro {
  id: number;
  usuario_id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  nivel: "informacao" | "atencao" | "perigo" | "sucesso";
  lido: boolean;
  criado_em: string;
  lido_em: string | null;
}


export interface MetaFinanceiraPayload {
  titulo: string;
  descricao?: string | null;
  valor_meta: number;
  valor_atual: number;
  data_limite?: string | null;
  categoria?: string | null;
}

export interface GastoRecorrentePayload {
  descricao: string;
  categoria: string;
  valor: number;
  forma_pagamento?: string | null;
  frequencia: GastoRecorrente["frequencia"];
  intervalo_personalizado_dias?: number | null;
  dia_vencimento?: number | null;
  data_inicio: string;
  data_fim?: string | null;
  proxima_execucao?: string | null;
  gerar_automaticamente: boolean;
}

export type TipoAtivoFinanceiro =
  | "poupanca"
  | "reserva_emergencia"
  | "conta_corrente"
  | "cdb"
  | "tesouro_direto"
  | "bitcoin"
  | "criptomoeda"
  | "acao"
  | "fii"
  | "fundo_investimento"
  | "previdencia"
  | "outro";

export interface AtivoFinanceiro {
  id: number;
  usuario_id: number;
  nome: string;
  tipo: TipoAtivoFinanceiro;
  instituicao: string | null;
  valor_investido: string;
  valor_atual: string;
  moeda: string;
  observacao: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface CriarAtivoFinanceiroPayload {
  nome: string;
  tipo: TipoAtivoFinanceiro;
  instituicao?: string | null;
  valor_investido: number;
  valor_atual: number;
  moeda?: string;
  observacao?: string | null;
}

export type TipoMovimentacaoPatrimonio =
  | "aporte"
  | "retirada"
  | "rendimento"
  | "ajuste";

export interface MovimentacaoPatrimonio {
  id: number;
  usuario_id: number;
  ativo_financeiro_id: number;
  tipo: TipoMovimentacaoPatrimonio;
  valor: string;
  data_movimentacao: string;
  descricao: string | null;
  criado_em: string;
}

export interface CriarMovimentacaoPatrimonioPayload {
  ativo_financeiro_id: number;
  tipo: TipoMovimentacaoPatrimonio;
  valor: number;
  data_movimentacao: string;
  descricao?: string | null;
}

export interface AdminDashboard {
  total_usuarios: number;
  usuarios_ativos: number;
  usuarios_pendentes: number;
  usuarios_bloqueados: number;
  usuarios_recusados: number;
  administradores: number;
  pagamentos_pendentes: number;
  pagamentos_atrasados: number;
  assinaturas_vencendo_5_dias: number;
}

export interface AdminUsuario {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  administrador: boolean;
  ativo: boolean;
  status: string | null;
  etapa_cadastro: string | null;
  status_pagamento: string | null;
  assinatura_valida_ate: string | null;
  bloqueado_em: string | null;
  senha_definida_em: string | null;
  ultimo_login_em: string | null;
  tentativas_login: number;
  bloqueado_login_ate: string | null;
  foto_perfil_url: string | null;
}

export interface AdminUsuarioCreate {
  nome: string;
  telefone: string;
  email?: string | null;
  senha: string;
  administrador: boolean;
  ativo: boolean;
  status: "pendente" | "ativo" | "bloqueado" | "recusado";
  status_pagamento: "pendente" | "pago" | "atrasado" | "isento";
  assinatura_valida_ate?: string | null;
}

export interface Plano {
  id: number;
  nome: string;
  descricao: string | null;
  valor_mensal: string;
  valor_anual: string | null;
  codigo?: string | null;
  duracao_meses?: number | null;
  dias_gratis?: number | null;
  destaque?: boolean;
  limite_gastos_mes: number | null;
  permite_whatsapp: boolean;
  permite_relatorios: boolean;
  permite_investimentos: boolean;
  permite_exportacao: boolean;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface PlanoPayload {
  nome: string;
  descricao?: string | null;
  valor_mensal: number;
  valor_anual?: number | null;
  codigo?: string | null;
  duracao_meses?: number | null;
  dias_gratis?: number | null;
  destaque?: boolean;
  limite_gastos_mes?: number | null;
  permite_whatsapp: boolean;
  permite_relatorios: boolean;
  permite_investimentos: boolean;
  permite_exportacao: boolean;
  ativo: boolean;
}

export interface Assinatura {
  id: number;
  usuario_id: number;
  plano_id: number;
  valor_contratado: string;
  data_inicio: string;
  data_vencimento: string | null;
  status: "ativa" | "pendente" | "atrasada" | "cancelada" | "expirada";
  renovacao_automatica: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface AssinaturaPayload {
  usuario_id: number;
  plano_id: number;
  valor_contratado?: number | null;
  data_inicio: string;
  data_vencimento?: string | null;
  status: Assinatura["status"];
  renovacao_automatica: boolean;
}
