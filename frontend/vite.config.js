import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      // Проксируем API запросы к Django
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      // Проксируем WebSocket
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
      },
    },
  },
})