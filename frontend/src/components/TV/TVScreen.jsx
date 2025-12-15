import { useState, useEffect } from 'react'
import GameWebSocket from '../../utils/websocket'
import StartScreen from './StartScreen'
import AdminPanel from '../Admin/AdminPanel'
import LobbyScreen from './LobbyScreen'
import QuestionScreen from './QuestionScreen'
import ResultScreen from './ResultScreen'
import FinalScreen from './FinalScreen'

function TVScreen() {
  const [currentView, setCurrentView] = useState('start')
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

  // ✅ ИСПРАВЛЕНИЕ: Условный overflow в зависимости от view
  const containerClass = currentView === 'admin'
    ? 'w-screen h-screen overflow-y-auto'
    : 'w-screen h-screen overflow-hidden';

  return (
    <div className={containerClass}>
      {/* ☝️ ИЗМЕНЕНО: Используем динамический className
          - Для admin: overflow-y-auto (можно прокручивать)
          - Для остальных: overflow-hidden (нельзя, для полноэкранных view)
      */}

      {currentView === 'start' && (
        <StartScreen 
          onSelectAdmin={() => setCurrentView('admin')}
          onSelectGame={handleStartGame}
        />
      )}
      
      {currentView === 'admin' && (
        <AdminPanel onBack={() => setCurrentView('start')} />
      )}
      
      {currentView === 'lobby' && (
        <LobbyScreen 
          sessionCode={sessionCode}
          players={gameState.players}
        />
      )}
      
      {currentView === 'question' && (
        <QuestionScreen 
          question={gameState.currentQuestion}
          players={gameState.players}
          gameState={gameState}
        />
      )}
      
      {currentView === 'result' && (
        <ResultScreen 
          question={gameState.currentQuestion}
          leaderboard={gameState.leaderboard}
        />
      )}
      
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