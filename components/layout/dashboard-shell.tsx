import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useAuth } from "@/components/auth/auth-provider";
import { useSubscriptionBlock } from "@/components/billing/subscription-block-provider";
import { SubscriptionAlert } from "@/components/dashboard/subscription-alert";
import { PendingCheckoutAlert } from "@/components/dashboard/pending-checkout-alert";
import { usePathname } from "@/lib/navigation";
import {
  getSubscriptionBlockDestination,
  isSubscriptionProtectedPath,
} from "@/services/subscription-block";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { usuario, carregando } = useAuth();
  const { bloqueioAssinatura } = useSubscriptionBlock();
  const pathname = usePathname();

  if (carregando || !usuario) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#eef6ff] text-sm text-slate-500 dark:bg-[#071a31] dark:text-[#9fb4ca]">
        Validando sua sessão...
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
