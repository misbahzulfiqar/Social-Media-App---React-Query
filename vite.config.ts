import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Root deployment on Vercel (and local preview) — avoid relative asset URLs.
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // LightningCSS chokes on some shadcn/Tailwind arbitrary values (e.g. --spacing(...)).
    // Disabling CSS minification keeps the build working while preserving all styles.
    cssMinify: false,
  },
})
