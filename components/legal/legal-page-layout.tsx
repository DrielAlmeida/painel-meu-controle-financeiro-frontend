import type { ReactNode } from "react";
import { ArrowLeft, WalletCards } from "lucide-react";
import Link from "@/components/router-link";

export function LegalPageLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-[#071a31] dark:text-[#f4f8ff]">
      <article className="mx-auto max-w-4xl rounded-3xl border bg-white p-6 shadow-xl dark:border-[#315f88] dark:bg-[#0d2b4d] sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6 dark:border-[#315f88]">
          <Link href="/" className="flex items-center gap-3 font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">
              <WalletCards size={21} />
            </span>
            Meu Controle Financeiro
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft size={16} />
            Voltar ao cadastro
          </Link>
        </div>
        <header className="py-8">
          <h1 className="text-3xl font-black sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Última atualização: {updatedAt}
          </p>
        </header>
        <div className="legal-content space-y-7 text-sm leading-7 text-slate-700 dark:text-[#c5d5e7]">
          {children}
        </div>
        <footer className="mt-10 border-t pt-6 text-xs text-slate-500 dark:border-[#315f88]">
          Meu Controle Financeiro · CNPJ 43.202.419/0001-39 ·
          adrielislife@yahoo.com.br
        </footer>
      </article>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-xl font-black text-slate-950 dark:text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}
