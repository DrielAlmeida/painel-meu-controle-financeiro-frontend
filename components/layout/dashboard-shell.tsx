import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useAuth } from "@/components/auth/auth-provider";
import { useSubscriptionBlock } from "@/components/billing/subscription-block-provider";
import { SubscriptionAlert } from "@/components/dashboard/subscription-alert";
import { PendingCheckoutAlert } from "@/components/dashboard/pending-checkout-alert";
import { Button } from "@/components/ui/button";
import { usePathname } from "@/lib/navigation";
import {
  getSubscriptionBlockDestination,
  isSubscriptionProtectedPath,
} from "@/services/subscription-block";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { usuario, carregando, erroSessao, recarregar } = useAuth();
  const { bloqueioAssinatura } = useSubscriptionBlock();
  const pathname = usePathname();

  if (carregando) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#eef6ff] text-sm text-slate-500 dark:bg-[#071a31] dark:text-[#9fb4ca]">
        Validando sua sessão...
      </div>
    );
  }

  if (!usuario && erroSessao) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#eef6ff] p-4 dark:bg-[#071a31]">
        <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-sm dark:border-amber-900 dark:bg-[#0b2440]">
          <h1 className="text-lg font-black">Não foi possível validar sua sessão</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-[#9fb4ca]">
            {erroSessao}
          </p>
          <Button className="mt-5" onClick={() => void recarregar()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#eef6ff] text-sm text-slate-500 dark:bg-[#071a31] dark:text-[#9fb4ca]">
        Redirecionando para o login...
      </div>
    );
  }

  if (
    bloqueioAssinatura &&
    isSubscriptionProtectedPath(pathname)
  ) {
    return (
      <Navigate
        to={getSubscriptionBlockDestination(bloqueioAssinatura)}
        replace
      />
    );
  }

  const rotaAdministrativa =
    pathname === "/admin" || pathname.startsWith("/admin/");

  if (rotaAdministrativa && !usuario.administrador) {
    return <Navigate to="/visao-geral" replace />;
  }

  return (
    <div className="dashboard-app min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <Header onMenu={() => setOpen(true)} />
        <PendingCheckoutAlert />
        {!bloqueioAssinatura && pathname !== "/faturas" && (
          <SubscriptionAlert />
        )}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
