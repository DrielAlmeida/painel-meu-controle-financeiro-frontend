import Link from "@/components/router-link";
import { useSearchParams } from "@/lib/navigation";
import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  getSafePaymentUrl,
  requireSafePaymentUrl,
} from "@/lib/payment-url";
import { authService } from "@/services/auth-service";
import { pagamentosService } from "@/services/pagamentos";
import {
  duracaoEmMesesDoPlano,
  periodoDoPlano,
  publicPlansService,
  type PlanoPublico,
} from "@/services/public-plans-service";
import { billingService } from "@/services/billing-service";
import {
  clearPendingCheckout,
  getPendingCheckout,
  markPendingAccountCreated,
  savePendingCheckout,
} from "@/services/checkout-progress";
import { useAuth } from "@/components/auth/auth-provider";
import { SubscriptionBlockBanner } from "@/components/billing/subscription-block-banner";

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function localPhoneDigits(value: string) {
  const normalized = digits(value);
  const withoutCountryCode =
    normalized.length > 11 && normalized.startsWith("55")
      ? normalized.slice(2)
      : normalized;

  return withoutCountryCode.slice(0, 11);
}

const initialForm = {
  nome: "",
  telefone: "",
  email: "",
  cpf_cnpj: "",
  senha: "",
  confirmar_senha: "",
  aceitou_termos: false,
  aceitou_privacidade: false,
};

function CheckoutContent() {
  const params = useSearchParams();
  const requestedId = Number(params.get("plano_id") || 0) || null;
  const {
    usuario,
    carregando: authLoading,
    entrar: autenticar,
    recarregar,
  } = useAuth();
  const [planos, setPlanos] = useState<PlanoPublico[]>([]);
  const [planId, setPlanId] = useState<number | null>(requestedId);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [etapa, setEtapa] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const pending = getPendingCheckout();
    if (pending && !requestedId) setPlanId(pending.planId);

    publicPlansService
      .listar()
      .then((items) => {
        const ativos = items.filter((item) => item.ativo);
        setPlanos(ativos);
        setPlanId((current) => current ?? ativos[0]?.id ?? null);
      })
      .catch(() =>
        setError("Não foi possível carregar os planos disponíveis."),
      );
  }, [requestedId]);

  useEffect(() => {
    if (!usuario) return;

    setForm((current) => ({
      ...current,
      nome: current.nome || usuario.nome,
      telefone: current.telefone || localPhoneDigits(usuario.telefone),
      email: current.email || usuario.email || "",
    }));
  }, [usuario]);

  const selected = useMemo(
    () => planos.find((item) => item.id === planId) ?? null,
    [planos, planId],
  );
  const selectedIsFree = Boolean(
    selected &&
      (Number(selected.valor_mensal) === 0 ||
        Number(selected.dias_gratis || 0) > 0),
  );

  function update(name: string, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function finalizarAssinatura(
    plano: PlanoPublico,
    document: string,
  ) {
    const gratis =
      Number(plano.valor_mensal) === 0 || Number(plano.dias_gratis || 0) > 0;

    setEtapa(
      gratis ? "Ativando seu período grátis..." : "Gerando sua assinatura...",
    );
    const assinatura = await pagamentosService.criarAssinatura({
      plano_id: plano.id,
      forma_pagamento: "UNDEFINED",
      ...(gratis ? {} : { cpf_cnpj: document }),
    });

    if (assinatura.invoice_url) {
      const safeUrl = requireSafePaymentUrl(assinatura.invoice_url);
      clearPendingCheckout();
      setEtapa("Abrindo o ambiente seguro de pagamento...");
      window.location.assign(safeUrl);
      return;
    }

    clearPendingCheckout();
    await recarregar();
    window.location.assign(gratis ? "/visao-geral" : "/faturas");
  }

  async function tratarAssinaturaExistente() {
    try {
      const assinatura = await billingService.minhaAssinatura();
      if (assinatura?.invoice_url) {
        const safeUrl = getSafePaymentUrl(assinatura.invoice_url);
        if (!safeUrl) {
          setError(
            "O link da fatura não pertence ao ambiente seguro do Asaas.",
          );
          return true;
        }
        setEtapa("Abrindo sua fatura pendente...");
        window.location.assign(safeUrl);
        return true;
      }
      if (assinatura?.status === "ativa") {
        clearPendingCheckout();
        window.location.assign("/visao-geral");
        return true;
      }
      if (assinatura) {
        window.location.assign("/faturas");
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  async function processar() {
    setError("");
    if (!selected) {
      setError("Selecione um plano válido.");
      return;
    }

    const localPhone = localPhoneDigits(form.telefone);
    const document = digits(form.cpf_cnpj);

    if (!usuario && localPhone.length !== 11) {
      setError("Informe o DDD e o telefone com 11 dígitos.");
      return;
    }
    if (!selectedIsFree && ![11, 14].includes(document.length)) {
      setError("Informe um CPF ou CNPJ com 11 ou 14 dígitos.");
      return;
    }

    if (!usuario) {
      if (
        form.senha.length < 8 ||
        !/[A-Za-z]/.test(form.senha) ||
        !/\d/.test(form.senha)
      ) {
        setError(
          "A senha precisa ter pelo menos 8 caracteres, uma letra e um número.",
        );
        return;
      }
      if (form.senha !== form.confirmar_senha) {
        setError("As senhas não coincidem.");
        return;
      }
      if (!form.aceitou_termos || !form.aceitou_privacidade) {
        setError(
          "Aceite os Termos de Uso e a Política de Privacidade para continuar.",
        );
        return;
      }
    }

    const telefoneCompleto = `55${localPhone}`;
    savePendingCheckout({
      planId: selected.id,
      accountCreated: Boolean(usuario),
    });

    setLoading(true);
    try {
      if (!usuario) {
        setEtapa("Criando sua conta...");
        try {
          await authService.cadastro({
            nome: form.nome.trim(),
            telefone: telefoneCompleto,
            email: form.email.trim().toLowerCase() || null,
            senha: form.senha,
            confirmar_senha: form.confirmar_senha,
            aceitou_termos: form.aceitou_termos,
            aceitou_privacidade: form.aceitou_privacidade,
          });
          markPendingAccountCreated();
        } catch (err) {
          if (!(err instanceof ApiError) || err.status !== 409) throw err;
        }

        setEtapa("Entrando para iniciar o pagamento...");
        await autenticar({ telefone: telefoneCompleto, senha: form.senha });
        markPendingAccountCreated();
      }

      await finalizarAssinatura(selected, document);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const handled = await tratarAssinaturaExistente();
        if (handled) return;
      }

      if (err instanceof ApiError && err.status === 404) {
        try {
          const updatedPlans = (await publicPlansService.listar()).filter(
            (plan) => plan.ativo,
          );
          setPlanos(updatedPlans);
          setPlanId((current) =>
            updatedPlans.some((plan) => plan.id === current)
              ? current
              : (updatedPlans[0]?.id ?? null),
          );
        } catch {
          // Mantém o erro original da assinatura, sem repetir a mutação.
        }
      }

      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Não foi possível concluir o cadastro.";

      const recoveryHint =
        err instanceof ApiError && err.status === 404
          ? "A lista de planos foi atualizada; selecione uma opção válida."
          : getPendingCheckout()?.accountCreated
            ? "Sua conta e o plano foram preservados. Revise os dados e tente novamente."
            : "Revise os dados informados e tente novamente.";

      setError(`${message} ${recoveryHint}`);
      setEtapa("");
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await processar();
  }

  const authenticatedResume = Boolean(
    usuario && getPendingCheckout()?.accountCreated,
  );

  return (
    <main className="min-h-screen bg-[#071a31] px-5 py-8 text-[#f4f8ff]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#c5d5e7] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <Link
            href={usuario ? "/visao-geral" : "/login"}
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            {usuario ? "Ir para o painel" : "Já tenho conta"}
          </Link>
        </div>
        <SubscriptionBlockBanner className="mt-6" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_.78fr]">
          <section className="rounded-3xl border border-white/10 bg-[#0d2b4d] p-6 sm:p-8">
            <div className="mb-8">
              <span className="text-sm font-bold uppercase tracking-[.18em] text-blue-400">
                {usuario ? "Plano e pagamento" : "Cadastro e pagamento"}
              </span>
              <h1 className="mt-2 text-3xl font-black">
                {usuario
                  ? authenticatedResume
                    ? "Concluir pagamento"
                    : "Escolha seu plano"
                  : "Crie sua conta"}
              </h1>
              <p className="mt-2 text-[#9fb4ca]">
                {authenticatedResume
                  ? "Seu cadastro e plano foram recuperados. Por segurança, informe novamente seu CPF/CNPJ para concluir."
                  : usuario
                    ? "Confirme seus dados e escolha o plano que deseja ativar."
                    : "Sua conta será vinculada ao plano selecionado."}
              </p>
            </div>
            <form onSubmit={submit} className="grid gap-5">
              <label className="grid gap-2 text-sm">
                Nome completo
                <input
                  className="rounded-xl border border-white/10 bg-[#071a31] px-4 py-3 outline-none focus:border-blue-500"
                  value={form.nome}
                  onChange={(e) => update("nome", e.target.value)}
                  required={!usuario}
                  disabled={loading || Boolean(usuario)}
                />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  Telefone
                  <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#071a31]">
                    <span className="grid min-w-14 place-items-center border-r border-white/10 bg-white/5 font-bold">
                      +55
                    </span>
                    <input
                      className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
                      value={form.telefone}
                      onChange={(e) =>
                        update(
                          "telefone",
                          localPhoneDigits(e.target.value),
                        )
                      }
                      placeholder="27999999999"
                      required={!usuario}
                      disabled={loading || Boolean(usuario)}
                    />
                  </div>
                </label>
                <label className="grid gap-2 text-sm">
                  CPF ou CNPJ
                  {selectedIsFree && (
                    <span className="text-xs text-[#9fb4ca]">
                      Não é necessário para o período gratuito.
                    </span>
                  )}
                  <input
                    className="rounded-xl border border-white/10 bg-[#071a31] px-4 py-3 outline-none"
                    value={form.cpf_cnpj}
                    onChange={(e) =>
                      update("cpf_cnpj", digits(e.target.value).slice(0, 14))
                    }
                    inputMode="numeric"
                    required={!selectedIsFree}
                    disabled={loading}
                  />
                </label>
              </div>
              <label className="grid gap-2 text-sm">
                E-mail
                <input
                  type="email"
                  className="rounded-xl border border-white/10 bg-[#071a31] px-4 py-3 outline-none"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required={!usuario}
                  disabled={loading || Boolean(usuario)}
                />
              </label>
              {!authLoading && !usuario && (
                <div className="grid gap-5 sm:grid-cols-2">
                  {[
                    ["senha", "Senha", mostrarSenha, setMostrarSenha],
                    [
                      "confirmar_senha",
                      "Confirmar senha",
                      mostrarConfirmacao,
                      setMostrarConfirmacao,
                    ],
                  ].map(([name, label, show, setShow]) => (
                    <label key={name as string} className="grid gap-2 text-sm">
                      {label as string}
                      <div className="relative">
                        <input
                          type={show ? "text" : "password"}
                          className="w-full rounded-xl border border-white/10 bg-[#071a31] px-4 py-3 pr-12 outline-none"
                          value={form[name as "senha" | "confirmar_senha"]}
                          onChange={(e) =>
                            update(name as string, e.target.value)
                          }
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#9fb4ca]"
                          onClick={() =>
                            (
                              setShow as React.Dispatch<
                                React.SetStateAction<boolean>
                              >
                            )((v) => !v)
                          }
                        >
                          {show ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {!authLoading && !usuario && (
                <div className="grid gap-3 text-sm text-[#c5d5e7]">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.aceitou_termos}
                      onChange={(e) =>
                        update("aceitou_termos", e.target.checked)
                      }
                      className="mt-1"
                      required
                    />
                    <span>
                      Concordo com os{" "}
                      <Link
                        href="/termos-de-uso"
                        target="_blank"
                        className="font-semibold text-blue-300 underline underline-offset-2"
                      >
                        Termos de Uso
                      </Link>
                      .
                    </span>
                  </label>
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.aceitou_privacidade}
                      onChange={(e) =>
                        update("aceitou_privacidade", e.target.checked)
                      }
                      className="mt-1"
                      required
                    />
                    <span>
                      Concordo com a{" "}
                      <Link
                        href="/politica-de-privacidade"
                        target="_blank"
                        className="font-semibold text-blue-300 underline underline-offset-2"
                      >
                        Política de Privacidade
                      </Link>
                      .
                    </span>
                  </label>
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  {error}
                </div>
              )}
              {loading && etapa && (
                <div className="rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
                  {etapa}
                </div>
              )}
              <button
                disabled={loading || authLoading || !selected}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-bold hover:bg-blue-500 disabled:opacity-60"
              >
                <CreditCard className="h-5 w-5" />
                {authLoading
                  ? "Carregando sua conta..."
                  : loading
                    ? "Preparando..."
                    : selectedIsFree
                      ? "Ativar período grátis"
                      : "Continuar para o pagamento"}
              </button>
            </form>
          </section>
          <aside className="space-y-5">
            <div className="rounded-3xl border border-blue-500/40 bg-blue-500/[.08] p-6">
              <h2 className="text-lg font-bold">Escolha seu plano</h2>
              <div className="mt-4 grid gap-3">
                {planos.map((item) => {
                  const active = item.id === planId;
                  const meses = duracaoEmMesesDoPlano(item);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPlanId(item.id)}
                      disabled={loading}
                      className={`rounded-2xl border p-4 text-left ${active ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-[#071a31]/55"}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <strong className="block text-lg">{item.nome}</strong>
                          <span className="text-xs text-[#9fb4ca]">
                            {item.dias_gratis
                              ? `${item.dias_gratis} dias grátis`
                              : item.descricao}
                          </span>
                        </div>
                        <div className="text-right">
                          <strong className="text-2xl">
                            {Number(item.valor_mensal).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </strong>
                          <span className="block text-xs text-[#9fb4ca]">
                            {periodoDoPlano(item)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0d2b4d] p-6">
              <h2 className="font-bold">Resumo</h2>
              <div className="mt-4 flex items-center justify-between border-b border-white/10 pb-4">
                <span>{selected?.nome ?? "Selecione um plano"}</span>
                <strong>
                  {selected
                    ? Number(selected.valor_mensal).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : "—"}
                </strong>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-[#c5d5e7]">
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Plano configurado no painel administrativo
                </li>
                <li className="flex gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Ambiente seguro do Asaas
                </li>
                <li className="flex gap-2">
                  <LockKeyhole className="h-4 w-4 text-emerald-400" />
                  Dados protegidos
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#071a31] text-white">
          Carregando checkout...
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
