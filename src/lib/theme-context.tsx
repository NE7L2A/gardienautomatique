"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Theme, Tokens } from "./theme";
import { DARK, LIGHT } from "./theme";

interface ThemeContextValue {
  t: Tokens;
  theme: Theme;
  toggle: () => void;
}

export const ThemeCtx = createContext<ThemeContextValue>({
  t: DARK,
  theme: "dark",
  toggle: () => {},
});

export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    try {
      return (localStorage.getItem("protecteur_theme") as Theme) || "dark";
    } catch {
      return "dark";
    }
  });

  const t = theme === "dark" ? DARK : LIGHT;

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("protecteur_theme", next);
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.style.background = t.bg;
  }, [theme, t.bg]);

  return (
    <ThemeCtx.Provider value={{ t, theme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}
