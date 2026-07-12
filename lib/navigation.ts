import { useMemo } from "react";
import { useLocation, useNavigate, useSearchParams as useRRSearchParams } from "react-router-dom";

export function usePathname() {
  return useLocation().pathname;
}

export function useSearchParams() {
  const [params] = useRRSearchParams();
  return params;
}

export function useRouter() {
  const navigate = useNavigate();
  return useMemo(
    () => ({
      push: (to: string) => navigate(to),
      replace: (to: string) => navigate(to, { replace: true }),
      back: () => navigate(-1),
      refresh: () => window.location.reload(),
    }),
    [navigate],
  );
}
