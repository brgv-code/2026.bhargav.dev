"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type ThemePalette =
  | "mono-warm"
  | "mono-cool"
  | "mono-green"
  | "mono-rose"
  | "mono-amber";

interface ThemeContextType {
  theme: ThemePalette;
  setTheme: (theme: ThemePalette) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themeConfig: Record<
  ThemePalette,
  { name: string; preview: string; hue: number }
> = {
  "mono-warm": { name: "warm", preview: "#d4c4b0", hue: 60 },
  "mono-cool": { name: "cool", preview: "#b0c4d4", hue: 220 },
  "mono-green": { name: "green", preview: "#b8d4b0", hue: 120 },
  "mono-rose": { name: "rose", preview: "#d4b0c4", hue: 340 },
  "mono-amber": { name: "amber", preview: "#d4c0a0", hue: 45 },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePalette>("mono-warm");

  // Load theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemePalette | null;
    if (stored && themeConfig[stored]) {
      setThemeState(stored);
      applyTheme(stored);
    }
  }, []);

  const setTheme = (newTheme: ThemePalette) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(theme: ThemePalette) {
  const hue = themeConfig[theme].hue;
  const root = document.documentElement;

  // Apply theme by updating CSS custom properties
  root.style.setProperty("--background", `oklch(0.12 0.005 ${hue})`);
  root.style.setProperty("--foreground", `oklch(0.82 0.01 ${hue})`);
  root.style.setProperty("--card", `oklch(0.15 0.005 ${hue})`);
  root.style.setProperty("--card-foreground", `oklch(0.82 0.01 ${hue})`);
  root.style.setProperty("--popover", `oklch(0.15 0.005 ${hue})`);
  root.style.setProperty("--popover-foreground", `oklch(0.82 0.01 ${hue})`);
  root.style.setProperty("--primary", `oklch(0.78 0.01 ${hue})`);
  root.style.setProperty("--primary-foreground", `oklch(0.12 0.005 ${hue})`);
  root.style.setProperty("--secondary", `oklch(0.18 0.005 ${hue})`);
  root.style.setProperty("--secondary-foreground", `oklch(0.72 0.01 ${hue})`);
  root.style.setProperty("--muted", `oklch(0.18 0.005 ${hue})`);
  root.style.setProperty("--muted-foreground", `oklch(0.52 0.01 ${hue})`);
  root.style.setProperty("--border", `oklch(0.22 0.005 ${hue})`);
  root.style.setProperty("--input", `oklch(0.18 0.005 ${hue})`);
  root.style.setProperty("--ring", `oklch(0.52 0.01 ${hue})`);

  // Accent colors with subtle saturation
  const accentHue = (hue + 180) % 360;
  root.style.setProperty("--accent", `oklch(0.65 0.06 ${accentHue})`);
  root.style.setProperty("--accent-foreground", `oklch(0.12 0.005 ${hue})`);
  root.style.setProperty("--link", `oklch(0.68 0.05 ${accentHue})`);
  root.style.setProperty("--link-hover", `oklch(0.75 0.07 ${accentHue})`);
  root.style.setProperty("--icon-accent", `oklch(0.62 0.04 ${hue})`);
  root.style.setProperty("--highlight", `oklch(0.65 0.05 ${hue})`);

  // Streak colors
  root.style.setProperty("--streak-0", `oklch(0.18 0.005 ${hue})`);
  root.style.setProperty("--streak-1", `oklch(0.28 0.02 ${hue})`);
  root.style.setProperty("--streak-2", `oklch(0.42 0.04 ${hue})`);
  root.style.setProperty("--streak-3", `oklch(0.56 0.05 ${hue})`);
  root.style.setProperty("--streak-4", `oklch(0.70 0.06 ${hue})`);
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
