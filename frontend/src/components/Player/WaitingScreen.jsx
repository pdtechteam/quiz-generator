import { Crown, Play, Users, Loader } from 'lucide-react'

function WaitingScreen({ playerName, sessionCode, isHost, onBecomeHost, onStartGame }) {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Greeting */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-white mb-4">
            Привет, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{playerName}</span>! 👋
          </h1>
          <p className="text-xl text-white/60">Приготовься к игре</p>
        </div>

        {/* Main status card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 mb-6 shadow-2xl shadow-indigo-500/10">
          {/* Spinner */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Loader className="text-cyan-400 animate-spin" size={80} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Users className="text-white" size={40} />
              </div>
            </div>
          </div>

          {/* Status text */}
          <div className="text-center space-y-3">
            <p className="text-3xl font-bold text-white">
              Ожидаем начала игры...
            </p>
            <div className="flex items-center justify-center gap-2 text-cyan-300">
              <span className="text-lg">Код сессии:</span>
              <span className="text-3xl font-mono font-black tracking-widest px-4 py-2 bg-white/10 rounded-xl">
                {sessionCode}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {!isHost ? (
          <button
            onClick={onBecomeHost}
            className="w-full px-8 py-5 bg-gradient-to-r from-yellow-500 to-orange-500
                     hover:from-yellow-600 hover:to-orange-600 text-white rounded-2xl
                     text-2xl font-bold transition-all duration-200 shadow-lg
                     shadow-yellow-500/50 flex items-center justify-center gap-3 group"
          >
            <Crown size={28} className="group-hover:rotate-12 transition-transform" />
            Стать ведущим
          </button>
        ) : (
          <div className="space-y-4">
            {/* Host badge */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl
                          border border-yellow-500/30 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Crown className="text-yellow-400" size={32} />
                <p className="text-3xl font-black text-white">Ты ведущий!</p>
              </div>
              <p className="text-white/60">У тебя есть кнопки управления игрой</p>
            </div>

            {/* Start button */}
            <button
              onClick={onStartGame}
              className="w-full px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-500
                       hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl
                       text-2xl font-bold transition-all duration-200 shadow-lg
                       shadow-green-500/50 flex items-center justify-center gap-3 group"
            >
              <Play size={28} className="group-hover:translate-x-1 transition-transform" />
              Начать игру
            </button>
          </div>
        )}

        {/* Hint */}
        <p className="text-center text-white/40 text-sm mt-6">
          Другие игроки могут присоединиться, используя код сессии
        </p>
      </div>
    </div>
  )
}

export default WaitingScreen