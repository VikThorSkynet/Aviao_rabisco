import { defineConfig } from "vite";
export default defineConfig({
  build: {
    target: "es2020",
    lib: {
      entry: "src/main.js",
      name: "Rabisco",
      formats: ["iife"],
      fileName: () => "app.js",
    },
    cssCodeSplit: false,
    assetsInlineLimit: 10000000,
    sourcemap: false,
  },
  worker: { format: "iife" },
});
