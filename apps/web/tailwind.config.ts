import type { Config } from "tailwindcss";

/**
 * Tailwind Design System — Atelier Mono
 *
 * Every value here references a CSS custom property defined in globals.css.
 * No raw colours, hex codes, or magic numbers appear in this file.
 *
 * Token layers (defined in globals.css):
 *   1. Raw palette  — --palette-*   (atomic, never used directly in components)
 *   2. Semantic     — --color-*     (what components consume)
 *   3. Typography   — --font-*, --text-*, --leading-*, --weight-*, --tracking-*
 *   4. Spacing      — --space-*
 *   5. Border       — --border-*, --radius-*
 *   6. Shadows      — --shadow-*
 *   7. Motion       — --duration-*, --ease-*
 *   8. Z-index      — --z-*
 *   9. Layout       — --sidebar-width, --header-height, etc.
 */

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
        background: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        primary: "var(--color-text)",
        secondary: "var(--color-text-subtle)",
        muted: "var(--color-text-muted)",
        disabled: "var(--color-text-disabled)",
        inverse: "var(--color-text-inverse)",
        "on-accent": "var(--color-text-on-accent)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        "accent-subtle": "var(--color-accent-subtle)",
        "accent-muted": "var(--color-accent-muted)",
        "accent-fg": "var(--color-accent-fg)",
        "accent-foreground":
          "var(--color-accent-fg)" /* backward-compat alias */,
        border: "var(--color-border)",
        "border-subtle": "var(--color-border-subtle)",
        "border-strong": "var(--color-border-strong)",
        "border-focus": "var(--color-border-focus)",
        highlight: "var(--color-highlight)",
        link: "var(--color-link)",
        "link-hover": "var(--color-link-hover)",
        "link-visited": "var(--color-link-visited)",
        "interactive-hover": "var(--color-interactive-hover)",
        "interactive-active": "var(--color-interactive-active)",
        "tag-bg": "var(--color-tag-bg)",
        "tag-text": "var(--color-tag-text)",
        "tag-border": "var(--color-tag-border)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",

        /* Raw palette — available as escape hatches (use sparingly) */
        "cream-50": "var(--palette-cream-50)",
        "cream-100": "var(--palette-cream-100)",
        "cream-200": "var(--palette-cream-200)",
        "cream-300": "var(--palette-cream-300)",
        "cream-400": "var(--palette-cream-400)",
        "cream-500": "var(--palette-cream-500)",
        "cream-600": "var(--palette-cream-600)",
        "cream-700": "var(--palette-cream-700)",
        "cream-800": "var(--palette-cream-800)",
        "cream-900": "var(--palette-cream-900)",
        "green-50": "var(--palette-green-50)",
        "green-100": "var(--palette-green-100)",
        "green-200": "var(--palette-green-200)",
        "green-300": "var(--palette-green-300)",
        "green-400": "var(--palette-green-400)",
        "green-500": "var(--palette-green-500)",
        "green-600": "var(--palette-green-600)",
        "green-700": "var(--palette-green-700)",
      },

      /* ── Typography ──────────────────────────────────────────────────────── */
      fontFamily: {
        sans: "var(--font-sans)",
        serif: "var(--font-serif)",
        mono: "var(--font-mono)",
      },
      fontSize: {
        "2xs": "var(--text-2xs)",
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        base: "var(--text-base)",
        md: "var(--text-md)",
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        "2xl": "var(--text-2xl)",
        "3xl": "var(--text-3xl)",
        "4xl": "var(--text-4xl)",
        "5xl": "var(--text-5xl)",
        "6xl": "var(--text-6xl)",
      },
      lineHeight: {
        none: "var(--leading-none)",
        tight: "var(--leading-tight)",
        snug: "var(--leading-snug)",
        normal: "var(--leading-normal)",
        relaxed: "var(--leading-relaxed)",
        loose: "var(--leading-loose)",
      },
      fontWeight: {
        light: "var(--weight-light)",
        normal: "var(--weight-normal)",
        medium: "var(--weight-medium)",
        semibold: "var(--weight-semibold)",
        bold: "var(--weight-bold)",
        extrabold: "var(--weight-extrabold)",
      },
      letterSpacing: {
        tighter: "var(--tracking-tighter)",
        tight: "var(--tracking-tight)",
        normal: "var(--tracking-normal)",
        wide: "var(--tracking-wide)",
        wider: "var(--tracking-wider)",
        widest: "var(--tracking-widest)",
        ultra: "var(--tracking-ultra)",
      },

      spacing: {
        sidebar: "var(--sidebar-width)",
        "sidebar-sm": "var(--sidebar-width-sm)",
        header: "var(--header-height)",
        "article-inline": "var(--article-inline-gutter)",
      },

      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      borderWidth: {
        DEFAULT: "var(--border-width)",
        "2": "var(--border-width-2)",
        "4": "var(--border-width-4)",
      },

      boxShadow: {
        none: "var(--shadow-none)",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        inner: "var(--shadow-inner)",
      },

      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
      },
      transitionTimingFunction: {
        DEFAULT: "var(--ease-default)",
        in: "var(--ease-in)",
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
        spring: "var(--ease-spring)",
      },

      zIndex: {
        below: "var(--z-below)",
        base: "var(--z-base)",
        raised: "var(--z-raised)",
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
      },

      width: {
        sidebar: "var(--sidebar-width)",
        "sidebar-sm": "var(--sidebar-width-sm)",
        "right-panel": "var(--right-panel-width)",
        search: "var(--search-width)",
        "search-focus": "var(--search-width-focus)",
      },
      maxWidth: {
        prose: "var(--content-max-width)",
        "prose-lg": "var(--content-max-width-lg)",
      },
      height: {
        header: "var(--header-height)",
      },
      gridTemplateColumns: {
        "home-main": "1fr var(--right-panel-width)",
      },
      inset: {
        "writing-header": "var(--writing-post-header-offset)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
