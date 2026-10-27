import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "tsup";

const root = import.meta.dirname;

export default defineConfig({
  entry: ["src/latch/index.ts"],
  format: ["cjs"],
  dts: false,
  clean: true,
  splitting: false,
  treeshake: true,
  sourcemap: false,
  target: "es2022",
  outDir: "dist/cjs",
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
  external: ["react", "react-dom", "react/jsx-runtime"],
  esbuildOptions(options) {
    options.alias = {
      "@": path.resolve(root, "src"),
    };
  },
  async onSuccess() {
    // esbuild drops the directive while bundling. Next.js needs it on the file.
    const file = path.resolve(root, "dist/cjs/index.cjs");
    const source = readFileSync(file, "utf8");
    if (!source.startsWith('"use client"') && !source.startsWith("'use client'")) {
      writeFileSync(file, `"use client";\n${source}`);
    }
  },
});
