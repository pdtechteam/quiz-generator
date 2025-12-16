import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import GameWebSocket from '../../utils/websocket'
import JoinScreen from './JoinScreen'
import WaitingScreen from './WaitingScreen'
import QuestionScreen from './QuestionScreen'
import ResultScreen from './ResultScreen'

function PlayerScreen({ onBackToWelcome }) {
  const [ws, setWs] = useState(null)
  const [currentView, setCurrentView] = useState('join') // join | waiting | question | result | final
  const [playerData, setPlayerData] = useState(null)

  useEffect(() => {
    return () => {
      if (ws) {
        ws.disconnect()
      }
    }
  }, [ws])

  const handleJoin = (sessionCode, playerName) => {
    const websocket = new GameWebSocket(sessionCode, playerName, true)

    websocket.on('player_joined', (data) => {
      console.log('👤 Player: Joined as:', data.player)
      setPlayerData(data.player)
      setCurrentView('waiting')
    })

    websocket.on('game_started', () => {
      console.log('🎮 Player: Game started')
      setCurrentView('question')
    })

    websocket.on('question', (data) => {
      console.log('❓ Player: New question:', data.question)
      setCurrentView('question')
    })

    websocket.on('question_result', (data) => {
      console.log('📈 Player: Result:', data)
      setCurrentView('result')
    })

    websocket.on('game_over', (data) => {
      console.log('🏁 Player: Game over:', data)
      setCurrentView('final')
    })

    websocket.on('error', (data) => {
      console.error('❌ Player: Error:', data)
      alert(data.error || 'Произошла ошибка')
      setCurrentView('join')
    })

    websocket.connect()
    setWs(websocket)
  }

  return (
    <div className="relative">
      {/* Back to Welcome button - shown on join screen */}
      {currentView === 'join' && (
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
        <JoinScreen onJoin={handleJoin} />
      )}

      {currentView === 'waiting' && (
        <WaitingScreen playerData={playerData} />
      )}

      {currentView === 'question' && (
        <QuestionScreen ws={ws} />
      )}

      {currentView === 'result' && (
        <ResultScreen ws={ws} />
      )}

      {currentView === 'final' && (
        <div className="w-screen h-screen bg-gradient-to-br from-yellow-500 to-orange-500
                      flex items-center justify-center text-white p-6">
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