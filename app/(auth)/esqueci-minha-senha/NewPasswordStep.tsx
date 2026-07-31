import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NewPasswordStepProps = {
  novaSenha: string;
  confirmarSenha: string;
  loading: boolean;
  onNovaSenhaChange: (value: string) => void;
  onConfirmarSenhaChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onBack: () => void;
};

export function NewPasswordStep({
  novaSenha,
  confirmarSenha,
  loading,
  onNovaSenhaChange,
  onConfirmarSenhaChange,
  onSubmit,
  onBack,
}: NewPasswordStepProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSubmit();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="nova-senha" className="text-sm font-medium leading-none">
          Nova senha
        </label>
        <Input
          id="nova-senha"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          placeholder="Digite sua nova senha"
          value={novaSenha}
          onChange={(event) => onNovaSenhaChange(event.target.value)}
          disabled={loading}
          className="h-11"
        />
        <p className="text-xs text-slate-500">
          Use no mínimo 6 caracteres.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmar-senha" className="text-sm font-medium leading-none">
          Confirmar nova senha
        </label>
        <Input
          id="confirmar-senha"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          placeholder="Confirme sua nova senha"
          value={confirmarSenha}
          onChange={(event) => onConfirmarSenhaChange(event.target.value)}
          disabled={loading}
          className="h-11"
        />
      </div>

      <Button
        type="submit"
        className="h-11 w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={
          loading ||
          novaSenha.length < 6 ||
          confirmarSenha.length < 6
        }
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Alterando senha...
          </>
        ) : (
          "Alterar senha"
        )}
      </Button>

      <Button type="button" variant="ghost" className="h-10 w-full" onClick={onBack} disabled={loading}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
    </form>
  );
}
