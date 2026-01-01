import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Слушаем на всех интерфейсах (важно для внешнего доступа)
    port: 5173,
    strictPort: true,
    // Убрали proxy - фронт теперь напрямую обращается к quiz-back.dolgovst.keenetic.pro
    // или к 192.168.2.100:8000 в локальной сети (настроено в config.js)
  },
})