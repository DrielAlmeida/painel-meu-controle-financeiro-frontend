
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MetaFinanceiraPayload } from "@/types/api";

const schema = z.object({
  titulo: z.string().min(2, "Informe um título"),
  descricao: z.string().optional(),
  valor_meta: z.coerce.number().positive("Informe um valor válido"),
  valor_atual: z.coerce.number().min(0),
  data_limite: z.string().optional(),
  categoria: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function GoalForm({ onSubmit, loading = false }: { onSubmit: (payload: MetaFinanceiraPayload) => Promise<void> | void; loading?: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { valor_atual: 0 },
  });

  return (
    <form className="grid gap-4" onSubmit={handleSubmit((data) => onSubmit({
      ...data,
      descricao: data.descricao || null,
      categoria: data.categoria || null,
      data_limite: data.data_limite || null,
    }))}>
      <label className="grid gap-1 text-sm">Título<Input {...register("titulo")} />{errors.titulo && <span className="text-xs text-red-500">{errors.titulo.message}</span>}</label>
      <label className="grid gap-1 text-sm">Descrição<Input {...register("descricao")} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">Valor da meta<Input type="number" step="0.01" {...register("valor_meta")} />{errors.valor_meta && <span className="text-xs text-red-500">{errors.valor_meta.message}</span>}</label>
        <label className="grid gap-1 text-sm">Valor já guardado<Input type="number" step="0.01" {...register("valor_atual")} /></label>
        <label className="grid gap-1 text-sm">Data limite<Input type="date" {...register("data_limite")} /></label>
        <label className="grid gap-1 text-sm">Categoria<Input placeholder="Reserva, viagem, moto..." {...register("categoria")} /></label>
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Criar meta"}</Button>
    </form>
  );
}
