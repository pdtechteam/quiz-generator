import { Trophy, Star, Award, Zap } from 'lucide-react'

function FinalScreen({ leaderboard, awards }) {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 p-12 text-white relative overflow-hidden">
      {/* Confetti background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-yellow-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `confetti ${3 + Math.random() * 2}s ease-out ${Math.random()}s infinite`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col h-full text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-9xl font-black mb-6 animate-bounce">
            🎉 Игра завершена! 🎉
          </h1>
          <div className="flex items-center justify-center gap-4">
            <Trophy className="text-yellow-400 animate-pulse" size={60} />
            <p className="text-6xl font-bold text-yellow-400">Поздравляем победителей!</p>
            <Trophy className="text-yellow-400 animate-pulse" size={60} />
          </div>
        </div>

        {/* Podium - Top 3 */}
        {leaderboard && leaderboard.length > 0 && (
          <div className="flex-1 mb-12">
            <div className="flex items-end justify-center gap-8 h-full max-w-6xl mx-auto">
              {/* 2nd place */}
              {leaderboard[1] && (
                <div
                  className="flex flex-col items-center"
                  style={{ animation: 'riseUp 1s ease-out 0.3s both' }}
                >
                  <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-3xl p-8 mb-4 shadow-2xl
                                transform hover:scale-105 transition-transform">
                    <div className="text-8xl mb-4">🥈</div>
                    <p className="text-5xl font-black mb-2">{leaderboard[1].name}</p>
                    <p className="text-6xl font-mono font-black text-yellow-300">{leaderboard[1].score}</p>
                  </div>
                  <div className="w-64 h-48 bg-gradient-to-t from-gray-400 to-gray-500 rounded-t-3xl
                                flex items-center justify-center shadow-2xl">
                    <span className="text-8xl font-black text-white/50">2</span>
                  </div>
                </div>
              )}

              {/* 1st place */}
              {leaderboard[0] && (
                <div
                  className="flex flex-col items-center"
                  style={{ animation: 'riseUp 1s ease-out 0.1s both' }}
                >
                  <div className="relative">
                    <div className="absolute -inset-4 bg-yellow-400 rounded-full blur-2xl opacity-50 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-10 mb-4
                                  shadow-2xl shadow-yellow-500/50 transform hover:scale-105 transition-transform">
                      <div className="text-9xl mb-4">👑</div>
                      <p className="text-6xl font-black mb-2">{leaderboard[0].name}</p>
                      <p className="text-7xl font-mono font-black text-white">{leaderboard[0].score}</p>
                    </div>
                  </div>
                  <div className="w-64 h-64 bg-gradient-to-t from-yellow-500 to-orange-500 rounded-t-3xl
                                flex items-center justify-center shadow-2xl shadow-yellow-500/50">
                    <span className="text-9xl font-black text-white/50">1</span>
                  </div>
                </div>
              )}

              {/* 3rd place */}
              {leaderboard[2] && (
                <div
                  className="flex flex-col items-center"
                  style={{ animation: 'riseUp 1s ease-out 0.5s both' }}
                >
                  <div className="bg-gradient-to-br from-orange-600 to-yellow-700 rounded-3xl p-8 mb-4 shadow-2xl
                                transform hover:scale-105 transition-transform">
                    <div className="text-8xl mb-4">🥉</div>
                    <p className="text-5xl font-black mb-2">{leaderboard[2].name}</p>
                    <p className="text-6xl font-mono font-black text-yellow-200">{leaderboard[2].score}</p>
                  </div>
                  <div className="w-64 h-36 bg-gradient-to-t from-orange-600 to-yellow-700 rounded-t-3xl
                                flex items-center justify-center shadow-2xl">
                    <span className="text-8xl font-black text-white/50">3</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Special Awards */}
        {awards && Object.keys(awards).length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Star className="text-yellow-400" size={40} />
              <h2 className="text-5xl font-black">Специальные награды</h2>
              <Star className="text-yellow-400" size={40} />
            </div>

            <div className="flex gap-6 justify-center flex-wrap">
              {Object.entries(awards).map(([key, award], idx) => (
                <div
                  key={key}
                  className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-xl
                           border border-white/20 rounded-2xl p-6 text-center min-w-[250px]
                           transform hover:scale-105 transition-transform"
                  style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.2}s both` }}
                >
                  <div className="text-7xl mb-3">{award.emoji}</div>
                  <p className="text-3xl font-bold mb-2">{award.name}</p>
                  <p className="text-lg text-white/70">{award.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FinalScreen