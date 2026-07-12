export function PageLoading({ texto = "Carregando seus dados..." }: { texto?: string }) {
  return <div className="grid min-h-56 place-items-center rounded-2xl border bg-white p-8 text-sm text-slate-500 dark:bg-[#0d2b4d]">{texto}</div>;
}
export function PageError({ mensagem, tentarNovamente }: { mensagem: string; tentarNovamente?: () => void }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"><p>{mensagem}</p>{tentarNovamente && <button className="mt-3 font-bold underline" onClick={tentarNovamente}>Tentar novamente</button>}</div>;
}
