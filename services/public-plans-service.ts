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
  listar: () =>
    apiRequest<PlanoPublico[]>("/planos/publicos", {
      handleUnauthorized: false,
    }),
};

export function duracaoEmMesesDoPlano(plano: PlanoPublico) {
  const nome = plano.nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const duracoesPorNome: Array<[string, number]> = [
    ["bienal", 24],
    ["anual", 12],
    ["semestral", 6],
    ["quadrimestral", 4],
    ["trimestral", 3],
    ["bimestral", 2],
    ["mensal", 1],
  ];
  const duracaoPeloNome = duracoesPorNome.find(([periodo]) =>
    nome.includes(periodo),
  )?.[1];
  if (duracaoPeloNome) return duracaoPeloNome;

  const duracaoConfigurada = Number(plano.duracao_meses);
  if (Number.isInteger(duracaoConfigurada) && duracaoConfigurada > 0) {
    return duracaoConfigurada;
  }

  return 1;
}

export function periodoDoPlano(plano: PlanoPublico) {
  const meses = duracaoEmMesesDoPlano(plano);
  const periodos: Record<number, string> = {
    1: "por mês",
    2: "por bimestre",
    3: "por trimestre",
    4: "por quadrimestre",
    6: "por semestre",
    12: "por ano",
  };

  return periodos[meses] ?? `por ${meses} meses`;
}

export function codigoDoPlano(plano: PlanoPublico) {
  if (plano.codigo) return plano.codigo;
  const nome = plano.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (nome.includes("premium")) return "premium";
  if (nome.includes("basico")) return "basico";
  return `plano-${plano.id}`;
}
