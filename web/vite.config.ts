import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import { resolve } from "path"

export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  server: { port: 7242 },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
})
