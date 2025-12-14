class GameWebSocket {
  constructor(sessionCode) {
    this.sessionCode = sessionCode
    this.ws = null
    this.listeners = {}
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.heartbeatInterval = null
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.hostname
    const port = import.meta.env.DEV ? '8000' : window.location.port

    // В dev режиме подключаемся к Django напрямую
    const wsUrl = `ws://192.168.2.100:8000/ws/game/${this.sessionCode}/` // ДЛЯ ЛОКАЛЬНОГО ДОСТУПА

    console.log('🔌 Connecting to:', wsUrl)
    
    this.ws = new WebSocket(wsUrl)
    
    this.ws.onopen = () => {
      console.log('✅ WebSocket connected')
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.emit('connected')
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
    
    this.ws.onclose = () => {
      console.log('🔌 WebSocket closed')
      this.stopHeartbeat()
      this.emit('disconnected')
      this.attemptReconnect()
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000)
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
      
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
      this.send('ping', {})
    }, 5000) // Каждые 5 секунд
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
      console.error('Cannot send message: WebSocket not connected')
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