import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // ── Colores de marca (desde .env) ──
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
          light: "var(--color-primary-light)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          dark: "var(--color-secondary-dark)",
          light: "var(--color-secondary-light)",
        },
        third: {
          DEFAULT: "var(--color-third)",
          dark: "var(--color-third-dark)",
          light: "var(--color-third-light)",
        },
        // ── Tokens semánticos de superficie ──
        surface: {
          page: "var(--bg-page)",
          base: "var(--bg-surface)",
          subtle: "var(--bg-subtle)",
          hover: "var(--bg-hover)",
        },
        content: {
          base: "var(--fg-base)",
          muted: "var(--fg-muted)",
          subtle: "var(--fg-subtle)",
        },
        line: {
          DEFAULT: "var(--border-base)",
          subtle: "var(--border-subtle)",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
