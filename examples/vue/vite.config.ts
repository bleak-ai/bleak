import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  },
  resolve: {
    extensions: [".ts", ".vue", ".js"],
    alias: {
      vue: "vue/dist/vue.esm-bundler.js"
    }
  }
});
