// ============================================================================
// ЕДИНЫЙ КОНФИГ ДЛЯ ВСЕГО ПРОЕКТА
// ============================================================================

const getConfig = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol; // 'http:' или 'https:'
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

  // Определяем, откуда открыто приложение
  const isLocal = hostname === 'localhost' ||
                  hostname === '127.0.0.1' ||
                  hostname === '192.168.2.100';

  if (isLocal) {
    // Локальная сеть - всегда используем HTTP
    return {
      apiBaseUrl: 'http://192.168.2.100:8000/api',
      wsBaseUrl: 'ws://192.168.2.100:8000/ws',
      appUrl: 'http://192.168.2.100:5173'
    };
  } else {
    // Внешний домен - используем тот же протокол, что и текущая страница
    // Это решает проблему Mixed Content (HTTP/HTTPS)
    return {
      apiBaseUrl: `${protocol}//quiz-back.dolgovst.keenetic.pro/api`,
      wsBaseUrl: `${wsProtocol}//quiz-back.dolgovst.keenetic.pro/ws`,
      appUrl: `${protocol}//quiz.dolgovst.keenetic.pro`
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
  isLocal: window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '192.168.2.100',
  API_BASE_URL: API_CONFIG.API_BASE_URL,
  WS_BASE_URL: API_CONFIG.WS_BASE_URL,
  APP_URL: API_CONFIG.APP_URL,
});

export default API_CONFIG;