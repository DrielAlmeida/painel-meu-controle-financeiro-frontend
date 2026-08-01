import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { usePathname, useRouter } from "@/lib/navigation";
import {
  clearSubscriptionBlock,
  getSubscriptionBlockDestination,
  getSubscriptionBlockSnapshot,
  subscribeSubscriptionBlock,
  type SubscriptionBlock,
} from "@/services/subscription-block";

type SubscriptionBlockContextValue = {
  bloqueioAssinatura: SubscriptionBlock | null;
  limparBloqueioAssinatura: () => void;
};

const SubscriptionBlockContext =
  createContext<SubscriptionBlockContextValue | null>(null);

export function SubscriptionBlockProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const bloqueioAssinatura = useSyncExternalStore(
    subscribeSubscriptionBlock,
    getSubscriptionBlockSnapshot,
    getSubscriptionBlockSnapshot,
  );
  const pathname = usePathname();
  const router = useRouter();
  const handledBlock = useRef<SubscriptionBlock | null>(null);

  useEffect(() => {
    if (!bloqueioAssinatura) {
      handledBlock.current = null;
      return;
    }
    if (handledBlock.current === bloqueioAssinatura) return;
    handledBlock.current = bloqueioAssinatura;

    if (pathname === "/faturas" || pathname === "/checkout") return;
    router.replace(getSubscriptionBlockDestination(bloqueioAssinatura));
  }, [bloqueioAssinatura, pathname, router]);

  const value = useMemo(
    () => ({
      bloqueioAssinatura,
      limparBloqueioAssinatura: clearSubscriptionBlock,
    }),
    [bloqueioAssinatura],
  );

  return (
    <SubscriptionBlockContext.Provider value={value}>
      {children}
    </SubscriptionBlockContext.Provider>
  );
}

export function useSubscriptionBlock() {
  const value = useContext(SubscriptionBlockContext);
  if (!value) {
    throw new Error(
      "useSubscriptionBlock deve ser usado dentro de SubscriptionBlockProvider",
    );
  }
  return value;
}
