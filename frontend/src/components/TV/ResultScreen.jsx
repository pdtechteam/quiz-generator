import { useEffect } from 'react'
import { Trophy, Medal, Award, CheckCircle } from 'lucide-react'
import { playSound } from '../../utils/sounds'

function ResultScreen({ question, leaderboard }) {
  const podiumColors = [
    'from-yellow-500 to-orange-500',
    'from-gray-400 to-gray-500',
    'from-orange-600 to-yellow-700'
  ]

  const podiumEmojis = ['🥇', '🥈', '🥉']

  // ✅ ДОБАВЛЕНО: Звук при появлении результатов
  useEffect(() => {
    console.log('📊 TV Result: Showing results')
    playSound('reveal')
  }, [])

  // ✅ ИСПРАВЛЕНО: Получаем правильный ответ из question
  const correctChoice = question?.choices?.find(c => c.is_correct)

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-12 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-green-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Trophy className="text-yellow-400" size={80} />
            <h1 className="text-8xl font-black">Результаты</h1>
          </div>
        </div>

        <div className="flex-1 flex gap-8">
          {/* ✅ ИСПРАВЛЕНО: Показываем правильный ответ */}
          {question && correctChoice && (
            <div className="flex-1">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <CheckCircle className="text-green-400" size={48} />
                  <h2 className="text-5xl font-bold">Правильный ответ:</h2>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-12 shadow-2xl animate-pulse">
                  <p className="text-6xl font-black text-center leading-tight">
                    ✓ {correctChoice.text}
                  </p>
                </div>

                {question.explanation && (
                  <div className="mt-8 bg-white/5 rounded-2xl p-6">
                    <p className="text-2xl text-white/80 leading-relaxed">
                      💡 {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 h-full">
              <div className="flex items-center gap-4 mb-8">
                <Medal className="text-purple-400" size={48} />
                <h2 className="text-5xl font-bold">Таблица лидеров</h2>
              </div>

              <div className="space-y-4">
                {leaderboard?.slice(0, 5).map((player, idx) => (
                  <div
                    key={player.player_id}
                    className={`relative overflow-hidden rounded-2xl transition-all transform hover:scale-[1.02]
                      ${idx < 3 ? 'shadow-2xl' : 'shadow-lg'}`}
                    style={{
                      animation: `slideIn 0.5s ease-out ${idx * 0.1}s both`
                    }}
                  >
                    {/* Background gradient for top 3 */}
                    {idx < 3 && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${podiumColors[idx]} opacity-90`} />
                    )}
                    {idx >= 3 && (
                      <div className="absolute inset-0 bg-white/10" />
                    )}

                    {/* Content */}
                    <div className="relative px-8 py-6 flex items-center gap-6">
                      {/* Rank */}
                      <div className="text-6xl font-black w-20 text-center">
                        {idx < 3 ? podiumEmojis[idx] : `#${idx + 1}`}
                      </div>

                      {/* Name */}
                      <div className="flex-1">
                        <p className="text-4xl font-bold truncate">
                          {player.name}
                        </p>
                      </div>

                      {/* Score */}
                      <div className="text-5xl font-black font-mono bg-black/20 px-6 py-2 rounded-xl">
                        {player.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultScreen