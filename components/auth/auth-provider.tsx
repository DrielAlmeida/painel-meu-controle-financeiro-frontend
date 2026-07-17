import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "@/lib/navigation";
import { authService } from "@/services/auth-service";
import type { Usuario } from "@/types/api";

type AuthContextValue = { usuario: Usuario | null; carregando: boolean; recarregar: () => Promise<void>; sair: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const recarregar = useCallback(async () => {
    try { setUsuario(await authService.me()); }
    catch { setUsuario(null); }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  useEffect(() => {
  const rotasPublicas = [
    "/",
    "/login",
    "/cadastro",
    "/checkout",
    "/termos-de-uso",
    "/politica-de-privacidade",
  ];

  const rotaPublica = rotasPublicas.some((rota) => {
    if (rota === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(rota);
  });

  if (!carregando && !usuario && !rotaPublica) {
    router.replace("/login");
  }
}, [carregando, pathname, router, usuario]);

  const sair = useCallback(async () => {
    try { await authService.logout(); } finally { setUsuario(null); router.replace("/login"); }
  }, [router]);

  const value = useMemo(() => ({ usuario, carregando, recarregar, sair }), [usuario, carregando, recarregar, sair]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return value;
}
