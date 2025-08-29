import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {reactScopedCssPlugin} from "rollup-plugin-react-scoped-css";
import wasm from "vite-plugin-wasm";

// https://vitejs.dev/config/
export default defineConfig({
    // @ts-ignore
    plugins: [react(), reactScopedCssPlugin(), wasm()],
    envDir: "env",
    envPrefix: "PUB_",
});
