import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { plansService } from "@/services/plans-service";
import type { Plano, PlanoPayload } from "@/types/api";

const initial: PlanoPayload = {
  nome:"", descricao:"", valor_mensal:0, valor_anual:null, codigo:"",
  duracao_meses:1, dias_gratis:0, destaque:false, limite_gastos_mes:null,
  permite_whatsapp:true, permite_relatorios:true, permite_investimentos:true,
  permite_exportacao:true, ativo:true,
};

export default function AdminPlanosPage(){
  const { usuario }=useAuth();
  const [items,setItems]=useState<Plano[]>([]);
  const [form,setForm]=useState<PlanoPayload>(initial);
  const [editing,setEditing]=useState<number|null>(null);
  const [showForm,setShowForm]=useState(false);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);

  const load=useCallback(async()=>{setLoading(true);setError("");try{setItems(await plansService.listarPlanos(true));}catch(e){setError(e instanceof ApiError?e.message:"Erro ao carregar os planos.");}finally{setLoading(false);}},[]);
  useEffect(()=>{if(usuario?.administrador)void load();},[usuario,load]);
  if(!usuario?.administrador)return <Card><p className="text-sm text-red-500">Acesso restrito ao administrador.</p></Card>;

  function edit(item:Plano){
    setEditing(item.id); setShowForm(true);
    setForm({
      nome:item.nome, descricao:item.descricao??"", valor_mensal:Number(item.valor_mensal),
      valor_anual:item.valor_anual?Number(item.valor_anual):null, codigo:item.codigo??"",
      duracao_meses:item.duracao_meses??1, dias_gratis:item.dias_gratis??0,
      destaque:item.destaque??false, limite_gastos_mes:item.limite_gastos_mes,
      permite_whatsapp:item.permite_whatsapp, permite_relatorios:item.permite_relatorios,
      permite_investimentos:item.permite_investimentos, permite_exportacao:item.permite_exportacao,
      ativo:item.ativo,
    });
  }
  function reset(){setEditing(null);setShowForm(false);setForm(initial);}
  async function save(e:React.FormEvent){e.preventDefault();setError("");try{if(editing)await plansService.atualizarPlano(editing,form);else await plansService.criarPlano(form);reset();await load();}catch(err){setError(err instanceof ApiError?err.message:"Não foi possível salvar o plano.");}}
  async function disable(id:number){if(!window.confirm("Deseja desativar este plano?"))return;try{await plansService.desativarPlano(id);await load();}catch(err){setError(err instanceof ApiError?err.message:"Não foi possível desativar o plano.");}}

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-blue-500">Administração</p><h1 className="text-3xl font-black">Planos</h1><p className="text-sm text-slate-500">Preços, duração, período grátis e funcionalidades.</p></div><div className="flex gap-2"><Button variant="secondary" onClick={()=>void load()}><RefreshCw size={17}/>Atualizar</Button><Button onClick={()=>{reset();setShowForm(true)}}><Plus size={17}/>Novo plano</Button></div></div>
    {error&&<div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
    {showForm&&<Card><form onSubmit={save} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <label className="grid gap-1 text-sm">Nome<Input required value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/></label>
      <label className="grid gap-1 text-sm">Código<Input placeholder="basico, premium, trimestral..." value={form.codigo??""} onChange={e=>setForm({...form,codigo:e.target.value.toLowerCase().replace(/\s+/g,"-")})}/></label>
      <label className="grid gap-1 text-sm md:col-span-2">Descrição<Input value={form.descricao??""} onChange={e=>setForm({...form,descricao:e.target.value})}/></label>
      <label className="grid gap-1 text-sm">Valor do plano<Input type="number" min="0" step="0.01" value={form.valor_mensal} onChange={e=>setForm({...form,valor_mensal:Number(e.target.value)})}/></label>
      <label className="grid gap-1 text-sm">Valor anual opcional<Input type="number" min="0" step="0.01" value={form.valor_anual??""} onChange={e=>setForm({...form,valor_anual:e.target.value?Number(e.target.value):null})}/></label>
      <label className="grid gap-1 text-sm">Duração em meses<Input type="number" min="1" max="120" value={form.duracao_meses??1} onChange={e=>setForm({...form,duracao_meses:Number(e.target.value)||1})}/></label>
      <label className="grid gap-1 text-sm">Dias grátis<Input type="number" min="0" max="365" value={form.dias_gratis??0} onChange={e=>setForm({...form,dias_gratis:Number(e.target.value)||0})}/></label>
      <label className="grid gap-1 text-sm">Limite de gastos/mês<Input type="number" min="1" value={form.limite_gastos_mes??""} onChange={e=>setForm({...form,limite_gastos_mes:e.target.value?Number(e.target.value):null})}/></label>
      <div className="grid content-center gap-2 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={form.destaque??false} onChange={e=>setForm({...form,destaque:e.target.checked})}/>Destacar na landing page</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.ativo} onChange={e=>setForm({...form,ativo:e.target.checked})}/>Plano ativo</label></div>
      <div className="md:col-span-2 xl:col-span-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4"><label className="flex items-center gap-2"><input type="checkbox" checked={form.permite_whatsapp} onChange={e=>setForm({...form,permite_whatsapp:e.target.checked})}/>WhatsApp</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.permite_relatorios} onChange={e=>setForm({...form,permite_relatorios:e.target.checked})}/>Relatórios</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.permite_investimentos} onChange={e=>setForm({...form,permite_investimentos:e.target.checked})}/>Investimentos</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.permite_exportacao} onChange={e=>setForm({...form,permite_exportacao:e.target.checked})}/>Exportação</label></div>
      <div className="md:col-span-2 xl:col-span-4 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={reset}>Cancelar</Button><Button type="submit">{editing?"Salvar alterações":"Criar plano"}</Button></div>
    </form></Card>}
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{items.map(item=><Card key={item.id} className={!item.ativo?"opacity-60":""}><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black">{item.nome}</h2><span className={`rounded-full px-2 py-1 text-xs ${item.ativo?"bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300":"bg-slate-200 text-slate-600"}`}>{item.ativo?"Ativo":"Inativo"}</span>{item.destaque&&<span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">Destaque</span>}</div><p className="mt-1 text-sm text-slate-500">{item.descricao||"Sem descrição"}</p></div><div className="flex gap-1"><Button size="sm" variant="secondary" onClick={()=>edit(item)}><Pencil size={14}/></Button>{item.ativo&&<Button size="sm" variant="danger" onClick={()=>void disable(item.id)}><Trash2 size={14}/></Button>}</div></div><div className="mt-5"><p className="text-3xl font-black text-blue-500">{formatCurrency(Number(item.valor_mensal))}<span className="text-sm font-normal text-slate-500"> / {item.duracao_meses===12?"ano":item.duracao_meses&&item.duracao_meses>1?`${item.duracao_meses} meses`:"mês"}</span></p>{Number(item.dias_gratis||0)>0&&<p className="mt-1 text-sm font-bold text-emerald-600">{item.dias_gratis} dias grátis</p>}</div><div className="mt-5 grid grid-cols-2 gap-2 text-sm"><span>{item.permite_whatsapp?"✓":"—"} WhatsApp</span><span>{item.permite_relatorios?"✓":"—"} Relatórios</span><span>{item.permite_investimentos?"✓":"—"} Investimentos</span><span>{item.permite_exportacao?"✓":"—"} Exportação</span></div></Card>)}{!loading&&items.length===0&&<Card><p className="text-sm text-slate-500">Nenhum plano cadastrado.</p></Card>}</div>
  </div>;
}
