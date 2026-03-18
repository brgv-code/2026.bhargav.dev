import type { Config } from "tailwindcss";

const config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx,mdx}",
    "../../packages/ui/**/*.{ts,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Semantic tokens — driven by CSS custom properties
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        muted: "var(--color-text-muted)",
        accent: "var(--color-accent)",
        "accent-foreground": "var(--color-accent-foreground)",
        border: "var(--color-border)",
        link: "var(--color-link)",
        "link-hover": "var(--color-link-hover)",
        highlight: "var(--color-highlight)",

        // Atelier Mono palette — raw hex values for direct use
        "atelier-cream": "#fcf9f8",
        "atelier-ink": "#323233",
        "atelier-dark": "#1A1A1A",
        phthalo: {
          DEFAULT: "#123524",
          light: "#1e5c3e",
          dark: "#0b2318",
        },
      },
      fontFamily: {
        // UI / body copy
        sans: ["Manrope", "system-ui", "sans-serif"],
        // Headline / editorial
        serif: ["Noto Serif", "Georgia", "serif"],
        // Code
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
