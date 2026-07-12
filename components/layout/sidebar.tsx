import Link from "@/components/router-link";
import { usePathname } from "@/lib/navigation";
import { Activity, BarChart3, Bell, CalendarClock, CreditCard, Goal, Landmark, LayoutDashboard, PiggyBank, Receipt, Settings, ShieldCheck, UserRound, Users, WalletCards, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

const userItems=[
  ["/visao-geral","Visão geral",LayoutDashboard],
  ["/desempenho","Desempenho",Activity],
  ["/gastos","Gastos",Receipt],
  ["/compras-parceladas","Compras parceladas",CreditCard],
  ["/gastos-recorrentes","Gastos recorrentes",CalendarClock],
  ["/planejamento","Planejamento",PiggyBank],
  ["/metas","Metas",Goal],
  ["/patrimonio","Reservas e investimentos",Landmark],
  ["/relatorios","Relatórios",BarChart3],
  ["/faturas","Minha assinatura",WalletCards],
  ["/notificacoes","Notificações",Bell],
  ["/perfil","Meu perfil",UserRound],
  ["/configuracoes","Configurações",Settings],
] as const;

const adminItems=[
  ["/admin","Painel administrativo",ShieldCheck],
  ["/admin/usuarios","Administrar usuários",Users],
  ["/admin/planos","Administrar planos",CreditCard],
  ["/admin/assinaturas","Administrar assinaturas",CalendarClock],
] as const;

export function Sidebar({open,onClose}:{open:boolean;onClose:()=>void}){
  const pathname=usePathname();
  const {usuario}=useAuth();
  const items=usuario?.administrador?[...adminItems,...userItems]:userItems;

  return <>
    <div className={cn("fixed inset-0 z-40 bg-black/40 lg:hidden",open?"block":"hidden")} onClick={onClose}/>
    <aside className={cn("sidebar-panel fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r p-4 transition-transform lg:translate-x-0",open?"translate-x-0":"-translate-x-full")}>
      <div className="mb-5 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white"><WalletCards/></div>
          <div><p className="font-bold text-white">Meu Controle</p><p className="text-xs text-slate-300">{usuario?.administrador?"Administrador":"Financeiro"}</p></div>
        </div>
        <button className="text-white lg:hidden" onClick={onClose}><X/></button>
      </div>
      <nav className="space-y-1 overflow-y-auto pr-1">
        {items.map(([href,label,Icon])=>{
          const active=href==="/admin"?pathname===href:pathname===href||pathname.startsWith(`${href}/`);
          return <Link key={href} href={href} onClick={onClose} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",active?"bg-blue-600 text-white shadow-sm":"text-slate-200 hover:bg-white/10 hover:text-white")}><Icon size={18}/>{label}</Link>
        })}
      </nav>
    </aside>
  </>
}
