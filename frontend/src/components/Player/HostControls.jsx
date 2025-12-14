import { useState } from 'react'

function HostControls({ ws, canSkip = false }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-50 backdrop-blur-lg border-t-4 border-yellow-500">
      <div className="p-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-full py-3 bg-yellow-500 text-white rounded-xl text-lg font-bold hover:bg-yellow-600 transition-colors"
        >
          👑 Управление ведущего {showMenu ? '▼' : '▲'}
        </button>

        {showMenu && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => ws?.pauseGame()}
              className="py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              ⏸️ Пауза
            </button>

            {canSkip && (
              <button
                onClick={() => {
                  if (confirm('Пропустить вопрос? Никому не начислятся баллы')) {
                    ws?.skipQuestion()
                  }
                }}
                className="py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
              >
                ⏭️ Пропустить
              </button>
            )}

            <button
              onClick={() => ws?.nextQuestion()}
              className="py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              ➡️ Далее
            </button>

            <button
              onClick={() => {
                if (confirm('Завершить игру досрочно?')) {
                  ws?.endGame()
                }
              }}
              className="py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
            >
              ⏹️ Завершить
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HostControls