
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GastoRecorrentePayload } from "@/types/api";

const schema = z.object({
  descricao: z.string().min(2, "Informe a descrição"),
  categoria: z.string().min(2, "Informe a categoria"),
  valor: z.coerce.number().positive("Informe um valor válido"),
  forma_pagamento: z.string().optional(),
  frequencia: z.enum(["mensal", "semanal", "quinzenal", "anual", "personalizada"]),
  intervalo_personalizado_dias: z.coerce.number().optional(),
  dia_vencimento: z.coerce.number().min(1).max(31).optional(),
  data_inicio: z.string().min(1),
  data_fim: z.string().optional(),
  proxima_execucao: z.string().optional(),
  gerar_automaticamente: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function RecurringForm({ onSubmit, loading = false }: { onSubmit: (payload: GastoRecorrentePayload) => Promise<void> | void; loading?: boolean }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      frequencia: "mensal",
      data_inicio: new Date().toISOString().slice(0, 10),
      gerar_automaticamente: true,
    },
  });
  const frequency = watch("frequencia");

  return (
    <form className="grid gap-4" onSubmit={handleSubmit((data) => onSubmit({
      ...data,
      forma_pagamento: data.forma_pagamento || null,
      intervalo_personalizado_dias: frequency === "personalizada" ? data.intervalo_personalizado_dias || null : null,
      dia_vencimento: data.dia_vencimento || null,
      data_fim: data.data_fim || null,
      proxima_execucao: data.proxima_execucao || data.data_inicio,
    }))}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">Descrição<Input {...register("descricao")} />{errors.descricao && <span className="text-xs text-red-500">{errors.descricao.message}</span>}</label>
        <label className="grid gap-1 text-sm">Categoria<Input {...register("categoria")} />{errors.categoria && <span className="text-xs text-red-500">{errors.categoria.message}</span>}</label>
        <label className="grid gap-1 text-sm">Valor<Input type="number" step="0.01" {...register("valor")} /></label>
        <label className="grid gap-1 text-sm">Forma de pagamento<Input {...register("forma_pagamento")} /></label>
        <label className="grid gap-1 text-sm">Frequência<select className="h-10 rounded-xl border bg-transparent px-3" {...register("frequencia")}><option value="mensal">Mensal</option><option value="semanal">Semanal</option><option value="quinzenal">Quinzenal</option><option value="anual">Anual</option><option value="personalizada">Personalizada</option></select></label>
        {frequency === "personalizada" && <label className="grid gap-1 text-sm">Intervalo em dias<Input type="number" min="1" max="365" {...register("intervalo_personalizado_dias")} /></label>}
        <label className="grid gap-1 text-sm">Dia do vencimento<Input type="number" min="1" max="31" {...register("dia_vencimento")} /></label>
        <label className="grid gap-1 text-sm">Data de início<Input type="date" {...register("data_inicio")} /></label>
        <label className="grid gap-1 text-sm">Próxima execução<Input type="date" {...register("proxima_execucao")} /></label>
        <label className="grid gap-1 text-sm">Data final (opcional)<Input type="date" {...register("data_fim")} /></label>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("gerar_automaticamente")} />Gerar automaticamente</label>
      <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Cadastrar recorrente"}</Button>
    </form>
  );
}
