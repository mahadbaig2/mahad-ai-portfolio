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
        serif: ["var(--font-creato)", "Creato Display", "sans-serif"],
        headline: ["var(--font-creato)", "Creato Display", "sans-serif"],
        display: ["var(--font-creato)", "Creato Display", "sans-serif"],
        sans: ["var(--font-creato)", "Creato Display", "sans-serif"],
        body: ["var(--font-creato)", "Creato Display", "sans-serif"],
        mono: ["var(--font-creato)", "Creato Display", "sans-serif"],
        label: ["var(--font-creato)", "Creato Display", "sans-serif"],
      },
      colors: {
        paper: "#F7F8F5",
        background: "#F7F8F5",
        foreground: "#17211C",
        "surface-white": "#FFFFFF",
        surface: {
          DEFAULT: "#F7F8F5",
          bright: "#FFFEFA",
          dim: "#D1DDD5",
          variant: "#DAE5DD",
          "container-lowest": "#FFFFFF",
          "container-low": "#EAF3ED",
          container: "#E5F1E8",
          "container-high": "#DFEBE3",
          "container-highest": "#DAE5DD",
        },
        primary: {
          DEFAULT: "#003C2B",
          fixed: "#B1F0D5",
          "fixed-dim": "#96D3B9",
          container: "#145440",
        },
        secondary: {
          DEFAULT: "#2D6954",
          container: "#DCEBE2",
          fixed: "#BEEDD8",
          "fixed-dim": "#A2D0BD",
        },
        tertiary: {
          DEFAULT: "#003B2B",
          container: "#0E5440",
          fixed: "#AFF0D5",
          "fixed-dim": "#93D4B9",
        },
        charcoal: "#101713",
        "charcoal-gutter": "#101713",
        "inverse-surface": "#28332D",
        "inverse-on-surface": "#E8F4EB",
        "on-surface": "#17211C",
        "on-surface-variant": "#404944",
        "on-primary": "#FFFFFF",
        "on-primary-container": "#DCEBE2",
        "on-secondary": "#FFFFFF",
        "on-secondary-container": "#0B3A2C",
        "on-tertiary": "#FFFFFF",
        "on-tertiary-container": "#DCEBE2",
        "on-secondary-fixed": "#002117",
        sage: "#DCEBE2",
        mint: "#EAF3ED",
        jade: "#6FAE95",
        hairline: "#C8D3CA",
        outline: {
          DEFAULT: "#54645B",
          variant: "#C8D3CA",
        },
        warning: "#8A5A12",
        error: {
          DEFAULT: "#A23838",
          container: "#FFDAD6",
        },
        destructive: {
          DEFAULT: "#A23838",
          foreground: "#FFFFFF",
        },
        "on-error": "#FFFFFF",
        "on-error-container": "#93000A",
        muted: {
          DEFAULT: "#EAF3ED",
          foreground: "#4F5F56",
        },
        "muted-text": "#4F5F56",
        border: "#C8D3CA",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#17211C",
        },
      },
      boxShadow: {
        "editorial-sm": "0 1px 4px rgba(16, 23, 19, 0.04)",
        editorial: "0 4px 20px rgba(16, 23, 19, 0.06)",
        widget: "0 8px 30px rgba(16, 23, 19, 0.10)",
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
