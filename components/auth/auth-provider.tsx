import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "@/lib/navigation";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  ApiError,
  clearCsrfToken,
  refreshCsrfToken,
} from "@/lib/api";
import { authService } from "@/services/auth-service";
import { clearPendingCheckout } from "@/services/checkout-progress";
import { clearSubscriptionBlock } from "@/services/subscription-block";
import type { LoginPayload, Usuario } from "@/types/api";

type AuthContextValue = {
  usuario: Usuario | null;
  carregando: boolean;
  erroSessao: string | null;
  entrar: (payload: LoginPayload) => Promise<Usuario>;
  recarregar: () => Promise<void>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/cadastro",
  "/esqueci-minha-senha",
  "/redefinir-senha",
  "/checkout",
  "/termos-de-uso",
  "/politica-de-privacidade",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [sessaoInvalida, setSessaoInvalida] = useState(false);
  const [erroSessao, setErroSessao] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setSessaoInvalida(false);
    setErroSessao(null);

    try {
      const currentUser = await authService.me();
      setUsuario(currentUser);

      try {
        await refreshCsrfToken();
      } catch (error) {
        clearCsrfToken();
        if (error instanceof ApiError && error.status === 401) {
          clearSubscriptionBlock();
          setUsuario(null);
          setSessaoInvalida(true);
        }
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearCsrfToken();
        clearSubscriptionBlock();
        setUsuario(null);
        setSessaoInvalida(true);
        return;
      }

      setErroSessao(
        error instanceof ApiError
          ? error.message
          : "Não foi possível validar sua sessão. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  const entrar = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    clearSubscriptionBlock();
    setUsuario(response.usuario);
    setSessaoInvalida(false);
    setErroSessao(null);
    setCarregando(false);
    return response.usuario;
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  useEffect(() => {
    const handleSessionExpired = () => {
      clearCsrfToken();
      clearSubscriptionBlock();
      setUsuario(null);
      setSessaoInvalida(true);
      setErroSessao(null);
      setCarregando(false);
      router.replace("/login");
    };

    window.addEventListener(
      AUTH_SESSION_EXPIRED_EVENT,
      handleSessionExpired,
    );
    return () =>
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleSessionExpired,
      );
  }, [router]);

  useEffect(() => {
    if (
      !carregando &&
      sessaoInvalida &&
      !usuario &&
      !isPublicRoute(pathname)
    ) {
      router.replace("/login");
    }
  }, [carregando, pathname, router, sessaoInvalida, usuario]);

  const sair = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearCsrfToken();
      clearSubscriptionBlock();
      clearPendingCheckout();
      setUsuario(null);
      setSessaoInvalida(true);
      setErroSessao(null);
      setCarregando(false);
      router.replace("/login");
    }
  }, [router]);

  const value = useMemo(
    () => ({
      usuario,
      carregando,
      erroSessao,
      entrar,
      recarregar,
      sair,
    }),
    [usuario, carregando, erroSessao, entrar, recarregar, sair],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return value;
}
