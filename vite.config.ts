import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  build: {
    rollupOptions: {
      output: {
        // Vendors change far less often than app code; splitting them keeps the
        // long-lived cache entries stable across deploys.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          'firebase-auth': ['firebase/app', 'firebase/auth'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        },
      },
    },
  },
})
