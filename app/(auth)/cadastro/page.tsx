
import Link from "@/components/router-link";
import { useState } from "react";

import { AuthCard } from "@/components/forms/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { authService } from "@/services/auth-service";

const COUNTRY_CODE = "55";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export default function CadastroPage() {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    senha: "",
    confirmar_senha: "",
    aceitou_termos: false,
    aceitou_privacidade: false,
  });

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const update = (
    field: string,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  async function cadastrar(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    const localPhone = onlyDigits(form.telefone)
      .replace(/^55/, "")
      .slice(0, 11);

    if (localPhone.length !== 11) {
      setErro(
        "Informe o DDD e o número com 11 dígitos.",
      );
      return;
    }

    if (form.senha !== form.confirmar_senha) {
      setErro("As senhas não são iguais.");
      return;
    }

    if (form.senha.length < 8) {
      setErro(
        "A senha precisa ter no mínimo 8 caracteres.",
      );
      return;
    }

    if (
      !/[A-Za-z]/.test(form.senha) ||
      !/\d/.test(form.senha)
    ) {
      setErro(
        "A senha precisa conter pelo menos uma letra e um número.",
      );
      return;
    }

    if (
      !form.aceitou_termos ||
      !form.aceitou_privacidade
    ) {
      setErro(
        "Você precisa aceitar os Termos de Uso e a Política de Privacidade.",
      );
      return;
    }

    setCarregando(true);

    try {
      const response = await authService.cadastro({
        ...form,
        telefone: `${COUNTRY_CODE}${localPhone}`,
        email: form.email || null,
      });

      setSucesso(response.mensagem);

      setForm({
        nome: "",
        telefone: "",
        email: "",
        senha: "",
        confirmar_senha: "",
        aceitou_termos: false,
        aceitou_privacidade: false,
      });
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível conectar à API.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthCard
      title="Criar acesso"
      subtitle="Seu telefone já deve estar autorizado pelo administrador."
      footer={
        <>
          Já possui acesso?{" "}
          <Link
            className="font-semibold text-blue-600"
            href="/login"
          >
            Entrar
          </Link>
        </>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={cadastrar}
      >
        <label className="grid gap-1 text-sm">
          Nome

          <Input
            value={form.nome}
            onChange={(event) =>
              update("nome", event.target.value)
            }
            placeholder="Seu nome"
            required
          />
        </label>

        <label className="grid gap-1 text-sm">
          Telefone

          <div className="flex overflow-hidden rounded-md border border-slate-300 bg-white dark:border-[#315f88] dark:bg-[#071a31]">
            <span className="grid min-w-14 place-items-center border-r border-slate-300 bg-slate-100 px-3 font-semibold text-slate-700 dark:border-[#315f88] dark:bg-[#0d2b4d] dark:text-[#d9e6f4]">
              +55
            </span>

            <Input
              className="border-0 focus-visible:ring-0"
              value={form.telefone}
              onChange={(event) =>
                update(
                  "telefone",
                  onlyDigits(event.target.value)
                    .replace(/^55/, "")
                    .slice(0, 11),
                )
              }
              placeholder="27999999999"
              inputMode="numeric"
              maxLength={11}
              required
            />
          </div>

          <span className="text-xs text-slate-500">
            Digite apenas DDD + número. O código 55 será
            enviado automaticamente.
          </span>
        </label>

        <label className="grid gap-1 text-sm">
          E-mail (opcional)

          <Input
            type="email"
            value={form.email}
            onChange={(event) =>
              update("email", event.target.value)
            }
            placeholder="seuemail@exemplo.com"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Senha

          <Input
            value={form.senha}
            onChange={(event) =>
              update("senha", event.target.value)
            }
            type="password"
            required
          />

          <span className="text-xs text-slate-500">
            Mínimo de 8 caracteres, uma letra e um número.
          </span>
        </label>

        <label className="grid gap-1 text-sm">
          Confirme a senha

          <Input
            value={form.confirmar_senha}
            onChange={(event) =>
              update(
                "confirmar_senha",
                event.target.value,
              )
            }
            type="password"
            required
          />
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input
            checked={form.aceitou_termos}
            onChange={(event) =>
              update(
                "aceitou_termos",
                event.target.checked,
              )
            }
            type="checkbox"
            className="mt-1"
          />

          Aceito os Termos de Uso.
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input
            checked={form.aceitou_privacidade}
            onChange={(event) =>
              update(
                "aceitou_privacidade",
                event.target.checked,
              )
            }
            type="checkbox"
            className="mt-1"
          />

          Aceito a Política de Privacidade.
        </label>

        {erro && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30">
            {erro}
          </p>
        )}

        {sucesso && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 p-4 dark:bg-emerald-950/30">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              {sucesso}
            </p>

            <Link
              href="/login"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Ir para o login
            </Link>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={carregando}
        >
          {carregando
            ? "Cadastrando..."
            : "Criar minha senha"}
        </Button>
      </form>
    </AuthCard>
  );
}