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
        sans: ['"Source Sans 3"', "system-ui", "sans-serif"],
        serif: ['"Playfair Display"', "Georgia", "serif"],
      },
      // fontFamily: {
      //   sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      //   serif: ["var(--font-serif)", "Georgia", "serif"],
      //   display: ["var(--font-serif)", "Georgia", "serif"],
      //   mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      // },
      // colors: {
      //   primary: {
      //     DEFAULT: "var(--color-primary)",
      //     dark: "var(--color-primary-dark)",
      //     light: "var(--color-primary-light)",
      //   },
      //   secondary: {
      //     DEFAULT: "var(--color-secondary)",
      //     dark: "var(--color-secondary-dark)",
      //     light: "var(--color-secondary-light)",
      //   },
      //   third: {
      //     DEFAULT: "var(--color-third)",
      //     dark: "var(--color-third-dark)",
      //     light: "var(--color-third-light)",
      //   },
      //   surface: {
      //     page: "var(--bg-page)",
      //     base: "var(--bg-surface)",
      //     subtle: "var(--bg-subtle)",
      //     hover: "var(--bg-hover)",
      //   },
      //   content: {
      //     base: "var(--fg-base)",
      //     muted: "var(--fg-muted)",
      //     subtle: "var(--fg-subtle)",
      //   },
      //   line: {
      //     DEFAULT: "var(--border-base)",
      //     subtle: "var(--border-subtle)",
      //   },
      // },

      // ─── COLORES ───────────────────────────────────────────────
      colors: {
        dimar: {
          charcoal: "#36454F", // color principal de texto y fondos oscuros
          blue: "#7BAFD4", // color de acento / CTA
          blueDark: "#6aa0c9", // hover del botón azul
          cream: "#FAFAF9", // fondo principal
          border: "#E5E4E2", // bordes y divisores
          textMid: "#5b656b", // texto secundario
          textLight: "#7c858b", // texto terciario
          textFaint: "#9aa3a9", // placeholders y precios tachados
        },
      },

      // ─── TAMAÑOS / CONTENEDORES ────────────────────────────────
      maxWidth: {
        site: "1240px",
        content: "1000px",
        hero: "680px",
        copy: "460px",
      },

      // ─── BORDER RADIUS ─────────────────────────────────────────
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },

      // ─── BLUR ──────────────────────────────────────────────────
      blur: {
        sm: "8px",
        md: "12px",
      },

      // ─── BOX SHADOWS ───────────────────────────────────────────
      boxShadow: {
        card: "0 2px 4px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.05)",
        bar: "0 8px 40px rgba(0,0,0,0.10)",
        hero: "0 20px 60px rgba(0,0,0,0.25)",
        cta: "0 8px 24px rgba(123,175,212,0.45)",
        float: "0 18px 50px rgba(0,0,0,0.10)",
        video: "0 30px 80px rgba(0,0,0,0.3)",
        input: "0 1px 2px rgba(0,0,0,0.03)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.15)",
      },

      // ─── LINE HEIGHT ───────────────────────────────────────────
      lineHeight: {
        hero: "1.02",
        title: "1.05",
        quote: "1.12",
        body: "1.8",
        tight: "1.25",
        snug: "1.375",
        relaxed: "1.625",
      },

      // ─── LETTER SPACING ────────────────────────────────────────
      letterSpacing: {
        "tighter-1": "-0.01em",
        "tighter-2": "-0.02em",
        "tighter-3": "-0.03em",
        "wider-22": "0.22em",
        "wider-28": "0.28em",
        "wider-30": "0.30em",
        "wider-32": "0.32em",
        wide: "0.025em",
      },

      // ─── FONT SIZE (custom) ────────────────────────────────────
      fontSize: {
        "10": "10px",
        "11": "11px",
        "12": "12px",
        "13": "13px",
        "14": "14px",
        "15": "15px",
        "16": "16px",
        "18": "18px",
        "20": "20px",
        "21": "21px",
        "26": "26px",
        "30": "30px",
        "52": "52px",
        // fluid (clamp) — responsive sin media queries
        "fluid-hero":    "clamp(2.6rem,5.5vw,4.5rem)",
        "fluid-quote":   "clamp(2.1rem,4.4vw,3.6rem)",
        "fluid-title":   "clamp(2rem,3.6vw,3rem)",
        "fluid-section": "clamp(2rem,3.8vw,3.2rem)",
        "fluid-card":    "clamp(1.9rem,3vw,2.8rem)",
        "fluid-label":   "clamp(1.5rem,2vw,2rem)",
        "fluid-jumbo":   "clamp(5rem,16vw,15rem)",
      },

      // ─── TRANSICIONES ──────────────────────────────────────────
      transitionDuration: {
        DEFAULT: "150ms",
        "300": "300ms",
        "700": "700ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      // ─── ASPECT RATIO ──────────────────────────────────────────
      aspectRatio: {
        video: "16 / 9",
      },
    },
  },
  plugins: [],
} satisfies Config;
