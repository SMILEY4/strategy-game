import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import {glsl} from "./plugins/vite-glsl.ts";
import checker from "vite-plugin-checker";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        wasm(),
        glsl(),
        checker({
            typescript: {
                tsconfigPath: "./tsconfig.app.json"
            },
            overlay: {
                initialIsOpen: true
            }
        }),
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
