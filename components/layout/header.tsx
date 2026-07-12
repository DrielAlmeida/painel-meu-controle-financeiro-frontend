
import Link from "@/components/router-link";
import { Bell, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

export function Header({ onMenu }: { onMenu: () => void }) {
  const { theme, setTheme } = useTheme();
  const { usuario, sair } = useAuth();

  const iniciais = (usuario?.nome ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((nome) => nome[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-blue-200/80 bg-white/95 px-4 text-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-[#24527a] dark:bg-[#08223e]/95 dark:text-[#f4f8ff] dark:shadow-[0_8px_30px_rgba(2,15,30,0.18)] lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-[#d9e6f4] dark:hover:bg-[#17466f] dark:hover:text-white lg:hidden"
          onClick={onMenu}
          aria-label="Abrir menu"
        >
          <Menu />
        </button>

        <div>
          <p className="text-xs text-slate-500 dark:text-[#9fb4ca]">Olá,</p>
          <p className="font-semibold text-slate-900 dark:text-[#f4f8ff]">{usuario?.nome}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* <Button
          variant="ghost"
          size="sm"
          className="border border-blue-200 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:border-[#315f88] dark:bg-transparent dark:text-[#d9e6f4] dark:hover:bg-[#17466f] dark:hover:text-white"
          aria-label="Alternar tema"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button> */}

        <Link
          href="/notificacoes"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-[#d9e6f4] dark:hover:bg-[#17466f] dark:hover:text-white"
        >
          <Bell size={18} />
          <span className="hidden sm:inline">Alertas</span>
        </Link>

        <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 font-bold text-blue-700 ring-1 ring-blue-300/70 dark:bg-[#dbeafe] dark:text-[#1d4ed8] dark:ring-[#60a5fa]/50">
          {iniciais}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-slate-600 hover:bg-blue-50 hover:text-blue-700 dark:text-[#d9e6f4] dark:hover:bg-[#17466f] dark:hover:text-white"
          onClick={() => void sair()}
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}
