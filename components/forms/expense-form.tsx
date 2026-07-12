import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CriarGastoPayload } from "@/types/api";

const schema=z.object({
  descricao:z.string().min(2,"Informe a descrição"),
  categoria:z.string().min(2,"Informe a categoria"),
  valor_total:z.coerce.number().positive("Informe um valor válido"),
  forma_pagamento:z.string().optional(),
  data_gasto:z.string().min(1,"Informe a data"),
  quantidade_parcelas:z.coerce.number().min(1).max(120),
  primeiro_vencimento:z.string().optional(),
  observacao:z.string().optional(),
  planejado:z.boolean(),
});
type Data=z.infer<typeof schema>;

export function ExpenseForm({onSubmit,carregando=false}:{onSubmit:(data:CriarGastoPayload)=>Promise<void>|void;carregando?:boolean}){
 const{register,handleSubmit,watch,formState:{errors}}=useForm<Data>({resolver:zodResolver(schema),defaultValues:{quantidade_parcelas:1,data_gasto:new Date().toISOString().slice(0,10),planejado:false}});
 const parcelas=watch("quantidade_parcelas");
 return <form onSubmit={handleSubmit(async data=>onSubmit({...data,forma_pagamento:data.forma_pagamento||null,primeiro_vencimento:data.primeiro_vencimento||null,observacao:data.observacao||null}))} className="grid gap-4">
  <label className="grid gap-1 text-sm">Descrição<Input {...register("descricao")}/>{errors.descricao&&<span className="text-xs text-red-500">{errors.descricao.message}</span>}</label>
  <div className="grid gap-4 sm:grid-cols-2">
   <label className="grid gap-1 text-sm">Categoria<Input {...register("categoria")}/>{errors.categoria&&<span className="text-xs text-red-500">{errors.categoria.message}</span>}</label>
   <label className="grid gap-1 text-sm">Valor total<Input type="number" step="0.01" {...register("valor_total")}/>{errors.valor_total&&<span className="text-xs text-red-500">{errors.valor_total.message}</span>}</label>
   <label className="grid gap-1 text-sm">Forma de pagamento<Input {...register("forma_pagamento")}/></label>
   <label className="grid gap-1 text-sm">Data do gasto<Input type="date" {...register("data_gasto")}/></label>
   <label className="grid gap-1 text-sm">Quantidade de parcelas<Input type="number" {...register("quantidade_parcelas")}/></label>
   {Number(parcelas)>1&&<label className="grid gap-1 text-sm">Primeiro vencimento<Input type="date" {...register("primeiro_vencimento")}/></label>}
  </div>
  <label className="grid gap-1 text-sm">Observação<Input {...register("observacao")}/></label>
  <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("planejado")}/>Este gasto estava planejado</label>
  <Button type="submit" disabled={carregando}>{carregando?"Salvando...":"Salvar gasto"}</Button>
 </form>
}
