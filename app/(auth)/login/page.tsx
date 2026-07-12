import Link from "@/components/router-link";
import { useRouter } from "@/lib/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthCard } from "@/components/forms/auth-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { authService } from "@/services/auth-service";
import { useAuth } from "@/components/auth/auth-provider";
import { getPendingCheckout } from "@/services/checkout-progress";

export default function LoginPage() {
  const router = useRouter();
  const { recarregar } = useAuth();
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      await authService.login({ telefone, senha });
      await recarregar();
      const pending = getPendingCheckout();
      router.replace(pending?.accountCreated ? "/visao-geral?cadastro=pendente" : "/visao-geral");
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível conectar à API.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthCard title="Entrar" subtitle="Acesse usando seu telefone e senha." footer={<>Ainda não possui senha? <Link className="font-semibold text-blue-600" href="/cadastro">Criar acesso</Link></>}>
      <form className="grid gap-4" onSubmit={entrar}>
        <label className="grid gap-1 text-sm">Telefone<Input value={telefone} onChange={e=>setTelefone(e.target.value)} placeholder="(27) 99999-9999" inputMode="tel" required/></label>
        <label className="grid gap-1 text-sm">
          Senha
          <div className="relative">
            <Input value={senha} onChange={e=>setSenha(e.target.value)} type={mostrarSenha ? "text" : "password"} placeholder="Sua senha" minLength={8} required className="pr-12"/>
            <button type="button" onClick={()=>setMostrarSenha(v=>!v)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-500 hover:text-blue-600" aria-label={mostrarSenha ? "Ocultar senha" : "Revelar senha"}>
              {mostrarSenha ? <EyeOff size={19}/> : <Eye size={19}/>}
            </button>
          </div>
        </label>
        {erro && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-300">{erro}</p>}
        <div className="text-right"><Link className="text-sm text-blue-600" href="/esqueci-minha-senha">Esqueci minha senha</Link></div>
        <Button type="submit" size="lg" disabled={carregando}>{carregando ? "Entrando..." : "Entrar"}</Button>
      </form>
    </AuthCard>
  );
}
