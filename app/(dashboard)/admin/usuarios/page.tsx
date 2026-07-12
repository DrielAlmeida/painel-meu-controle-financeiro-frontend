
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, KeyRound, Plus, RefreshCw, Shield, ShieldOff, UserX, Unlock } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { adminService } from "@/services/admin-service";
import type { AdminUsuario, AdminUsuarioCreate } from "@/types/api";

const initial: AdminUsuarioCreate = { nome:"", telefone:"", email:"", senha:"", administrador:false, ativo:true, status:"ativo", status_pagamento:"pendente", assinatura_valida_ate:null };

export default function AdminUsuariosPage(){
  const { usuario } = useAuth();
  const [items,setItems]=useState<AdminUsuario[]>([]);
  const [form,setForm]=useState<AdminUsuarioCreate>(initial);
  const [showForm,setShowForm]=useState(false);
  const [busca,setBusca]=useState("");
  const [statusFiltro,setStatusFiltro]=useState("");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  const load=useCallback(async()=>{setLoading(true);setError("");try{const q=new URLSearchParams();if(busca)q.set("busca",busca);if(statusFiltro)q.set("status",statusFiltro);setItems(await adminService.listarUsuarios(q.toString()));}catch(e){setError(e instanceof ApiError?e.message:"Erro ao carregar usuários.");}finally{setLoading(false);}},[busca,statusFiltro]);
  useEffect(()=>{if(usuario?.administrador)void load();},[usuario,load]);
  const pendentes=useMemo(()=>items.filter(i=>i.status==="pendente").length,[items]);

  if(!usuario?.administrador)return <Card><p className="text-sm text-red-500">Acesso restrito ao administrador.</p></Card>;

  async function action(fn:()=>Promise<unknown>){setError("");try{await fn();await load();}catch(e){setError(e instanceof ApiError?e.message:"Não foi possível concluir a ação.");}}
  async function create(e:React.FormEvent){e.preventDefault();await action(async()=>{await adminService.criarUsuario({...form,telefone:form.telefone.replace(/\D/g,"")});setForm(initial);setShowForm(false);});}
  async function resetPassword(id:number){const senha=window.prompt("Digite a nova senha (mínimo 6 caracteres):");if(senha&&senha.length>=6)await action(()=>adminService.redefinirSenha(id,senha));}

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-blue-500">Administração</p><h1 className="text-3xl font-black">Usuários</h1><p className="text-sm text-slate-500">{pendentes} cadastro(s) pendente(s).</p></div><div className="flex gap-2"><Button variant="secondary" onClick={()=>void load()}><RefreshCw size={17}/>Atualizar</Button><Button onClick={()=>setShowForm(v=>!v)}><Plus size={17}/>Novo usuário</Button></div></div>
    {error&&<div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
    {showForm&&<Card><form onSubmit={create} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <label className="grid gap-1 text-sm">Nome<Input required value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/></label>
      <label className="grid gap-1 text-sm">Telefone<div className="flex"><span className="grid place-items-center rounded-l-md border border-r-0 px-3 text-sm">+55</span><Input className="rounded-l-none" required value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value.replace(/\D/g,"").slice(0,11)})} placeholder="27999999999"/></div></label>
      <label className="grid gap-1 text-sm">E-mail<Input type="email" value={form.email??""} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label className="grid gap-1 text-sm">Senha<Input type="password" minLength={6} required value={form.senha} onChange={e=>setForm({...form,senha:e.target.value})}/></label>
      <label className="grid gap-1 text-sm">Status<select className="theme-select h-10 rounded-md border bg-white px-3 dark:bg-[#071a31]" value={form.status} onChange={e=>setForm({...form,status:e.target.value as AdminUsuarioCreate["status"]})}><option value="ativo">Ativo</option><option value="pendente">Pendente</option><option value="bloqueado">Bloqueado</option><option value="recusado">Recusado</option></select></label>
      <label className="grid gap-1 text-sm">Pagamento<select className="theme-select h-10 rounded-md border bg-white px-3 dark:bg-[#071a31]" value={form.status_pagamento} onChange={e=>setForm({...form,status_pagamento:e.target.value as AdminUsuarioCreate["status_pagamento"]})}><option value="pendente">Pendente</option><option value="pago">Pago</option><option value="atrasado">Atrasado</option><option value="isento">Isento</option></select></label>
      <label className="grid gap-1 text-sm">Assinatura válida até<Input type="date" value={form.assinatura_valida_ate??""} onChange={e=>setForm({...form,assinatura_valida_ate:e.target.value||null})}/></label>
      <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={form.administrador} onChange={e=>setForm({...form,administrador:e.target.checked})}/>Administrador</label>
      <div className="md:col-span-2 xl:col-span-4 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={()=>setShowForm(false)}>Cancelar</Button><Button type="submit">Cadastrar</Button></div>
    </form></Card>}
    <Card><div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px_auto]"><Input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar por nome, telefone ou e-mail"/><select className="theme-select h-10 rounded-md border bg-white px-3 dark:bg-[#071a31]" value={statusFiltro} onChange={e=>setStatusFiltro(e.target.value)}><option value="">Todos os status</option><option value="pendente">Pendentes</option><option value="ativo">Ativos</option><option value="bloqueado">Bloqueados</option><option value="recusado">Recusados</option></select><Button onClick={()=>void load()}>Filtrar</Button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="p-3">Usuário</th><th className="p-3">Telefone</th><th className="p-3">Perfil</th><th className="p-3">Status</th><th className="p-3">Pagamento</th><th className="p-3">Validade</th><th className="p-3">Ações</th></tr></thead><tbody>{items.map(item=><tr key={item.id} className="border-b last:border-0"><td className="p-3"><p className="font-semibold">{item.nome}</p><p className="text-xs text-slate-500">{item.email||"Sem e-mail"}</p></td><td className="p-3">+{item.telefone}</td><td className="p-3">{item.administrador?"Administrador":"Usuário"}</td><td className="p-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-[#12375f]">{item.status}</span></td><td className="p-3">{item.status_pagamento||"-"}</td><td className="p-3">{item.assinatura_valida_ate?new Date(item.assinatura_valida_ate+"T00:00:00").toLocaleDateString("pt-BR"):"-"}</td><td className="p-3"><div className="flex flex-wrap gap-1">{item.status==="pendente"&&<Button size="sm" onClick={()=>void action(()=>adminService.aprovar(item.id))}><Check size={14}/>Aprovar</Button>}{item.status==="bloqueado"?<Button size="sm" variant="secondary" onClick={()=>void action(()=>adminService.desbloquear(item.id))}><Unlock size={14}/>Desbloquear</Button>:<Button size="sm" variant="secondary" onClick={()=>void action(()=>adminService.bloquear(item.id))}><UserX size={14}/>Bloquear</Button>}{item.administrador?<Button size="sm" variant="secondary" onClick={()=>void action(()=>adminService.removerAdmin(item.id))}><ShieldOff size={14}/></Button>:<Button size="sm" variant="secondary" onClick={()=>void action(()=>adminService.tornarAdmin(item.id))}><Shield size={14}/></Button>}<Button size="sm" variant="secondary" onClick={()=>void resetPassword(item.id)}><KeyRound size={14}/></Button></div></td></tr>)}{!loading&&items.length===0&&<tr><td colSpan={7} className="p-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>}</tbody></table></div>
    </Card>
  </div>;
}
