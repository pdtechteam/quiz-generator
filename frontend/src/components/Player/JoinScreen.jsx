import { useState, useEffect } from 'react'
import { LogIn, Sparkles } from 'lucide-react'

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
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-lg shadow-purple-500/50">
            <Sparkles className="text-white" size={40} />
          </div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            Quiz Game
          </h1>
          <p className="text-purple-300 text-lg">Присоединяйся к игре</p>
        </div>

        {/* Main card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-purple-500/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Code */}
            <div>
              <label className="block text-sm font-bold text-purple-200 mb-3 uppercase tracking-wide">
                Код сессии
              </label>
              <input
                type="text"
                placeholder="1234"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                maxLength={4}
                className="w-full px-6 py-4 text-4xl text-center font-mono font-bold
                         bg-white/10 border-2 border-white/20 rounded-2xl text-white
                         placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500
                         focus:border-transparent transition-all uppercase tracking-widest"
              />
            </div>

            {/* Player Name */}
            <div>
              <label className="block text-sm font-bold text-purple-200 mb-3 uppercase tracking-wide">
                Твоё имя
              </label>
              <input
                type="text"
                placeholder="Введи своё имя"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                className="w-full px-6 py-4 text-xl font-medium
                         bg-white/10 border-2 border-white/20 rounded-2xl text-white
                         placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500
                         focus:border-transparent transition-all"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={sessionCode.length !== 4 || !playerName.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500
                       hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500
                       disabled:to-gray-600 text-white rounded-2xl text-xl font-bold
                       transition-all duration-200 shadow-lg shadow-purple-500/50
                       disabled:shadow-none disabled:cursor-not-allowed
                       flex items-center justify-center gap-3 group"
            >
              <LogIn size={24} className="group-hover:translate-x-1 transition-transform" />
              Войти в игру
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center text-white/40 text-sm mt-6">
          Код сессии отображается на экране TV
        </p>
      </div>
    </div>
  )
}

export default JoinScreen