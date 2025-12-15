import { API_CONFIG } from './config'

class API {
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.API_BASE_URL}${endpoint}`

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Квизы
  async getQuizzes() {
    return this.request('/quizzes/')
  }

  async getQuiz(id) {
    return this.request(`/quizzes/${id}/`)
  }

  async createQuiz(data) {
    return this.request('/quizzes/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async generateQuiz(topic, count, description = '', timePerQuestion = 20, playerCount = 1) {
    return this.request('/quizzes/generate/', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        count,
        description,
        time_per_question: timePerQuestion,
        player_count: playerCount,
      }),
    })
  }

  // Сессии
  async getSessions() {
    return this.request('/sessions/')
  }

  async getSession(code) {
    return this.request(`/sessions/${code}/`)
  }

  async createSession(quizId) {
    return this.request('/sessions/', {
      method: 'POST',
      body: JSON.stringify({ quiz: quizId }),
    })
  }

  async getSessionState(code) {
    return this.request(`/sessions/${code}/state/`)
  }

  async getCurrentQuestion(code) {
    return this.request(`/sessions/${code}/current_question/`)
  }

  async getLeaderboard(code) {
    return this.request(`/sessions/${code}/leaderboard/`)
  }

  async getDisconnectedPlayers(code) {
    return this.request(`/sessions/${code}/disconnected_players/`)
  }

  // Игроки
  async joinSession(sessionCode, playerName) {
    return this.request('/players/', {
      method: 'POST',
      body: JSON.stringify({
        session_code: sessionCode,
        name: playerName,
      }),
    })
  }
}

const api = new API()
export default api