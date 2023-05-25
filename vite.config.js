import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/dist-vue",
  resolve: {
    alias: {
      "@": path.resolve("./src"),
    },
  },
  build: {
    outDir: "dist-vue",
    rollupOptions: {
      output: {
        chunkFileNames: "assets/js/[name].js",
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name?.split(".").at(1) ?? "";
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = "img";
          }
          return `assets/${extType}/[name][extname]`;
        },
        entryFileNames: "assets/js/[name].js",
      },
    },
  },
})
