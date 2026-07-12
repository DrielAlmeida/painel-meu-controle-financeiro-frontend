import { apiRequest } from "@/lib/api";

export interface PlanoPublico {
  id: number;
  codigo?: string | null;
  nome: string;
  descricao: string | null;
  valor_mensal: string;
  valor_anual: string | null;
  duracao_meses?: number | null;
  dias_gratis?: number | null;
  destaque?: boolean;
  ativo: boolean;
  permite_whatsapp: boolean;
  permite_relatorios: boolean;
  permite_investimentos: boolean;
  permite_exportacao: boolean;
}

export const publicPlansService = {
  listar: () => apiRequest<PlanoPublico[]>("/planos/publicos"),
};

export function codigoDoPlano(plano: PlanoPublico) {
  if (plano.codigo) return plano.codigo;
  const nome = plano.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (nome.includes("premium")) return "premium";
  if (nome.includes("basico")) return "basico";
  return `plano-${plano.id}`;
}
