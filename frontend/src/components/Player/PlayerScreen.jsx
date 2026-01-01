import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import GameWebSocket from '../../utils/websocket'
import JoinScreen from './JoinScreen'
import WaitingScreen from './WaitingScreen'
import QuestionScreen from './QuestionScreen'
import ResultScreen from './ResultScreen'
import HostControls from './HostControls'

function PlayerScreen({ onBackToWelcome }) {
  const [currentView, setCurrentView] = useState('join')
  const [playerData, setPlayerData] = useState(null)
  const [sessionCode, setSessionCode] = useState('')
  const [ws, setWs] = useState(null)
  const [gameState, setGameState] = useState({
    question: null,
    isHost: false,
    result: null
  })

  useEffect(() => {
    // Автозаполнение кода из URL
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      setSessionCode(code)
    }

    return () => {
      if (ws) {
        ws.disconnect()
      }
    }
  }, [ws])

  const handleJoin = (code, name) => {
    const websocket = new GameWebSocket(code)

    // Сначала устанавливаем ВСЕ обработчики
    websocket.on('connected', () => {
      console.log('✅ Player: Connected, joining as:', name)
      websocket.join(name)
    })

    websocket.on('player_joined', (data) => {
      console.log('✅ Player: Joined:', data)
      setPlayerData(data.player)
      setSessionCode(code)
      setCurrentView('waiting')
    })

    websocket.on('session_state', (data) => {
      console.log('📊 Player: Session state:', data)
      // Проверяем не стали ли мы ведущим
      if (playerData) {
        const myPlayer = data.players?.find(p => p.id === playerData.id)
        if (myPlayer?.is_host) {
          console.log('👑 Player: I am now host!')
          setGameState(prev => ({ ...prev, isHost: true }))
        }
      }
    })

    websocket.on('host_assigned', (data) => {
      console.log('👑 Player: Host assigned:', data)
      // Сравниваем по имени, т.к. playerData может быть ещё не установлен
      if (data.player.name === name) {
        console.log('👑 Player: I became host!')
        setGameState(prev => ({ ...prev, isHost: true }))
        setPlayerData(prev => ({ ...prev, is_host: true }))
      }
    })

    websocket.on('game_started', () => {
      console.log('🎮 Player: Game started')
      setCurrentView('question')
    })

    websocket.on('question', (data) => {
      console.log('❓ Player: Question:', data)
      setGameState(prev => ({ ...prev, question: data.question }))
      setCurrentView('question')
    })

    websocket.on('answer_received', (data) => {
      console.log('✓ Player: Answer received:', data)
      setGameState(prev => ({ ...prev, result: data }))
      setCurrentView('result')
    })

    websocket.on('game_over', () => {
      console.log('🏁 Player: Game over')
      setCurrentView('final')
    })

    websocket.on('error', (data) => {
      console.error('❌ Player: Error:', data)
      alert(`Ошибка: ${data.message}`)
    })

    // Теперь подключаемся
    websocket.connect()
    setWs(websocket)
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      {/* Back to Welcome button - shown on join screen */}
      {currentView === 'join' && onBackToWelcome && (
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={onBackToWelcome}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20
                     backdrop-blur-xl border border-white/20 rounded-xl transition-all
                     text-white font-semibold text-sm group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            На главную
          </button>
        </div>
      )}

      {currentView === 'join' && (
        <JoinScreen
          onJoin={handleJoin}
          initialCode={sessionCode}
        />
      )}

      {currentView === 'waiting' && (
        <WaitingScreen
          playerName={playerData?.name}
          sessionCode={sessionCode}
          isHost={gameState.isHost}
          onBecomeHost={() => {
            console.log('🎯 Becoming host...')
            ws?.becomeHost()
          }}
          onStartGame={() => {
            console.log('🎯 Starting game...')
            ws?.startGame()
          }}
        />
      )}

      {currentView === 'question' && (
        <>
          <QuestionScreen
            question={gameState.question}
            onAnswer={(choiceId, timeTaken) => {
              console.log('🎯 Answering:', choiceId, timeTaken)
              ws?.answer(gameState.question.uuid, choiceId, timeTaken)
            }}
          />
          {gameState.isHost && (
            <HostControls
              ws={ws}
              canSkip={true}
            />
          )}
        </>
      )}

      {currentView === 'result' && (
        <ResultScreen
          result={gameState.result}
          playerName={playerData?.name}
        />
      )}

      {currentView === 'final' && (
        <div className="w-screen h-screen bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white p-6">
          <div className="text-center px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 sm:mb-8 break-words">
              🎉 Игра окончена! 🎉
            </h1>
            <p className="text-2xl sm:text-3xl break-words">
              Спасибо за игру, {playerData?.name}!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayerScreen