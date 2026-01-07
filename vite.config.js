import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redireciona chamadas de /api para a função serverless localmente ou em produção
      '/api': {
        target: 'http://localhost:3001', // API server running on 3001
        changeOrigin: true,
      }
    }
  }
})