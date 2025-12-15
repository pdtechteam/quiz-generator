import { useState } from 'react'
import { Pause, Play, SkipForward, Square, ChevronUp, ChevronDown } from 'lucide-react'

function HostControls({ ws, canSkip = false }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent
                  backdrop-blur-xl border-t border-yellow-500/50 shadow-2xl z-50">
      <div className="p-4 max-w-4xl mx-auto">
        {/* Toggle button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500
                   hover:from-yellow-600 hover:to-orange-600 text-white rounded-2xl
                   text-xl font-bold transition-all duration-200 shadow-lg shadow-yellow-500/50
                   flex items-center justify-center gap-3 group"
        >
          <span className="text-2xl">👑</span>
          <span>Управление ведущего</span>
          {showMenu ? (
            <ChevronDown size={24} className="group-hover:translate-y-1 transition-transform" />
          ) : (
            <ChevronUp size={24} className="group-hover:-translate-y-1 transition-transform" />
          )}
        </button>

        {/* Control buttons */}
        {showMenu && (
          <div className="mt-4 grid grid-cols-2 gap-3 animate-slideUp">
            {/* Pause */}
            <button
              onClick={() => ws?.pauseGame()}
              className="py-4 bg-gradient-to-r from-orange-500 to-red-500
                       hover:from-orange-600 hover:to-red-600 text-white rounded-xl
                       font-bold text-lg transition-all duration-200 shadow-lg
                       shadow-orange-500/50 flex items-center justify-center gap-2 group"
            >
              <Pause size={20} className="group-hover:scale-110 transition-transform" />
              Пауза
            </button>

            {/* Skip (if allowed) */}
            {canSkip && (
              <button
                onClick={() => {
                  if (confirm('Пропустить вопрос? Никому не начислятся баллы')) {
                    ws?.skipQuestion()
                  }
                }}
                className="py-4 bg-gradient-to-r from-blue-500 to-cyan-500
                         hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl
                         font-bold text-lg transition-all duration-200 shadow-lg
                         shadow-blue-500/50 flex items-center justify-center gap-2 group"
              >
                <SkipForward size={20} className="group-hover:translate-x-1 transition-transform" />
                Пропустить
              </button>
            )}

            {/* Next Question */}
            <button
              onClick={() => ws?.nextQuestion()}
              className="py-4 bg-gradient-to-r from-green-500 to-emerald-500
                       hover:from-green-600 hover:to-emerald-600 text-white rounded-xl
                       font-bold text-lg transition-all duration-200 shadow-lg
                       shadow-green-500/50 flex items-center justify-center gap-2 group"
            >
              <Play size={20} className="group-hover:translate-x-1 transition-transform" />
              Далее
            </button>

            {/* End Game */}
            <button
              onClick={() => {
                if (confirm('Завершить игру досрочно?')) {
                  ws?.endGame()
                }
              }}
              className="py-4 bg-gradient-to-r from-red-500 to-pink-500
                       hover:from-red-600 hover:to-pink-600 text-white rounded-xl
                       font-bold text-lg transition-all duration-200 shadow-lg
                       shadow-red-500/50 flex items-center justify-center gap-2 group"
            >
              <Square size={20} className="group-hover:scale-110 transition-transform" />
              Завершить
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HostControls