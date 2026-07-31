import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import {glsl} from "./plugins/vite-glsl.ts";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        wasm(),
        glsl(),
    ],
    resolve: {
        alias: {
            "@": "/src",
            "@app": "/src/app",
            "@pages": "/src/pages",
            "@renderer": "/src/renderer",
            "@modules": "/src/modules",
        },
    },
});
