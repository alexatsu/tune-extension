import tailwindcss from "@tailwindcss/vite"
import { defineConfig, type WxtViteConfig } from "wxt"

export default defineConfig({
  outDir: "dist",
  modules: ["@wxt-dev/module-react"],
  webExt: {
    disabled: true,
  },
  vite: () =>
    ({
      plugins: [tailwindcss()],
    }) as WxtViteConfig,
  manifest: {
    permissions: ["tabs", "activeTab", "storage"],
  },
  debug: true,
})
