
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bitcoin,
  Landmark,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { ColumnChart } from "@/components/charts/column-chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { investmentsService } from "@/services/investments-service";
import type {
  AtivoFinanceiro,
  MovimentacaoPatrimonio,
  TipoAtivoFinanceiro,
  TipoMovimentacaoPatrimonio,
} from "@/types/api";

const labels: Record<TipoAtivoFinanceiro, string> = {
  poupanca: "Poupança",
  reserva_emergencia: "Reserva de emergência",
  conta_corrente: "Conta corrente",
  cdb: "CDB",
  tesouro_direto: "Tesouro Direto",
  bitcoin: "Bitcoin",
  criptomoeda: "Outra criptomoeda",
  acao: "Ações",
  fii: "Fundos imobiliários",
  fundo_investimento: "Fundo de investimento",
  previdencia: "Previdência",
  outro: "Outro",
};

const movementLabels: Record<TipoMovimentacaoPatrimonio, string> = {
  aporte: "Aporte",
  retirada: "Retirada",
  rendimento: "Rendimento",
  ajuste: "Ajuste de saldo",
};

const reserveTypes = new Set<TipoAtivoFinanceiro>([
  "poupanca",
  "reserva_emergencia",
  "conta_corrente",
]);

const initialForm = {
  nome: "",
  tipo: "reserva_emergencia" as TipoAtivoFinanceiro,
  instituicao: "",
  valor_atual: "",
  valor_investido: "",
  observacao: "",
};

export default function PatrimonioPage() {
  const [assets, setAssets] = useState<AtivoFinanceiro[]>([]);
  const [movements, setMovements] = useState<MovimentacaoPatrimonio[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [movementAsset, setMovementAsset] = useState<number | null>(null);
  const [movementType, setMovementType] =
    useState<TipoMovimentacaoPatrimonio>("aporte");
  const [movementValue, setMovementValue] = useState("");
  const [movementDescription, setMovementDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [assetsResponse, movementsResponse] = await Promise.all([
        investmentsService.listarAtivos(),
        investmentsService.listarMovimentacoes(),
      ]);
      setAssets(assetsResponse);
      setMovements(movementsResponse);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar o patrimônio.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const totals = useMemo(() => {
    const total = assets.reduce((sum, item) => sum + Number(item.valor_atual), 0);
    const invested = assets.reduce(
      (sum, item) => sum + Number(item.valor_investido),
      0,
    );
    const reserves = assets
      .filter((item) => reserveTypes.has(item.tipo))
      .reduce((sum, item) => sum + Number(item.valor_atual), 0);
    const investments = total - reserves;
    return { total, invested, reserves, investments, result: total - invested };
  }, [assets]);

  const chartData = assets.map((item) => ({
    nome: item.nome,
    valor: Number(item.valor_atual),
  }));

  async function saveAsset(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const current = Number(form.valor_atual || 0);
      await investmentsService.criarAtivo({
        nome: form.nome.trim(),
        tipo: form.tipo,
        instituicao: form.instituicao.trim() || null,
        valor_atual: current,
        valor_investido: Number(form.valor_investido || current),
        moeda: "BRL",
        observacao: form.observacao.trim() || null,
      });
      setForm(initialForm);
      setShowForm(false);
      await reload();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível cadastrar o investimento.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveMovement(event: React.FormEvent) {
    event.preventDefault();
    if (!movementAsset || Number(movementValue) <= 0) return;
    setSaving(true);
    setError("");
    try {
      await investmentsService.criarMovimentacao({
        ativo_financeiro_id: movementAsset,
        tipo: movementType,
        valor: Number(movementValue),
        data_movimentacao: new Date().toISOString().slice(0, 10),
        descricao:
          movementDescription.trim() || `${movementLabels[movementType]} registrado`,
      });
      setMovementAsset(null);
      setMovementValue("");
      setMovementDescription("");
      await reload();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível registrar a movimentação.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAsset(id: number) {
    if (!window.confirm("Deseja desativar este fundo ou investimento?")) return;
    setSaving(true);
    setError("");
    try {
      await investmentsService.excluirAtivo(id);
      await reload();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível desativar o investimento.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-500">
            Reservas e investimentos
          </p>
          <h1 className="text-3xl font-black">Patrimônio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe onde o dinheiro está guardado e como ele está evoluindo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void reload()} disabled={loading}>
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Atualizar
          </Button>
          <Button onClick={() => setShowForm((value) => !value)}>
            <Plus size={17} /> Novo fundo ou investimento
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <form onSubmit={saveAsset} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="grid gap-1 text-sm">
              Nome
              <Input
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex.: Reserva Nubank"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Tipo
              <select
                className="theme-select h-10 rounded-md border border-slate-300 bg-white px-3 text-slate-900 outline-none dark:border-[#315f88] dark:bg-[#071a31] dark:text-[#f4f8ff]"
                value={form.tipo}
                onChange={(e) =>
                  setForm({ ...form, tipo: e.target.value as TipoAtivoFinanceiro })
                }
              >
                {Object.entries(labels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Instituição
              <Input
                value={form.instituicao}
                onChange={(e) => setForm({ ...form, instituicao: e.target.value })}
                placeholder="Banco, corretora ou carteira"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Valor atual
              <Input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.valor_atual}
                onChange={(e) => setForm({ ...form, valor_atual: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sm">
              Valor investido
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.valor_investido}
                onChange={(e) =>
                  setForm({ ...form, valor_investido: e.target.value })
                }
                placeholder="Se vazio, usa o valor atual"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Objetivo ou observação
              <Input
                value={form.observacao}
                onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                placeholder="Ex.: Reserva de emergência"
              />
            </label>
            <div className="flex gap-2 md:col-span-2 xl:col-span-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar patrimônio"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary title="Patrimônio total" value={totals.total} icon={WalletCards} />
        <Summary title="Reservas disponíveis" value={totals.reserves} icon={Landmark} />
        <Summary title="Investimentos" value={totals.investments} icon={Bitcoin} />
        <Summary
          title="Resultado acumulado"
          value={totals.result}
          icon={TrendingUp}
          positive={totals.result >= 0}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <Card>
          <h2 className="text-lg font-bold">Distribuição do patrimônio</h2>
          <p className="text-sm text-slate-500">
            Valores atuais por fundo, conta ou investimento.
          </p>
          {chartData.length ? (
            <ColumnChart
              data={chartData}
              xKey="nome"
              series={[{ key: "valor", label: "Valor atual" }]}
              height={330}
            />
          ) : (
            <Empty loading={loading} />
          )}
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Visão por finalidade</h2>
          <div className="mt-5 space-y-4">
            <Line label="Reserva e liquidez" value={totals.reserves} total={totals.total} />
            <Line label="Investimentos" value={totals.investments} total={totals.total} />
            <Line label="Capital aportado" value={totals.invested} total={totals.total} />
          </div>
          <p className="mt-5 text-xs text-slate-500">
            Metas mostram <strong>para que</strong> você está juntando. Patrimônio
            mostra <strong>onde</strong> o dinheiro está guardado.
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-bold">Fundos e investimentos</h2>
        <p className="text-sm text-slate-500">
          Registre aportes, retiradas, rendimentos ou ajustes.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {assets.map((asset) => {
            const current = Number(asset.valor_atual);
            const invested = Number(asset.valor_investido);
            return (
              <div key={asset.id} className="rounded-2xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{asset.nome}</p>
                    <p className="text-xs text-slate-500">
                      {labels[asset.tipo]}
                      {asset.instituicao ? ` • ${asset.instituicao}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-[#9fb4ca] hover:text-red-500"
                    onClick={() => void deleteAsset(asset.id)}
                    aria-label="Desativar investimento"
                    disabled={saving}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <strong className="mt-4 block text-2xl">{formatCurrency(current)}</strong>
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>Investido: {formatCurrency(invested)}</span>
                  <span className={current - invested >= 0 ? "text-emerald-500" : "text-red-500"}>
                    {formatCurrency(current - invested)}
                  </span>
                </div>
                {asset.observacao && (
                  <p className="mt-3 rounded-xl bg-slate-100 p-2 text-xs dark:bg-[#12375f]">
                    {asset.observacao}
                  </p>
                )}
                <Button
                  className="mt-4 w-full"
                  variant="secondary"
                  onClick={() => setMovementAsset(asset.id)}
                >
                  Nova movimentação
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Movimentações recentes</h2>
        <div className="mt-4 space-y-3">
          {movements.slice(0, 10).map((movement) => {
            const asset = assets.find((item) => item.id === movement.ativo_financeiro_id);
            return (
              <div key={movement.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm">
                <div>
                  <p className="font-semibold">{asset?.nome ?? "Ativo financeiro"}</p>
                  <p className="text-xs text-slate-500">
                    {movementLabels[movement.tipo]} • {new Date(`${movement.data_movimentacao}T00:00:00`).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <strong>{formatCurrency(Number(movement.valor))}</strong>
              </div>
            );
          })}
          {!loading && movements.length === 0 && (
            <p className="text-sm text-slate-500">Nenhuma movimentação registrada.</p>
          )}
        </div>
      </Card>

      {movementAsset !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-lg font-bold">Nova movimentação</h2>
            <form onSubmit={saveMovement} className="mt-5 space-y-4">
              <label className="grid gap-1 text-sm">
                Tipo
                <select
                  className="theme-select h-10 rounded-md border border-slate-300 bg-white px-3 text-slate-900 outline-none dark:border-[#315f88] dark:bg-[#071a31] dark:text-[#f4f8ff]"
                  value={movementType}
                  onChange={(e) =>
                    setMovementType(e.target.value as TipoMovimentacaoPatrimonio)
                  }
                >
                  {Object.entries(movementLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                Valor
                <Input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={movementValue}
                  onChange={(e) => setMovementValue(e.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm">
                Descrição
                <Input
                  value={movementDescription}
                  onChange={(e) => setMovementDescription(e.target.value)}
                  placeholder="Opcional"
                />
              </label>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : "Confirmar"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setMovementAsset(null)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

function Summary({
  title,
  value,
  icon: Icon,
  positive = true,
}: {
  title: string;
  value: number;
  icon: typeof WalletCards;
  positive?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{title}</span>
        <Icon className="text-blue-400" />
      </div>
      <strong className={`mt-3 block text-2xl ${positive ? "" : "text-red-500"}`}>
        {formatCurrency(value)}
      </strong>
    </Card>
  );
}

function Line({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <strong>{formatCurrency(value)}</strong>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-[#12375f]">
        <div className="h-2 rounded-full bg-blue-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Empty({ loading }: { loading: boolean }) {
  return (
    <div className="grid min-h-48 place-items-center text-center text-sm text-slate-500">
      <div>
        <Landmark className="mx-auto mb-3 text-blue-400" />
        <p>{loading ? "Carregando patrimônio..." : "Nenhum fundo ou investimento cadastrado."}</p>
        {!loading && (
          <p className="text-xs">
            Cadastre poupança, reserva, CDB, Tesouro Direto, Bitcoin ou outros ativos.
          </p>
        )}
      </div>
    </div>
  );
}
