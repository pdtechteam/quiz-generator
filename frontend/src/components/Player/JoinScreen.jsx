import { useState, useEffect } from 'react'

function JoinScreen({ onJoin, initialCode = '' }) {
  const [sessionCode, setSessionCode] = useState(initialCode)
  const [playerName, setPlayerName] = useState('')

  useEffect(() => {
    if (initialCode) {
      setSessionCode(initialCode)
    }
  }, [initialCode])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (sessionCode.length === 4 && playerName.trim()) {
      onJoin(sessionCode, playerName.trim())
    }
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Присоединиться к игре
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Код сессии
            </label>
            <input
              type="text"
              placeholder="1234"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              maxLength={4}
              className="w-full px-6 py-4 text-3xl text-center font-mono border-4 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Твоё имя
            </label>
            <input
              type="text"
              placeholder="Введи имя"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="w-full px-6 py-4 text-xl border-4 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={sessionCode.length !== 4 || !playerName.trim()}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl text-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Войти в игру
          </button>
        </form>
      </div>
    </div>
  )
}

export default JoinScreen