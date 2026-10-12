import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import seoBuild from './scripts/seo-build.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), seoBuild()],
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
})
