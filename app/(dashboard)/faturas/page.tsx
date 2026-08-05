import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  Check,
  CreditCard,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "@/components/router-link";
import { SubscriptionBlockBanner } from "@/components/billing/subscription-block-banner";
import { useSubscriptionBlock } from "@/components/billing/subscription-block-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageError, PageLoading } from "@/components/feedback/page-state";
import {
  billingService,
  type MinhaAssinatura,
  type SincronizarPagamentoResponse,
} from "@/services/billing-service";
import { updateSubscriptionBlockMessage } from "@/services/subscription-block";
import { formatCurrency } from "@/lib/utils";
import {
  getSafePaymentUrl,
  requireSafePaymentUrl,
} from "@/lib/payment-url";
import { Input } from "@/components/ui/input";
import {
  duracaoEmMesesDoPlano,
  publicPlansService,
  type PlanoPublico,
} from "@/services/public-plans-service";

function formatDate(value: string | null | undefined) {
  if (!value) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`));
}

export default function FaturasPage() {
  const {
    bloqueioAssinatura,
    limparBloqueioAssinatura,
  } = useSubscriptionBlock();
  const [assinatura, setAssinatura] = useState<
    MinhaAssinatura | null | undefined
  >(undefined);
  const [erro, setErro] = useState("");
  const [sincronizandoPagamento, setSincronizandoPagamento] = useState(false);
  const [resultadoSincronizacao, setResultadoSincronizacao] =
    useState<SincronizarPagamentoResponse | null>(null);
  const carregandoAssinatura = useRef(false);
  const sincronizacaoEmAndamento = useRef(false);
  const sincronizacaoInicialExecutada = useRef(false);
  const aguardandoRetornoPagamento = useRef(false);
  const abaPerdeuFocoAposPagamento = useRef(false);
  const [renovando, setRenovando] = useState(false);
  const [mostrarPlanos, setMostrarPlanos] = useState(false);
  const [carregandoPlanos, setCarregandoPlanos] = useState(false);
  const [planos, setPlanos] = useState<PlanoPublico[]>([]);
  const [planoSelecionado, setPlanoSelecionado] = useState<number | null>(null);
  const [cpfCnpj, setCpfCnpj] = useState("");

  const carregar = useCallback(
    async (silencioso = false, limparSeAtiva = true) => {
      if (carregandoAssinatura.current) return undefined;

      carregandoAssinatura.current = true;
      if (!silencioso) setErro("");

      try {
        const result = await billingService.minhaAssinatura();
        setAssinatura(result);
        if (limparSeAtiva && result?.status === "ativa") {
          limparBloqueioAssinatura();
        }
        return result;
      } catch (error) {
        if (!silencioso) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar sua assinatura.",
          );
        }
        return undefined;
      } finally {
        carregandoAssinatura.current = false;
      }
    },
    [limparBloqueioAssinatura],
  );

  const sincronizarPagamento = useCallback(async () => {
    if (sincronizacaoEmAndamento.current) return;

    sincronizacaoEmAndamento.current = true;
    setSincronizandoPagamento(true);
    setResultadoSincronizacao(null);
    setErro("");

    try {
      const result = await billingService.sincronizarPagamento();
      await carregar(true, result.pago);
      setResultadoSincronizacao(result);

      if (result.pago) {
        limparBloqueioAssinatura();
        setAssinatura((current) =>
          current
            ? { ...current, status: "ativa", invoice_url: null }
            : current,
        );
      } else {
        updateSubscriptionBlockMessage(result.mensagem);
      }
    } catch (error) {
      await carregar(true);
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível verificar o pagamento agora.",
      );
    } finally {
      sincronizacaoEmAndamento.current = false;
      setSincronizandoPagamento(false);
    }
  }, [carregar, limparBloqueioAssinatura]);

  async function carregarPlanos() {
    if (planos.length > 0 || carregandoPlanos) return;

    setCarregandoPlanos(true);
    try {
      const result = await publicPlansService.listar();
      setPlanos(
        result
          .filter((plan) => plan.ativo)
          .sort(
            (a, b) =>
              duracaoEmMesesDoPlano(a) - duracaoEmMesesDoPlano(b),
          ),
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os planos.",
      );
    } finally {
      setCarregandoPlanos(false);
    }
  }

  useEffect(() => {
    if (sincronizacaoInicialExecutada.current) return;
    sincronizacaoInicialExecutada.current = true;
    void sincronizarPagamento();
  }, [sincronizarPagamento]);

  useEffect(() => {
    const registrarSaidaParaPagamento = () => {
      if (aguardandoRetornoPagamento.current) {
        abaPerdeuFocoAposPagamento.current = true;
      }
    };
    const sincronizarAoVoltarDoPagamento = () => {
      if (
        !aguardandoRetornoPagamento.current ||
        !abaPerdeuFocoAposPagamento.current
      ) {
        return;
      }

      aguardandoRetornoPagamento.current = false;
      abaPerdeuFocoAposPagamento.current = false;
      void sincronizarPagamento();
    };

    window.addEventListener("blur", registrarSaidaParaPagamento);
    window.addEventListener("focus", sincronizarAoVoltarDoPagamento);

    return () => {
      window.removeEventListener("blur", registrarSaidaParaPagamento);
      window.removeEventListener("focus", sincronizarAoVoltarDoPagamento);
    };
  }, [sincronizarPagamento]);

  useEffect(() => {
    if (
      bloqueioAssinatura?.codigo === "assinatura_inexistente" ||
      (!bloqueioAssinatura && assinatura === null)
    ) {
      void carregarPlanos();
    }
  }, [bloqueioAssinatura?.codigo, assinatura]);

  async function abrirSelecaoPlanos() {
    setMostrarPlanos(true);
    setErro("");
    await carregarPlanos();
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
      const result = await billingService.renovar(planoSelecionado, {
        cpfCnpj: documento || undefined,
      });
      window.location.assign(requireSafePaymentUrl(result.invoice_url));
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar a renovação.",
      );
    } finally {
      setRenovando(false);
    }
  }

  async function gerarNovaFatura() {
    const planoId =
      bloqueioAssinatura?.assinatura.plano_id ?? assinatura?.plano_id;
    if (!planoId) {
      setErro(
        "Não foi possível identificar o plano. Escolha um plano para continuar.",
      );
      setMostrarPlanos(true);
      await carregarPlanos();
      return;
    }

    setRenovando(true);
    setErro("");
    try {
      const result = await billingService.renovar(planoId, {
        formaPagamento: "PIX",
      });
      window.location.assign(requireSafePaymentUrl(result.invoice_url));
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar uma nova fatura.",
      );
    } finally {
      setRenovando(false);
    }
  }

  function abrirFatura(
    invoiceUrl: string,
    sincronizarAoRetornar = false,
  ) {
    const safeUrl = getSafePaymentUrl(invoiceUrl);
    if (!safeUrl) {
      setErro("O link da fatura não pertence ao ambiente seguro do Asaas.");
      return;
    }

    if (sincronizarAoRetornar) {
      aguardandoRetornoPagamento.current = true;
      abaPerdeuFocoAposPagamento.current = false;
    }
    window.open(safeUrl, "_blank", "noopener,noreferrer");
  }

  if (
    assinatura === undefined &&
    !erro &&
    !bloqueioAssinatura &&
    !resultadoSincronizacao
  ) {
    return <PageLoading />;
  }
  if (
    erro &&
    assinatura === undefined &&
    !bloqueioAssinatura &&
    !resultadoSincronizacao
  ) {
    return (
      <PageError mensagem={erro} tentarNovamente={() => void carregar()} />
    );
  }

  const mostrarCatalogo =
    bloqueioAssinatura?.codigo === "assinatura_inexistente" ||
    (!bloqueioAssinatura && assinatura === null);
  const detalhesBloqueio = bloqueioAssinatura?.assinatura;
  const invoiceUrl = bloqueioAssinatura
    ? detalhesBloqueio?.invoice_url === undefined
      ? (assinatura?.invoice_url ?? null)
      : detalhesBloqueio.invoice_url
    : (assinatura?.invoice_url ?? null);
  const safeInvoiceUrl = getSafePaymentUrl(invoiceUrl);
  const planoIdBloqueado =
    detalhesBloqueio?.plano_id ?? assinatura?.plano_id;
  const planoNome =
    detalhesBloqueio?.plano_nome ??
    assinatura?.plano_nome ??
    "Não informado";
  const status = resultadoSincronizacao?.pago
    ? "ativa"
    : (detalhesBloqueio?.status ?? assinatura?.status ?? "pendente");
  const valor = detalhesBloqueio?.valor ?? assinatura?.valor;
  const dataVencimento =
    detalhesBloqueio?.data_vencimento ?? assinatura?.data_vencimento;
  const urgente =
    assinatura?.dias_restantes != null && assinatura.dias_restantes <= 2;
  const planosPagos = planos.filter((plan) => Number(plan.valor_mensal) > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Minha assinatura e faturas</h1>
          <p className="text-sm text-slate-600 dark:text-[#9fb4ca]">
            Acompanhe vencimento, status e regularize seu acesso.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => void sincronizarPagamento()}
          disabled={sincronizandoPagamento}
        >
          <RefreshCw
            size={16}
            className={sincronizandoPagamento ? "animate-spin" : undefined}
          />
          {sincronizandoPagamento
            ? "Verificando..."
            : "Já paguei, verificar agora"}
        </Button>
      </div>

      <SubscriptionBlockBanner
        mensagem={
          resultadoSincronizacao?.pago === false
            ? resultadoSincronizacao.mensagem
            : undefined
        }
      />

      {resultadoSincronizacao?.pago && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
        >
          {resultadoSincronizacao.mensagem}
        </div>
      )}

      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {erro}
        </div>
      )}

      {mostrarCatalogo ? (
        <Card>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            Planos disponíveis
          </p>
          <h2 className="mt-1 text-xl font-black">Escolha um plano</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-[#9fb4ca]">
            Selecione uma opção para continuar no checkout seguro.
          </p>

          {carregandoPlanos ? (
            <p className="mt-6 text-sm text-slate-500">Carregando planos...</p>
          ) : planos.length === 0 ? (
            <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Nenhum plano está disponível no momento.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {planos.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-2xl border border-slate-200 p-5 dark:border-[#315f88]"
                >
                  <h3 className="font-black">{plan.nome}</h3>
                  <p className="mt-3 text-2xl font-black text-blue-600">
                    {formatCurrency(Number(plan.valor_mensal))}
                  </p>
                  <p className="mt-2 min-h-10 text-xs text-slate-500">
                    {plan.dias_gratis
                      ? `${plan.dias_gratis} dias grátis`
                      : plan.descricao}
                  </p>
                  <Link
                    href={`/checkout?plano_id=${plan.id}`}
                    className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-500"
                  >
                    Escolher plano
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <>
          {urgente && !bloqueioAssinatura && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-100">
              <strong>
                Seu plano vence em {assinatura?.dias_restantes} dia(s).
              </strong>{" "}
              Renove agora para não perder o acesso.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <div className="text-sm text-slate-500">Plano</div>
              <strong className="mt-2 block text-xl">{planoNome}</strong>
            </Card>
            <Card>
              <div className="text-sm text-slate-500">Status</div>
              <strong className="mt-2 block text-xl capitalize">{status}</strong>
            </Card>
            <Card>
              <div className="text-sm text-slate-500">Valor</div>
              <strong className="mt-2 block text-xl">
                {valor == null ? "Não informado" : formatCurrency(valor)}
              </strong>
            </Card>
            <Card>
              <div className="text-sm text-slate-500">Vencimento</div>
              <strong className="mt-2 block text-xl">
                {formatDate(dataVencimento)}
              </strong>
            </Card>
          </div>

          <Card className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarClock className="text-blue-600" />
                <h2 className="font-bold">
                  {bloqueioAssinatura ? "Regularize seu acesso" : "Renovação"}
                </h2>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-[#9fb4ca]">
                {bloqueioAssinatura
                  ? "Conclua o pagamento para liberar o acesso. Se você já pagou, use o botão “Já paguei, verificar agora”."
                  : "Você pode renovar quando faltarem dois dias ou quando a assinatura estiver vencida."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {bloqueioAssinatura ? (
                safeInvoiceUrl ? (
                  <Button
                    onClick={() => abrirFatura(safeInvoiceUrl, true)}
                    disabled={sincronizandoPagamento}
                  >
                    <ExternalLink size={16} /> Pagar agora
                  </Button>
                ) : planoIdBloqueado ? (
                  <Button
                    onClick={() => void gerarNovaFatura()}
                    disabled={renovando}
                  >
                    <RefreshCw size={16} />
                    {renovando ? "Gerando fatura..." : "Gerar nova fatura"}
                  </Button>
                ) : (
                  <Link
                    href="/checkout"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-500"
                  >
                    Escolher plano
                  </Link>
                )
              ) : (
                <>
                  {safeInvoiceUrl && (
                    <Button
                      variant="secondary"
                      onClick={() => abrirFatura(safeInvoiceUrl)}
                    >
                      <ExternalLink size={16} /> Abrir fatura
                    </Button>
                  )}
                  {assinatura && (
                    <Button
                      onClick={() => void abrirSelecaoPlanos()}
                      disabled={
                        renovando ||
                        (!urgente && assinatura.status === "ativa")
                      }
                    >
                      <RefreshCw size={16} />
                      {assinatura.valor === 0
                        ? "Escolher plano pago"
                        : "Renovar plano"}
                    </Button>
                  )}
                </>
              )}
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
              ) : planosPagos.length === 0 ? (
                <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  Nenhum plano pago está disponível para renovação.
                </p>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {planosPagos.map((plan) => {
                    const duracao = duracaoEmMesesDoPlano(plan);
                    const valorPlano = Number(plan.valor_mensal);
                    const equivalenteMensal = valorPlano / duracao;
                    const selecionado = planoSelecionado === plan.id;

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setPlanoSelecionado(plan.id)}
                        className={`relative rounded-2xl border p-5 text-left transition ${
                          selecionado
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 dark:bg-blue-950/30"
                            : "border-slate-200 hover:border-blue-400 dark:border-[#315f88] dark:hover:border-blue-500"
                        }`}
                      >
                        {plan.destaque && (
                          <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Melhor escolha
                          </span>
                        )}
                        <div className="flex h-6 items-center">
                          {selecionado && (
                            <Check size={19} className="text-blue-600" />
                          )}
                        </div>
                        <h3 className="mt-2 font-black">{plan.nome}</h3>
                        <p className="mt-3 text-2xl font-black text-blue-600">
                          {formatCurrency(valorPlano)}
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

              {assinatura?.valor === 0 && planosPagos.length > 0 && (
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

              {planosPagos.length > 0 && assinatura && (
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
