import { Trophy, Star, Medal, ArrowLeft } from 'lucide-react'

function FinalScreen({ leaderboard, awards, onBackToMenu }) {
  console.log('🏁 FinalScreen rendered')
  console.log('Leaderboard:', leaderboard)
  console.log('Awards:', awards)

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 text-white relative overflow-hidden flex flex-col">
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

      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(360deg); }
        }
        @keyframes riseUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Back button */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20
                   backdrop-blur-xl border border-white/20 rounded-2xl transition-all
                   text-white font-semibold text-xl group"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          В меню
        </button>
      </div>

      {/* Header - ФИКСИРОВАННАЯ ВЫСОТА */}
      <div className="flex-shrink-0 relative z-10 text-center p-6 pt-20">
        <h1 className="text-8xl font-black mb-4 animate-bounce">
          🎉 Игра завершена! 🎉
        </h1>
        <div className="flex items-center justify-center gap-4">
          <Trophy className="text-yellow-400 animate-pulse" size={48} />
          <p className="text-5xl font-bold text-yellow-400">Поздравляем победителей!</p>
          <Trophy className="text-yellow-400 animate-pulse" size={48} />
        </div>
      </div>

      {/* Content - ГИБКАЯ ВЫСОТА */}
      <div className="flex-1 relative z-10 flex gap-6 px-6 pb-6 min-h-0">

        {/* ЛЕВАЯ ЧАСТЬ - Подиум топ-3 (50%) */}
        <div className="w-1/2 flex flex-col">
          {leaderboard && leaderboard.length > 0 ? (
            <div className="flex-1 flex items-end justify-center gap-6">
              {/* 2nd place */}
              {leaderboard[1] && (
                <div
                  className="flex flex-col items-center"
                  style={{ animation: 'riseUp 1s ease-out 0.3s both' }}
                >
                  <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-3xl p-6 mb-3 shadow-2xl">
                    <div className="text-7xl mb-3">🥈</div>
                    <p className="text-4xl font-black mb-2 text-center break-words max-w-[200px]">
                      {leaderboard[1].name}
                    </p>
                    <p className="text-5xl font-mono font-black text-yellow-300 text-center">
                      {leaderboard[1].score}
                    </p>
                  </div>
                  <div className="w-48 h-32 bg-gradient-to-t from-gray-400 to-gray-500 rounded-t-3xl
                                flex items-center justify-center shadow-2xl">
                    <span className="text-7xl font-black text-white/50">2</span>
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
                    <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 mb-3
                                  shadow-2xl shadow-yellow-500/50">
                      <div className="text-8xl mb-3">👑</div>
                      <p className="text-5xl font-black mb-2 text-center break-words max-w-[220px]">
                        {leaderboard[0].name}
                      </p>
                      <p className="text-6xl font-mono font-black text-white text-center">
                        {leaderboard[0].score}
                      </p>
                    </div>
                  </div>
                  <div className="w-48 h-48 bg-gradient-to-t from-yellow-500 to-orange-500 rounded-t-3xl
                                flex items-center justify-center shadow-2xl shadow-yellow-500/50">
                    <span className="text-8xl font-black text-white/50">1</span>
                  </div>
                </div>
              )}

              {/* 3rd place */}
              {leaderboard[2] && (
                <div
                  className="flex flex-col items-center"
                  style={{ animation: 'riseUp 1s ease-out 0.5s both' }}
                >
                  <div className="bg-gradient-to-br from-orange-600 to-yellow-700 rounded-3xl p-6 mb-3 shadow-2xl">
                    <div className="text-7xl mb-3">🥉</div>
                    <p className="text-4xl font-black mb-2 text-center break-words max-w-[200px]">
                      {leaderboard[2].name}
                    </p>
                    <p className="text-5xl font-mono font-black text-yellow-200 text-center">
                      {leaderboard[2].score}
                    </p>
                  </div>
                  <div className="w-48 h-24 bg-gradient-to-t from-orange-600 to-yellow-700 rounded-t-3xl
                                flex items-center justify-center shadow-2xl">
                    <span className="text-7xl font-black text-white/50">3</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl text-white/70 mb-4">Нет игроков</p>
                <p className="text-2xl text-white/50">Данные не получены</p>
              </div>
            </div>
          )}
        </div>

        {/* ПРАВАЯ ЧАСТЬ - Полный рейтинг (50%) */}
        <div className="w-1/2 flex flex-col gap-6">

          {/* Таблица лидеров */}
          <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 flex flex-col min-h-0">
            <div className="flex items-center gap-4 mb-6 flex-shrink-0">
              <Medal className="text-purple-400" size={48} />
              <h2 className="text-5xl font-bold">Полный рейтинг</h2>
            </div>

            {/* Список игроков - ПРОКРУЧИВАЕМЫЙ */}
            {leaderboard && leaderboard.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {leaderboard.map((player, idx) => (
                  <div
                    key={player.player_id || player.id || idx}
                    className="bg-white/10 rounded-xl px-6 py-4 flex items-center gap-4"
                    style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both` }}
                  >
                    <div className="text-4xl font-black w-16 text-center flex-shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-3xl font-bold truncate">{player.name}</p>
                    </div>
                    <div className="text-4xl font-black font-mono bg-black/30 px-4 py-2 rounded-lg flex-shrink-0">
                      {player.score}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-3xl text-white/50">Нет результатов</p>
              </div>
            )}
          </div>

          {/* Специальные награды */}
          {awards && Object.keys(awards).length > 0 && (
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Star className="text-yellow-400" size={40} />
                <h2 className="text-4xl font-black">Награды</h2>
                <Star className="text-yellow-400" size={40} />
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                {Object.entries(awards).map(([key, award], idx) => (
                  <div
                    key={key}
                    className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-xl
                             border border-white/20 rounded-xl p-6 text-center min-w-[200px]"
                    style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.2}s both` }}
                  >
                    <div className="text-6xl mb-3">{award.emoji}</div>
                    <p className="text-2xl font-bold mb-2">{award.name}</p>
                    <p className="text-base text-white/70">{award.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FinalScreen