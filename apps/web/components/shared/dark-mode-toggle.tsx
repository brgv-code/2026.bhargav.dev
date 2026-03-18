"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

function applyMode(dark: boolean) {
  const html = document.documentElement;
  html.classList.toggle("dark", dark);
  html.classList.toggle("light", !dark);
}

export function DarkModeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dark-mode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored === "dark" || (stored === null && prefersDark);
    setIsDark(dark);
    applyMode(dark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    applyMode(next);
    localStorage.setItem("dark-mode", next ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
    >
      {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    </button>
  );
}
