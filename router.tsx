import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import Home from "@/app/page";
import Login from "@/app/(auth)/login/page";
import Cadastro from "@/app/(auth)/cadastro/page";
import EsqueciSenha from "@/app/(auth)/esqueci-minha-senha/page";
import RedefinirSenha from "@/app/(auth)/redefinir-senha/page";
import Checkout from "@/app/checkout/page";
import TermosDeUso from "@/app/termos-de-uso/page";
import PoliticaDePrivacidade from "@/app/politica-de-privacidade/page";
import VisaoGeral from "@/app/(dashboard)/visao-geral/page";
import Desempenho from "@/app/(dashboard)/desempenho/page";
import Gastos from "@/app/(dashboard)/gastos/page";
import ComprasParceladas from "@/app/(dashboard)/compras-parceladas/page";
import GastosRecorrentes from "@/app/(dashboard)/gastos-recorrentes/page";
import Planejamento from "@/app/(dashboard)/planejamento/page";
import Metas from "@/app/(dashboard)/metas/page";
import Patrimonio from "@/app/(dashboard)/patrimonio/page";
import Relatorios from "@/app/(dashboard)/relatorios/page";
import Notificacoes from "@/app/(dashboard)/notificacoes/page";
import Perfil from "@/app/(dashboard)/perfil/page";
import Configuracoes from "@/app/(dashboard)/configuracoes/page";
import Admin from "@/app/(dashboard)/admin/page";
import AdminUsuarios from "@/app/(dashboard)/admin/usuarios/page";
import AdminPlanos from "@/app/(dashboard)/admin/planos/page";
import AdminAssinaturas from "@/app/(dashboard)/admin/assinaturas/page";
import Faturas from "@/app/(dashboard)/faturas/page";

function Dash({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/esqueci-minha-senha" element={<EsqueciSenha />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/termos-de-uso" element={<TermosDeUso />} />
      <Route
        path="/politica-de-privacidade"
        element={<PoliticaDePrivacidade />}
      />
      <Route
        path="/visao-geral"
        element={
          <Dash>
            <VisaoGeral />
          </Dash>
        }
      />
      <Route
        path="/desempenho"
        element={
          <Dash>
            <Desempenho />
          </Dash>
        }
      />
      <Route
        path="/gastos"
        element={
          <Dash>
            <Gastos />
          </Dash>
        }
      />
      <Route
        path="/compras-parceladas"
        element={
          <Dash>
            <ComprasParceladas />
          </Dash>
        }
      />
      <Route
        path="/gastos-recorrentes"
        element={
          <Dash>
            <GastosRecorrentes />
          </Dash>
        }
      />
      <Route
        path="/planejamento"
        element={
          <Dash>
            <Planejamento />
          </Dash>
        }
      />
      <Route
        path="/metas"
        element={
          <Dash>
            <Metas />
          </Dash>
        }
      />
      <Route
        path="/patrimonio"
        element={
          <Dash>
            <Patrimonio />
          </Dash>
        }
      />
      <Route
        path="/relatorios"
        element={
          <Dash>
            <Relatorios />
          </Dash>
        }
      />
      <Route
        path="/notificacoes"
        element={
          <Dash>
            <Notificacoes />
          </Dash>
        }
      />
      <Route
        path="/perfil"
        element={
          <Dash>
            <Perfil />
          </Dash>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <Dash>
            <Configuracoes />
          </Dash>
        }
      />
      <Route
        path="/faturas"
        element={
          <Dash>
            <Faturas />
          </Dash>
        }
      />
      <Route
        path="/admin"
        element={
          <Dash>
            <Admin />
          </Dash>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <Dash>
            <AdminUsuarios />
          </Dash>
        }
      />
      <Route
        path="/admin/planos"
        element={
          <Dash>
            <AdminPlanos />
          </Dash>
        }
      />
      <Route
        path="/admin/assinaturas"
        element={
          <Dash>
            <AdminAssinaturas />
          </Dash>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
