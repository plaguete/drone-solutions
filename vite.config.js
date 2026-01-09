import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    // Adicione estas opções para Mac
    babel: {
      plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]]
    }
  })],
  server: {
    port: 3000,
    host: true, // Permite acesso externo
    open: true
  },
  build: {
    chunkSizeWarningLimit: 1600
  }
})