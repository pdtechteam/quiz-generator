// ============================================================================
// ЕДИНЫЙ КОНФИГ ДЛЯ ВСЕГО ПРОЕКТА
// ============================================================================

const getConfig = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol; // 'http:' или 'https:'
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

  // Если открыто через порт 5173 - это прямой доступ к Vite
  const isDirect = window.location.port === '5173';

  if (isDirect) {
    // Прямой доступ к Vite - используем прямое подключение к портам
    return {
      apiBaseUrl: 'http://192.168.2.100:8000/api',
      wsBaseUrl: 'ws://192.168.2.100:8000/ws',
      appUrl: 'http://192.168.2.100:5173'
    };
  } else {
    // Через nginx (localhost:80 или quiz.dolgovst.keenetic.pro:80)
    // nginx сам маршрутизирует /api, /ws на нужные порты
    const baseUrl = `${protocol}//${hostname}`;
    return {
      apiBaseUrl: `${baseUrl}/api`,
      wsBaseUrl: `${wsProtocol}//${hostname}/ws`,
      appUrl: baseUrl
    };
  }
};

const config = getConfig();

export const API_CONFIG = {
  // HTTP API endpoint
  API_BASE_URL: config.apiBaseUrl,

  // WebSocket endpoint
  WS_BASE_URL: config.wsBaseUrl,

  // Для отображения QR кода
  APP_URL: config.appUrl,
};

// Для отладки - можно увидеть в консоли браузера
console.log('🔧 Quiz API Config:', {
  hostname: window.location.hostname,
  port: window.location.port,
  isDirect: window.location.port === '5173',
  API_BASE_URL: API_CONFIG.API_BASE_URL,
  WS_BASE_URL: API_CONFIG.WS_BASE_URL,
  APP_URL: API_CONFIG.APP_URL,
});

export default API_CONFIG;