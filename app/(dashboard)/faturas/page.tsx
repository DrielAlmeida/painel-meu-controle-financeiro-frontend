import { useEffect, useState } from "react";
import {
  CalendarClock,
  Check,
  CreditCard,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageError, PageLoading } from "@/components/feedback/page-state";
import {
  billingService,
  type MinhaAssinatura,
} from "@/services/billing-service";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  publicPlansService,
  type PlanoPublico,
} from "@/services/public-plans-service";

function formatDate(value: string | null) {
  if (!value) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`));
}

export default function FaturasPage() {
  const [assinatura, setAssinatura] = useState<
    MinhaAssinatura | null | undefined
  >(undefined);
  const [erro, setErro] = useState("");
  const [renovando, setRenovando] = useState(false);
  const [mostrarPlanos, setMostrarPlanos] = useState(false);
  const [carregandoPlanos, setCarregandoPlanos] = useState(false);
  const [planos, setPlanos] = useState<PlanoPublico[]>([]);
  const [planoSelecionado, setPlanoSelecionado] = useState<number | null>(null);
  const [cpfCnpj, setCpfCnpj] = useState("");

  async function carregar() {
    setErro("");
    try {
      setAssinatura(await billingService.minhaAssinatura());
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar sua assinatura.",
      );
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  async function abrirSelecaoPlanos() {
    setMostrarPlanos(true);
    setErro("");
    if (planos.length > 0) return;

    setCarregandoPlanos(true);
    try {
      const resultado = await publicPlansService.listar();
      const planosPagos = resultado
        .filter((plano) => plano.ativo && Number(plano.valor_mensal) > 0)
        .sort((a, b) => (a.duracao_meses ?? 1) - (b.duracao_meses ?? 1));
      setPlanos(planosPagos);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível carregar os planos.",
      );
    } finally {
      setCarregandoPlanos(false);
    }
  }

  async function confirmarRenovacao() {
    if (!assinatura || !planoSelecionado) return;

    const documento = cpfCnpj.replace(/\D/g, "");
    const precisaDocumento = assinatura.valor === 0;

    if (precisaDocumento && ![11, 14].includes(documento.length)) {
      setErro("Informe um CPF com 11 dígitos ou CNPJ com 14 dígitos.");
      return;
    }

    setRenovando(true);
    setErro("");
    try {
      const result = await billingService.renovar(
        planoSelecionado,
        documento || undefined,
      );
      window.location.assign(result.invoice_url);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível gerar a renovação.",
      );
    } finally {
      setRenovando(false);
    }
  }

  if (assinatura === undefined && !erro) return <PageLoading />;
  if (erro && assinatura === undefined)
    return (
      <PageError mensagem={erro} tentarNovamente={() => void carregar()} />
    );

  const urgente =
    assinatura?.dias_restantes != null && assinatura.dias_restantes <= 2;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Minha assinatura e faturas</h1>
        <p className="text-sm text-slate-600 dark:text-[#9fb4ca]">
          Acompanhe vencimento, status e renove seu acesso.
        </p>
      </div>
      {!assinatura ? (
        <Card>
          <h2 className="font-bold">Nenhuma assinatura encontrada</h2>
          <p className="mt-2 text-sm text-slate-600">
            Escolha um plano na página inicial para começar.
          </p>
        </Card>
      ) : (
        <>
          {urgente && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-100">
              <strong>
                Seu plano vence em {assinatura.dias_restantes} dia(s).
              </strong>{" "}
              Renove agora para não perder o acesso.
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <div className="text-sm text-slate-500">Plano</div>
              <strong className="mt-2 block text-xl">
                {assinatura.plano_nome}
              </strong>
            </Card>
            <Card>
              <div className="text-sm text-slate-500">Status</div>
              <strong className="mt-2 block text-xl capitalize">
                {assinatura.status}
              </strong>
            </Card>
            <Card>
              <div className="text-sm text-slate-500">Valor</div>
              <strong className="mt-2 block text-xl">
                {formatCurrency(assinatura.valor)}
              </strong>
            </Card>
            <Card>
              <div className="text-sm text-slate-500">Vencimento</div>
              <strong className="mt-2 block text-xl">
                {formatDate(assinatura.data_vencimento)}
              </strong>
            </Card>
          </div>
          <Card className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarClock className="text-blue-600" />
                <h2 className="font-bold">Renovação</h2>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-[#9fb4ca]">
                Você pode renovar quando faltarem dois dias ou quando a
                assinatura estiver vencida.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {assinatura.invoice_url && (
                <Button
                  variant="secondary"
                  onClick={() => window.open(assinatura.invoice_url!, "_blank")}
                >
                  <ExternalLink size={16} /> Abrir fatura
                </Button>
              )}
              <Button
                onClick={() => void abrirSelecaoPlanos()}
                disabled={
                  renovando || (!urgente && assinatura.status === "ativa")
                }
              >
                <RefreshCw size={16} />
                {assinatura.valor === 0
                  ? "Escolher plano pago"
                  : "Renovar plano"}
              </Button>
            </div>
          </Card>
          {mostrarPlanos && (
            <Card className="border-blue-300 dark:border-blue-500/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    Renovação
                  </p>
                  <h2 className="text-xl font-black">Escolha seu novo plano</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-[#9fb4ca]">
                    O preço e a duração são carregados diretamente dos planos
                    ativos.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarPlanos(false)}
                  aria-label="Fechar seleção de planos"
                >
                  <X size={18} />
                </Button>
              </div>

              {carregandoPlanos ? (
                <p className="mt-6 text-sm text-slate-500">
                  Carregando planos...
                </p>
              ) : planos.length === 0 ? (
                <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  Nenhum plano pago está disponível para renovação.
                </p>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {planos.map((plano) => {
                    const duracao = plano.duracao_meses ?? 1;
                    const valor = Number(plano.valor_mensal);
                    const equivalenteMensal = valor / duracao;
                    const selecionado = planoSelecionado === plano.id;

                    return (
                      <button
                        key={plano.id}
                        type="button"
                        onClick={() => setPlanoSelecionado(plano.id)}
                        className={`relative rounded-2xl border p-5 text-left transition ${
                          selecionado
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 dark:bg-blue-950/30"
                            : "border-slate-200 hover:border-blue-400 dark:border-[#315f88] dark:hover:border-blue-500"
                        }`}
                      >
                        {plano.destaque && (
                          <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Melhor escolha
                          </span>
                        )}
                        <div className="flex h-6 items-center">
                          {selecionado && (
                            <Check size={19} className="text-blue-600" />
                          )}
                        </div>
                        <h3 className="mt-2 font-black">{plano.nome}</h3>
                        <p className="mt-3 text-2xl font-black text-blue-600">
                          {formatCurrency(valor)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Acesso por{" "}
                          {duracao === 12
                            ? "1 ano"
                            : `${duracao} ${duracao === 1 ? "mês" : "meses"}`}
                        </p>
                        {duracao > 1 && (
                          <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Equivale a {formatCurrency(equivalenteMensal)} por
                            mês
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {assinatura.valor === 0 && planos.length > 0 && (
                <label className="mt-6 block max-w-md text-sm">
                  CPF ou CNPJ para a cobrança
                  <Input
                    className="mt-2"
                    value={cpfCnpj}
                    onChange={(event) =>
                      setCpfCnpj(
                        event.target.value.replace(/\D/g, "").slice(0, 14),
                      )
                    }
                    placeholder="Digite somente os números"
                    inputMode="numeric"
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    Necessário apenas para criar o primeiro cliente no Asaas.
                  </span>
                </label>
              )}

              {planos.length > 0 && (
                <div className="mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#315f88]">
                  <p className="text-sm text-slate-600 dark:text-[#9fb4ca]">
                    {planoSelecionado
                      ? "Plano selecionado. Continue para o ambiente seguro do Asaas."
                      : "Selecione um plano para continuar."}
                  </p>
                  <Button
                    onClick={() => void confirmarRenovacao()}
                    disabled={!planoSelecionado || renovando}
                  >
                    <CreditCard size={17} />
                    {renovando
                      ? "Gerando fatura..."
                      : "Continuar para pagamento"}
                  </Button>
                </div>
              )}
            </Card>
          )}
          <Card>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 text-emerald-600" />
              <div>
                <h2 className="font-bold">Pagamento protegido pelo Asaas</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-[#9fb4ca]">
                  Os dados de pagamento são preenchidos no ambiente seguro do
                  Asaas.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}