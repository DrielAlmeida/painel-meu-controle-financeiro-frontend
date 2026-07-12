import type { Config } from "tailwindcss";
export default {
  darkMode: ["class"],
  content: ["./index.html", "./main.tsx", "./router.tsx", "./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./services/**/*.{ts,tsx}"],
  theme: { extend: { boxShadow: { soft: "0 12px 36px rgba(15,23,42,.08)" } } },
  plugins: []
} satisfies Config;
