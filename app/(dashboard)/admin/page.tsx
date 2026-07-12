
import Link from "@/components/router-link";
import { useEffect, useState } from "react";
import { ShieldCheck, Users, UserCheck, UserX, Clock3, CreditCard, BadgeDollarSign, Settings2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { adminService } from "@/services/admin-service";
import type { AdminDashboard } from "@/types/api";

export default function AdminPage() {
  const { usuario } = useAuth();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!usuario?.administrador) return;
    adminService.dashboard().then(setData).catch((err) => setError(err instanceof ApiError ? err.message : "Erro ao carregar o painel administrativo."));
  }, [usuario]);

  if (!usuario?.administrador) return <Card><p className="text-sm text-red-500">Acesso permitido apenas para administradores.</p></Card>;

  const cards = [
    ["Total de usuários", data?.total_usuarios ?? 0, Users],
    ["Usuários ativos", data?.usuarios_ativos ?? 0, UserCheck],
    ["Cadastros pendentes", data?.usuarios_pendentes ?? 0, Clock3],
    ["Usuários bloqueados", data?.usuarios_bloqueados ?? 0, UserX],
    ["Administradores", data?.administradores ?? 0, ShieldCheck],
    ["Pagamentos pendentes", data?.pagamentos_pendentes ?? 0, CreditCard],
    ["Pagamentos atrasados", data?.pagamentos_atrasados ?? 0, BadgeDollarSign],
    ["Vencendo em 5 dias", data?.assinaturas_vencendo_5_dias ?? 0, Settings2],
  ] as const;

  return <div className="space-y-6">
    <div>
      <p className="text-sm font-semibold text-blue-500">Administração</p>
      <h1 className="text-3xl font-black">Painel administrativo</h1>
      <p className="mt-1 text-sm text-slate-500">Gerencie usuários, planos e assinaturas.</p>
    </div>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label,value,Icon]) => <Card key={label}><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div><div className="rounded-2xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300"><Icon size={22}/></div></div></Card>)}
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      <Link href="/admin/usuarios"><Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lg"><h2 className="font-bold">Usuários</h2><p className="mt-2 text-sm text-slate-500">Aprovar, bloquear, cadastrar e editar acessos.</p></Card></Link>
      <Link href="/admin/planos"><Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lg"><h2 className="font-bold">Planos</h2><p className="mt-2 text-sm text-slate-500">Criar planos, preços e recursos disponíveis.</p></Card></Link>
      <Link href="/admin/assinaturas"><Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lg"><h2 className="font-bold">Assinaturas</h2><p className="mt-2 text-sm text-slate-500">Vincular usuários aos planos e controlar vencimentos.</p></Card></Link>
    </div>
  </div>;
}
