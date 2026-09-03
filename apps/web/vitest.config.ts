import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    pool: "forks",
    include: ["__tests__/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "e2e/**"],
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
