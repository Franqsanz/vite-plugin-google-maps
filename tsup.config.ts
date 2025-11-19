import { defineConfig } from "tsup";
import fs from "node:fs";
import path from "node:path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,

  onSuccess: async () => {
    const src = path.resolve("src/types.d.ts");
    const dest = path.resolve("dist/types.d.ts");

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log("📦 Copiado types.d.ts → dist/");
    }
  }
});
