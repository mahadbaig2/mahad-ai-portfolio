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
        headline: ["var(--font-chivo)", "sans-serif"],
        sans: ["var(--font-hanken-grotesk)", "system-ui", "sans-serif"],
        body: ["var(--font-hanken-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        label: ["var(--font-jetbrains-mono)", "monospace"],
      },
      colors: {
        background: "#fcf9f2",
        foreground: "#1c1c18",
        primary: {
          DEFAULT: "#000000",
          fixed: "#e5e2de",
          "fixed-dim": "#c9c6c2",
          container: "#1c1c19",
        },
        surface: {
          DEFAULT: "#fcf9f2",
          bright: "#fcf9f2",
          dim: "#dcdad3",
          variant: "#e5e2db",
          "container-lowest": "#ffffff",
          "container-low": "#f6f3ec",
          container: "#f1eee7",
          "container-high": "#ebe8e1",
          "container-highest": "#e5e2db",
        },
        secondary: {
          DEFAULT: "#416654",
          container: "#c3ecd4",
          fixed: "#c3ecd4",
          "fixed-dim": "#a8d0b9",
        },
        tertiary: {
          DEFAULT: "#000000",
          container: "#360d11",
          fixed: "#ffdada",
          "fixed-dim": "#fdb4b5",
        },
        "on-surface": "#1c1c18",
        "on-surface-variant": "#474741",
        "on-primary": "#ffffff",
        "on-primary-container": "#858480",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#476c59",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#b27375",
        outline: {
          DEFAULT: "#575651",
          variant: "#c8c7be",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        muted: {
          DEFAULT: "#f1eee7",
          foreground: "#474741",
        },
        border: "#000000",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1c1c18",
        },
      },
      boxShadow: {
        stamp: "3px 3px 0px 0px #000000",
        "stamp-sm": "2px 2px 0px 0px #000000",
        "stamp-lg": "5px 5px 0px 0px #000000",
        "stamp-oxblood": "3px 3px 0px 0px #360d11",
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
