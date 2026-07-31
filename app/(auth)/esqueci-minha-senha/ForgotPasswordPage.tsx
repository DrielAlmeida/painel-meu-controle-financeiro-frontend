"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CodeValidationStep } from "./CodeValidationStep";
import { NewPasswordStep } from "./NewPasswordStep";

import {
solicitarCodigo,
validarCodigo,
alterarSenha,
} from "@/services/password-reset-service";

type Etapa = 1 | 2 | 3 | 4;

export function ForgotPasswordPage() {
const router = useRouter();

const [etapa, setEtapa] = useState<Etapa>(1);
const [telefone, setTelefone] = useState("");
const [codigo, setCodigo] = useState("");
const [loading, setLoading] = useState(false);
const [erro, setErro] = useState("");
const [sucesso, setSucesso] = useState("");
const [novaSenha, setNovaSenha] = useState("");
const [confirmarSenha, setConfirmarSenha] = useState("");
const [segundosParaReenvio, setSegundosParaReenvio] = useState(0);

useEffect(() => {
  if (segundosParaReenvio <= 0) return;
  const timer = window.setTimeout(
    () => setSegundosParaReenvio((atual) => Math.max(0, atual - 1)),
    1000,
  );
  return () => window.clearTimeout(timer);
}, [segundosParaReenvio]);

useEffect(() => {
  if (etapa !== 4) return;
  const timer = window.setTimeout(() => router.push("/login"), 3000);
  return () => window.clearTimeout(timer);
}, [etapa, router]);

function formatarTelefone(valor: string) {
const numeros = valor.replace(/\D/g, "").slice(0, 11);

if (numeros.length <= 2) return numeros;
if (numeros.length <= 7) {
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
}

return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;


}

async function handleEnviarCodigo() {
if (segundosParaReenvio > 0) return;
setErro("");
setSucesso("");
setLoading(true);


try {
  const telefoneLimpo = telefone.replace(/\D/g, "");

  if (telefoneLimpo.length < 10) {
    throw new Error("Informe um telefone válido.");
  }

  await solicitarCodigo({
    telefone: telefoneLimpo,
  });

  setSucesso("Se existir uma conta vinculada a este telefone, um código foi enviado para o WhatsApp.");
  setSegundosParaReenvio(60);
  setEtapa(2);
} catch (error) {
  setErro(error instanceof Error ? error.message : "Erro ao enviar código.");
} finally {
  setLoading(false);
}


}

async function handleValidarCodigo(codigoDigitado: string) {
setErro("");
setLoading(true);

try {
  const telefoneLimpo = telefone.replace(/\D/g, "");

  const resposta = await validarCodigo({
    telefone: telefoneLimpo,
    codigo: codigoDigitado,
  });

  if (!resposta?.valido) {
    throw new Error("Código inválido ou expirado.");
  }

  setCodigo(codigoDigitado);
  setEtapa(3);
} catch (error) {
  setErro(error instanceof Error ? error.message : "Erro ao validar código.");
} finally {
  setLoading(false);
}


}

async function handleAlterarSenha() {
setErro("");
setLoading(true);

try {
  if (novaSenha.length < 6) {
    throw new Error("A senha deve ter pelo menos 6 caracteres.");
  }

  if (novaSenha !== confirmarSenha) {
    throw new Error("As senhas não coincidem.");
  }

  const telefoneLimpo = telefone.replace(/\D/g, "");

  await alterarSenha({
    telefone: telefoneLimpo,
    codigo,
    nova_senha: novaSenha,
  });

  setEtapa(4);
} catch (error) {
  setErro(error instanceof Error ? error.message : "Erro ao alterar senha.");
} finally {
  setLoading(false);
}


}

return ( <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4"> <div className="w-full max-w-md">
<Button
variant="ghost"
className="mb-4"
onClick={() => router.push("/login")}
> <ArrowLeft className="mr-2 h-4 w-4" />
Voltar para o login </Button>


    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <ShieldCheck className="h-7 w-7 text-emerald-600" />
        </div>

        <div>
          <CardTitle className="text-2xl font-bold">
            Recuperar senha
          </CardTitle>

          <CardDescription className="mt-2">
            Receba um código de 6 dígitos no seu WhatsApp para redefinir sua senha.
          </CardDescription>
        </div>

        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 w-16 rounded-full transition-colors ${
                etapa >= step ? "bg-emerald-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {erro && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {sucesso && etapa === 2 && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {sucesso}
          </div>
        )}

        {etapa === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="telefone" className="text-sm font-medium leading-none">
                Telefone cadastrado
              </label>
              <Input
                id="telefone"
                type="tel"
                placeholder="(27) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                disabled={loading}
                className="h-11"
              />
            </div>

            <Button
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleEnviarCodigo}
              disabled={
                loading ||
                segundosParaReenvio > 0 ||
                telefone.replace(/\D/g, "").length < 10
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando código...
                </>
              ) : segundosParaReenvio > 0 ? (
                `Aguarde ${segundosParaReenvio}s para reenviar`
              ) : (
                "Enviar código pelo WhatsApp"
              )}
            </Button>

            <p className="text-xs text-center text-slate-500">
              O código expira em 10 minutos e será enviado para o WhatsApp vinculado à sua conta.
            </p>
          </div>
        )}

        {etapa === 2 && (
          <CodeValidationStep
            telefone={telefone}
            loading={loading}
            resendCooldown={segundosParaReenvio}
            onValidate={handleValidarCodigo}
            onResend={handleEnviarCodigo}
            onBack={() => setEtapa(1)}
          />
        )}

        {etapa === 3 && (
          <NewPasswordStep
            novaSenha={novaSenha}
            confirmarSenha={confirmarSenha}
            loading={loading}
            onNovaSenhaChange={setNovaSenha}
            onConfirmarSenhaChange={setConfirmarSenha}
            onSubmit={handleAlterarSenha}
            onBack={() => setEtapa(2)}
          />
        )}

        {etapa === 4 && (
          <div className="space-y-4 text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Senha alterada!
              </h3>
              <p className="mt-2 text-slate-600">
                Sua senha foi redefinida com sucesso. Você será redirecionado para a tela de login em instantes.
              </p>
            </div>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => router.push("/login")}
            >
              Ir para o login agora
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
</div>


);
}
