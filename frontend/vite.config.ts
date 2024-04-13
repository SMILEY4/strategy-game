import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {reactScopedCssPlugin} from "rollup-plugin-react-scoped-css";


// https://vitejs.dev/config/
export default defineConfig({
    // @ts-ignore
    plugins: [react(), reactScopedCssPlugin()],
    envDir: "env",
    envPrefix: "PUB_",
});
