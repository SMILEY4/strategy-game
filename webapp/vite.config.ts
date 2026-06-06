import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
      "@app": "/src/app",
      "@ui": "/src/ui",
      "@renderer": "/src/renderer",
      "@modules": "/src/modules",
    }
  }
})
