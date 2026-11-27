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
        serif: ["var(--font-chivo)", "sans-serif"],
        headline: ["var(--font-chivo)", "sans-serif"],
        display: ["var(--font-chivo)", "sans-serif"],
        sans: ["var(--font-hanken-grotesk)", "system-ui", "sans-serif"],
        body: ["var(--font-hanken-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        label: ["var(--font-jetbrains-mono)", "monospace"],
      },
      colors: {
        paper: "#FCF9F2",
        background: "#FCF9F2",
        foreground: "#1C1C18",
        "surface-white": "#FFFFFF",
        surface: {
          DEFAULT: "#FCF9F2",
          bright: "#FCF9F2",
          dim: "#DCDAD3",
          variant: "#E5E2DB",
          "container-lowest": "#FFFFFF",
          "container-low": "#F6F3EC",
          container: "#F1EEE7",
          "container-high": "#EBE8E1",
          "container-highest": "#E5E2DB",
        },
        primary: {
          DEFAULT: "#000000",
          fixed: "#E5E2DE",
          "fixed-dim": "#C9C6C2",
          container: "#1C1C19",
        },
        secondary: {
          DEFAULT: "#416654",
          container: "#E5E2DB",
          fixed: "#C3ECD4",
          "fixed-dim": "#A8D0B9",
        },
        tertiary: {
          DEFAULT: "#000000",
          container: "#360D11",
          fixed: "#FFDADA",
          "fixed-dim": "#FDB4B5",
        },
        charcoal: "#1C1C19",
        "charcoal-gutter": "#1C1C19",
        "inverse-surface": "#302F2C",
        "inverse-on-surface": "#F1EEE7",
        "on-surface": "#1C1C18",
        "on-surface-variant": "#474741",
        "on-primary": "#FFFFFF",
        "on-primary-container": "#E5E2DB",
        "on-secondary": "#FFFFFF",
        "on-secondary-container": "#274738",
        "on-tertiary": "#FFFFFF",
        "on-tertiary-container": "#E5E2DB",
        "on-secondary-fixed": "#183126",
        sage: "#E5E2DB",
        mint: "#F6F3EC",
        jade: "#787770",
        hairline: "#C8C7BE",
        outline: {
          DEFAULT: "#6C6B65",
          variant: "#C8C7BE",
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
          DEFAULT: "#F6F3EC",
          foreground: "#474741",
        },
        "muted-text": "#474741",
        border: "#C8C7BE",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1C1C18",
        },
      },
      boxShadow: {
        stamp: "3px 3px 0 #000",
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
