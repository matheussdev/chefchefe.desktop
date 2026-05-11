import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  root: path.resolve(__dirname, 'src/renderer'),

  resolve: {
    alias: {
      '@renderer': path.resolve(__dirname, 'src/renderer/src'),
      '@': path.resolve(__dirname, 'src/renderer/src')
    }
  },

  build: {
    outDir: path.resolve(__dirname, 'dist-web'),
    emptyOutDir: true
  }
})
