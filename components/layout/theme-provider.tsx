import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "dark";

// Para reativar futuramente:
// type Theme = "light" | "dark";

type Value = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<Value | null>(null);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const html = document.documentElement;

    html.classList.add("dark");
    html.dataset.theme = "dark";

    localStorage.setItem("theme", "dark");
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeState,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error(
      "useTheme deve ser usado dentro de ThemeProvider",
    );
  }

  return value;
}
