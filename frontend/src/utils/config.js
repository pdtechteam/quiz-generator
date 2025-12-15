// ============================================================================
// ЕДИНЫЙ КОНФИГ ДЛЯ ВСЕГО ПРОЕКТА
// ============================================================================

const LOCAL_IP = '192.168.2.100'

export const API_CONFIG = {
  // HTTP API endpoint
  API_BASE_URL: `http://${LOCAL_IP}:8000/api`,

  // WebSocket endpoint
  WS_BASE_URL: `ws://${LOCAL_IP}:8000/ws`,

  // Для отображения QR кода
  APP_URL: `http://${LOCAL_IP}:5173`, // Vite dev server
}

export default API_CONFIG