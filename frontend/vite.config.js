import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // base is only set during production build for GitHub Pages, but should be '/' on Vercel
  base: (command === 'build' && !process.env.VERCEL) ? '/pragyantra-HC21-HC-2/' : '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
}))
