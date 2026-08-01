import { useState } from "react";
import { ArrowLeft, Loader2, MessageCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CodeValidationStepProps = {
  telefone: string;
  loading: boolean;
  resendCooldown: number;
  onValidate: (codigo: string) => void | Promise<void>;
  onResend?: () => void | Promise<void>;
  onBack: () => void;
};

export function CodeValidationStep({
  telefone,
  loading,
  resendCooldown,
  onValidate,
  onResend,
  onBack,
}: CodeValidationStepProps) {
  const [codigo, setCodigo] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (codigo.length !== 6) return;
    void onValidate(codigo);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <p className="text-sm text-slate-600">
          Digite o codigo enviado para <span className="font-medium text-slate-900">{telefone || "seu WhatsApp"}</span>.
        </p>
        <Input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="000000"
          value={codigo}
          onChange={(event) => setCodigo(event.target.value.replace(/\D/g, "").slice(0, 6))}
          disabled={loading}
          className="h-11 text-center text-lg tracking-[0.35em]"
        />
      </div>

      <Button
        type="submit"
        className="h-11 w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={loading || codigo.length !== 6}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validando...
          </>
        ) : (
          "Validar codigo"
        )}
      </Button>

      {/* Mensagem de ajuda caso não receba o código */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
        <div className="flex items-start gap-2">
          <MessageCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            <span className="font-medium">Não recebeu o código?</span> Envie uma mensagem simples (ex: <span className="font-semibold">OI</span>) para o nosso número no WhatsApp e depois clique em reenviar o código.
          </p>
        </div>
        {onResend && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full h-9 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
            onClick={() => void onResend()}
            disabled={loading || resendCooldown > 0}
          >
            <RefreshCw className="mr-1.5 h-3 w-3" />
            {resendCooldown > 0
              ? `Reenviar código em ${resendCooldown}s`
              : "Reenviar código"}
          </Button>
        )}
      </div>

      <Button type="button" variant="ghost" className="h-10 w-full" onClick={onBack} disabled={loading}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
    </form>
  );
}
