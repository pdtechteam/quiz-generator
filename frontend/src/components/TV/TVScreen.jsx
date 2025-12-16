import { useState, useEffect } from 'react'
import { ArrowLeft, Settings, Play } from 'lucide-react'
import GameWebSocket from '../../utils/websocket'
import QuizSelectionScreen from './QuizSelectionScreen'
import AdminPanel from '../Admin/AdminPanel'
import LobbyScreen from './LobbyScreen'
import QuestionScreen from './QuestionScreen'
import ResultScreen from './ResultScreen'
import FinalScreen from './FinalScreen'

function TVScreen({ onBackToWelcome }) {
  const [currentView, setCurrentView] = useState('menu') // menu | quizSelection | admin | lobby | question | result | final
  const [sessionCode, setSessionCode] = useState(null)
  const [ws, setWs] = useState(null)
  const [gameState, setGameState] = useState({
    players: [],
    currentQuestion: null,
    leaderboard: [],
    state: 'waiting'
  })

  useEffect(() => {
    // Cleanup WebSocket on unmount
    return () => {
      if (ws) {
        ws.disconnect()
      }
    }
  }, [ws])

  const handleStartGame = (code) => {
    setSessionCode(code)
    setCurrentView('lobby')

    // Создаём WebSocket
    const websocket = new GameWebSocket(code)

    // Сначала устанавливаем ВСЕ обработчики, потом подключаемся
    websocket.on('session_state', (data) => {
      console.log('📊 TV: Session state:', data)
      setGameState(prev => ({
        ...prev,
        players: data.players || []
      }))
    })

    websocket.on('player_joined', (data) => {
      console.log('👤 TV: Player joined:', data)
      // Добавляем или обновляем игрока в списке
      setGameState(prev => {
        const existingIndex = prev.players.findIndex(p => p.id === data.player.id)
        if (existingIndex >= 0) {
          // Обновляем существующего
          const newPlayers = [...prev.players]
          newPlayers[existingIndex] = data.player
          return { ...prev, players: newPlayers }
        } else {
          // Добавляем нового
          return { ...prev, players: [...prev.players, data.player] }
        }
      })
    })

    websocket.on('host_assigned', (data) => {
      console.log('👑 TV: Host assigned:', data)
      // Помечаем игрока как ведущего
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p =>
          p.id === data.player.id ? { ...p, is_host: true } : p
        )
      }))
    })

    websocket.on('game_started', () => {
      console.log('🎮 TV: Game started')
      setCurrentView('question')
    })

    websocket.on('question', (data) => {
      console.log('❓ TV: Question:', data)
      setGameState(prev => ({ ...prev, currentQuestion: data.question }))
      setCurrentView('question')
    })

    websocket.on('answer_stats', (data) => {
      console.log('📊 TV: Answer stats:', data)
      setGameState(prev => ({
        ...prev,
        answeredCount: data.answered,
        correctCount: data.correct
      }))
    })

    websocket.on('question_result', (data) => {
      console.log('📈 TV: Result:', data)
      setGameState(prev => ({ ...prev, leaderboard: data.leaderboard }))
      setCurrentView('result')
    })

    websocket.on('game_over', (data) => {
      console.log('🏁 TV: Game over:', data)
      setGameState(prev => ({
        ...prev,
        leaderboard: data.final_leaderboard,
        awards: data.awards
      }))
      setCurrentView('final')
    })

    websocket.on('error', (data) => {
      console.error('❌ TV: Error:', data)
    })

    // Теперь подключаемся
    websocket.connect()
    setWs(websocket)
  }

  // Dynamic overflow based on view
  const containerClass = currentView === 'admin'
    ? 'w-screen h-screen overflow-y-auto'
    : 'w-screen h-screen overflow-hidden'

  return (
    <div className={containerClass}>
      {/* Menu Screen */}
      {currentView === 'menu' && (
        <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900
                      flex items-center justify-center p-12 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-purple-500 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative z-10 text-white text-center max-w-5xl w-full">
            {/* Back button */}
            <div className="absolute top-0 left-0">
              <button
                onClick={onBackToWelcome}
                className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20
                         backdrop-blur-xl border border-white/20 rounded-2xl transition-all
                         text-white font-semibold text-xl group"
              >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                На главную
              </button>
            </div>

            {/* Title */}
            <div className="mb-16 mt-20">
              <h1 className="text-8xl font-black mb-4 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                  Режим Хоста
                </span>
              </h1>
              <p className="text-3xl text-white/60">Выберите действие</p>
            </div>

            {/* Menu Options */}
            <div className="space-y-6">
              <button
                onClick={() => setCurrentView('quizSelection')}
                className="w-full px-12 py-8 bg-gradient-to-r from-purple-500 to-pink-500
                         hover:from-purple-600 hover:to-pink-600 text-white rounded-3xl
                         text-5xl font-black transition-all duration-200 shadow-2xl
                         shadow-purple-500/50 flex items-center justify-center gap-6 group"
              >
                <Play size={56} className="group-hover:scale-110 transition-transform" />
                Начать игру
              </button>

              <button
                onClick={() => setCurrentView('admin')}
                className="w-full px-12 py-8 bg-gradient-to-r from-yellow-500 to-orange-500
                         hover:from-yellow-600 hover:to-orange-600 text-white rounded-3xl
                         text-5xl font-black transition-all duration-200 shadow-2xl
                         shadow-yellow-500/50 flex items-center justify-center gap-6 group"
              >
                <Settings size={56} className="group-hover:rotate-180 transition-transform duration-500" />
                Администрирование
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Selection Screen */}
      {currentView === 'quizSelection' && (
        <QuizSelectionScreen
          onBack={() => setCurrentView('menu')}
          onSelectQuiz={handleStartGame}
        />
      )}

      {/* Admin Panel */}
      {currentView === 'admin' && (
        <AdminPanel onBack={() => setCurrentView('menu')} />
      )}

      {/* Lobby Screen */}
      {currentView === 'lobby' && (
        <LobbyScreen
          sessionCode={sessionCode}
          players={gameState.players}
        />
      )}

      {/* Question Screen */}
      {currentView === 'question' && (
        <QuestionScreen
          question={gameState.currentQuestion}
          players={gameState.players}
          gameState={gameState}
        />
      )}

      {/* Result Screen */}
      {currentView === 'result' && (
        <ResultScreen
          question={gameState.currentQuestion}
          leaderboard={gameState.leaderboard}
        />
      )}

      {/* Final Screen */}
      {currentView === 'final' && (
        <FinalScreen 
          leaderboard={gameState.leaderboard}
          awards={gameState.awards}
        />
      )}
    </div>
  )
}

export default TVScreen