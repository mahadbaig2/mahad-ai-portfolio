import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        headline: ["Creato Display", "sans-serif"],
        sans: ["Creato Display", "sans-serif"],
        body: ["Creato Display", "sans-serif"],
        mono: ["Creato Display", "sans-serif"],
        label: ["Creato Display", "sans-serif"],
      },
      colors: {
        background: "#f3f4ee",
        foreground: "#122922",
        primary: {
          DEFAULT: "#0c342a",
          fixed: "#dce9dd",
          "fixed-dim": "#b6d1bd",
          container: "#16543f",
        },
        surface: {
          DEFAULT: "#f3f4ee",
          bright: "#fffefa",
          dim: "#e0e7dc",
          variant: "#dce9dd",
          "container-lowest": "#ffffff",
          "container-low": "#f8faf4",
          container: "#eef2e9",
          "container-high": "#e4ecdf",
          "container-highest": "#dce9dd",
        },
        secondary: {
          DEFAULT: "#286f55",
          container: "#dce9dd",
          fixed: "#dce9dd",
          "fixed-dim": "#b6d1bd",
        },
        tertiary: {
          DEFAULT: "#16543f",
          container: "#16543f",
          fixed: "#dce9dd",
          "fixed-dim": "#b6d1bd",
        },
        "on-surface": "#122922",
        "on-surface-variant": "#42594a",
        "on-primary": "#ffffff",
        "on-primary-container": "#dce9dd",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#0c342a",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#0c342a",
        outline: {
          DEFAULT: "#607867",
          variant: "#cbd8c9",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        muted: {
          DEFAULT: "#eef2e9",
          foreground: "#42594a",
        },
        border: "#0c342a",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#122922",
        },
      },
      boxShadow: {
        stamp: "0 8px 28px rgba(12,52,42,.08)",
        "stamp-sm": "0 4px 18px rgba(12,52,42,.08)",
        "stamp-lg": "0 14px 34px rgba(12,52,42,.12)",
        "stamp-oxblood": "0 8px 28px rgba(12,52,42,.08)",
      },
      maxWidth: {
        prose: "68ch",
        content: "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
