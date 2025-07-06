import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.js')
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src')
    }
  }
})
