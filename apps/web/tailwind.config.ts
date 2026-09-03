import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#ffffff",
        foreground: "#0a0a0a",
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#666666",
        },
        border: "#e5e5e5",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0a0a0a",
        },
      },
      maxWidth: {
        prose: "68ch",
        content: "1100px",
      },
    },
  },
  plugins: [],
};

export default config;
