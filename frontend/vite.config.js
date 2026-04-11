import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_URL = process.env.VITE_API_URL || 'http://localhost:5000'

export default defineConfig({
  plugins: [react()],
  base: '/pragyantra-HC21-HC-2/',   // ← must match your GitHub repo name
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
  define: {
    __API_URL__: JSON.stringify(BACKEND_URL),
  },
})
