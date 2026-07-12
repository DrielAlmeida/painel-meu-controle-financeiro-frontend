
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { adminService } from "@/services/admin-service";
import { plansService } from "@/services/plans-service";
import type { AdminUsuario, Assinatura, AssinaturaPayload, Plano } from "@/types/api";

const today=()=>new Date().toISOString().slice(0,10);
const initial:AssinaturaPayload={usuario_id:0,plano_id:0,valor_contratado:null,data_inicio:today(),data_vencimento:null,status:"ativa",renovacao_automatica:false};

export default function AdminAssinaturasPage(){
  const {usuario}=useAuth();
  const [items,setItems]=useState<Assinatura[]>([]);
  const [users,setUsers]=useState<AdminUsuario[]>([]);
  const [plans,setPlans]=useState<Plano[]>([]);
  const [form,setForm]=useState<AssinaturaPayload>(initial);
  const [showForm,setShowForm]=useState(false);
  const [error,setError]=useState("");

  const load=useCallback(async()=>{setError("");try{const [a,u,p]=await Promise.all([plansService.listarAssinaturas(),adminService.listarUsuarios("limite=500"),plansService.listarPlanos(false)]);setItems(a);setUsers(u);setPlans(p);}catch(e){setError(e instanceof ApiError?e.message:"Erro ao carregar assinaturas.");}},[]);
  useEffect(()=>{if(usuario?.administrador)void load();},[usuario,load]);
  const userMap=useMemo(()=>new Map(users.map(u=>[u.id,u])),[users]);
  const planMap=useMemo(()=>new Map(plans.map(p=>[p.id,p])),[plans]);
  if(!usuario?.administrador)return <Card><p className="text-sm text-red-500">Acesso restrito ao administrador.</p></Card>;

  async function save(e:React.FormEvent){e.preventDefault();setError("");try{await plansService.criarAssinatura(form);setForm(initial);setShowForm(false);await load();}catch(err){setError(err instanceof ApiError?err.message:"Não foi possível criar a assinatura.");}}
  async function changeStatus(item:Assinatura,status:Assinatura["status"]){try{await plansService.atualizarAssinatura(item.id,{status});await load();}catch(err){setError(err instanceof ApiError?err.message:"Não foi possível atualizar a assinatura.");}}

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-blue-500">Administração</p><h1 className="text-3xl font-black">Assinaturas</h1><p className="text-sm text-slate-500">Vincule usuários aos planos e controle vencimentos.</p></div><div className="flex gap-2"><Button variant="secondary" onClick={()=>void load()}><RefreshCw size={17}/>Atualizar</Button><Button onClick={()=>setShowForm(v=>!v)}><Plus size={17}/>Nova assinatura</Button></div></div>
    {error&&<div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
    {showForm&&<Card><form onSubmit={save} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <label className="grid gap-1 text-sm">Usuário<select required className="theme-select h-10 rounded-md border bg-white px-3 dark:bg-[#071a31]" value={form.usuario_id||""} onChange={e=>setForm({...form,usuario_id:Number(e.target.value)})}><option value="">Selecione</option>{users.map(u=><option key={u.id} value={u.id}>{u.nome} — +{u.telefone}</option>)}</select></label>
      <label className="grid gap-1 text-sm">Plano<select required className="theme-select h-10 rounded-md border bg-white px-3 dark:bg-[#071a31]" value={form.plano_id||""} onChange={e=>{const id=Number(e.target.value);const plan=plans.find(p=>p.id===id);setForm({...form,plano_id:id,valor_contratado:plan?Number(plan.valor_mensal):null})}}><option value="">Selecione</option>{plans.map(p=><option key={p.id} value={p.id}>{p.nome} — {formatCurrency(Number(p.valor_mensal))}</option>)}</select></label>
      <label className="grid gap-1 text-sm">Valor contratado<Input type="number" min="0" step="0.01" value={form.valor_contratado??""} onChange={e=>setForm({...form,valor_contratado:e.target.value?Number(e.target.value):null})}/></label>
      <label className="grid gap-1 text-sm">Status<select className="theme-select h-10 rounded-md border bg-white px-3 dark:bg-[#071a31]" value={form.status} onChange={e=>setForm({...form,status:e.target.value as Assinatura["status"]})}><option value="ativa">Ativa</option><option value="pendente">Pendente</option><option value="atrasada">Atrasada</option><option value="cancelada">Cancelada</option><option value="expirada">Expirada</option></select></label>
      <label className="grid gap-1 text-sm">Início<Input type="date" required value={form.data_inicio} onChange={e=>setForm({...form,data_inicio:e.target.value})}/></label>
      <label className="grid gap-1 text-sm">Vencimento<Input type="date" value={form.data_vencimento??""} onChange={e=>setForm({...form,data_vencimento:e.target.value||null})}/></label>
      <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={form.renovacao_automatica} onChange={e=>setForm({...form,renovacao_automatica:e.target.checked})}/>Renovação automática</label>
      <div className="flex items-end justify-end gap-2"><Button type="button" variant="secondary" onClick={()=>setShowForm(false)}>Cancelar</Button><Button type="submit">Criar</Button></div>
    </form></Card>}
    <Card><div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="p-3">Usuário</th><th className="p-3">Plano</th><th className="p-3">Valor</th><th className="p-3">Início</th><th className="p-3">Vencimento</th><th className="p-3">Status</th><th className="p-3">Renovação</th><th className="p-3">Alterar status</th></tr></thead><tbody>{items.map(item=><tr key={item.id} className="border-b last:border-0"><td className="p-3 font-semibold">{userMap.get(item.usuario_id)?.nome??`Usuário #${item.usuario_id}`}</td><td className="p-3">{planMap.get(item.plano_id)?.nome??`Plano #${item.plano_id}`}</td><td className="p-3">{formatCurrency(Number(item.valor_contratado))}</td><td className="p-3">{new Date(item.data_inicio+"T00:00:00").toLocaleDateString("pt-BR")}</td><td className="p-3">{item.data_vencimento?new Date(item.data_vencimento+"T00:00:00").toLocaleDateString("pt-BR"):"-"}</td><td className="p-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-[#12375f]">{item.status}</span></td><td className="p-3">{item.renovacao_automatica?"Automática":"Manual"}</td><td className="p-3"><select className="theme-select h-9 rounded-md border bg-white px-2 dark:bg-[#071a31]" value={item.status} onChange={e=>void changeStatus(item,e.target.value as Assinatura["status"])}><option value="ativa">Ativa</option><option value="pendente">Pendente</option><option value="atrasada">Atrasada</option><option value="cancelada">Cancelada</option><option value="expirada">Expirada</option></select></td></tr>)}{items.length===0&&<tr><td colSpan={8} className="p-8 text-center text-slate-500">Nenhuma assinatura cadastrada.</td></tr>}</tbody></table></div></Card>
  </div>;
}
