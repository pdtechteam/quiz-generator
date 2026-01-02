import { API_CONFIG } from './config'

class GameWebSocket {
  constructor(sessionCode) {
    this.sessionCode = sessionCode
    this.ws = null
    this.listeners = {}
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10  // Увеличено с 5 до 10
    this.heartbeatInterval = null
    this.isIntentionalClose = false  // Флаг для отслеживания намеренного закрытия
  }

  connect() {
    const wsUrl = `${API_CONFIG.WS_BASE_URL}/game/${this.sessionCode}/`

    console.log('🔌 Connecting to:', wsUrl)

    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected')
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.emit('connected')

      // Если это переподключение, уведомляем об этом
      if (this.reconnectAttempts > 0) {
        this.emit('reconnected')
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📩 Received:', data.type, data)
        this.emit(data.type, data)
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
      this.emit('error', error)
    }

    this.ws.onclose = (event) => {
      console.log('🔌 WebSocket closed', event.code, event.reason)
      this.stopHeartbeat()

      // Не переподключаемся если закрытие было намеренным
      if (!this.isIntentionalClose) {
        this.emit('disconnected')
        this.attemptReconnect()
      }
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000)
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      // Уведомляем UI что мы переподключаемся
      this.emit('reconnecting', {
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        delay
      })

      setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      console.error('❌ Max reconnection attempts reached')
      this.emit('reconnect_failed')
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('ping', {})
      }
    }, 5000)
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  send(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }))
    } else {
      console.warn('⚠️ Cannot send message: WebSocket not connected (state:', this.ws?.readyState, ')')
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  }

  disconnect() {
    this.isIntentionalClose = true  // Помечаем как намеренное закрытие
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  // Методы для отправки игровых событий
  join(playerName) {
    this.send('join', { player_name: playerName })
  }

  becomeHost() {
    this.send('become_host', {})
  }

  startGame() {
    this.send('start_game', {})
  }

  answer(questionUuid, choiceId, timeTaken) {
    this.send('answer', {
      question_uuid: questionUuid,
      choice_id: choiceId,
      time_taken: timeTaken
    })
  }

  pauseGame() {
    this.send('pause_game', {})
  }

  resumeGame() {
    this.send('resume_game', {})
  }

  skipQuestion() {
    this.send('skip_question', {})
  }

  endGame() {
    this.send('end_game', {})
  }

  nextQuestion() {
    this.send('next_question', {})
  }

  sendReaction(emoji) {
    this.send('reaction', { emoji })
  }
}

export default GameWebSocket