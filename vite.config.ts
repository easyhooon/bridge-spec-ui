import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

const rootDir = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(rootDir, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
      cssFileName: "styles",
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "zod"],
    },
  },
})
