import { useEffect } from 'react'
import { CheckCircle, XCircle, TrendingUp, Award } from 'lucide-react'
import { playSound } from '../../utils/sounds'

function ResultScreen({ result, playerName }) {
  useEffect(() => {
    if (result?.is_correct) {
      playSound('correct')
    } else {
      playSound('wrong')
    }
  }, [result])

  const isCorrect = result?.is_correct

  return (
    <div className={`w-screen h-screen flex items-center justify-center p-6 relative overflow-hidden
      ${isCorrect
        ? 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700'
        : 'bg-gradient-to-br from-red-600 via-pink-600 to-rose-700'
      }`}>
      {/* ☝️ ИЗМЕНЕНО: p-4 → p-6 для больших отступов */}

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 ${isCorrect ? 'bg-white' : 'bg-white/50'} rounded-full`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center text-white max-w-2xl w-full px-4">
        {/* ☝️ ДОБАВЛЕНО: px-4 для горизонтальных отступов */}

        {/* Icon with animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {isCorrect ? (
              <CheckCircle
                className="text-white drop-shadow-2xl animate-bounce"
                size={120}
                strokeWidth={3}
              />
            ) : (
              <XCircle
                className="text-white drop-shadow-2xl animate-bounce"
                size={120}
                strokeWidth={3}
              />
            )}
            <div className={`absolute inset-0 rounded-full ${isCorrect ? 'bg-green-400' : 'bg-red-400'}
                          opacity-20 blur-3xl animate-pulse`} />
          </div>
        </div>

        {/* Result text - адаптивный размер */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 drop-shadow-lg break-words">
          {/* ☝️ ИЗМЕНЕНО:
              - text-7xl → text-5xl sm:text-6xl md:text-7xl (адаптивный)
              - добавлен break-words чтобы длинные слова переносились
          */}
          {isCorrect ? 'Правильно!' : 'Неправильно'}
        </h1>

        {/* Reply message - тоже адаптивный */}
        {result?.reply && (
          <p className="text-xl sm:text-2xl md:text-3xl mb-10 opacity-90 font-medium leading-relaxed px-2">
            {/* ☝️ ИЗМЕНЕНО: text-3xl → text-xl sm:text-2xl md:text-3xl + px-2 */}
            {result.reply}
          </p>
        )}

        {/* Points earned */}
        {isCorrect && result?.points_earned && (
          <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-6 sm:p-8 mb-8
                        shadow-2xl transform hover:scale-105 transition-transform">
            {/* ☝️ ИЗМЕНЕНО: p-8 → p-6 sm:p-8 */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <Award className="text-yellow-300" size={32} />
              <p className="text-xl sm:text-2xl font-bold opacity-75">
                {/* ☝️ ИЗМЕНЕНО: text-2xl → text-xl sm:text-2xl */}
                Заработано очков
              </p>
            </div>
            <p className="text-6xl sm:text-7xl md:text-8xl font-black text-yellow-300 drop-shadow-lg">
              {/* ☝️ ИЗМЕНЕНО: text-8xl → text-6xl sm:text-7xl md:text-8xl */}
              +{result.points_earned}
            </p>
          </div>
        )}

        {/* Waiting message */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6">
          {/* ☝️ ИЗМЕНЕНО: p-6 → p-4 sm:p-6 */}
          <div className="flex items-center justify-center gap-3">
            <TrendingUp className="animate-pulse" size={24} />
            <p className="text-lg sm:text-xl font-medium">
              {/* ☝️ ИЗМЕНЕНО: text-xl → text-lg sm:text-xl */}
              Ожидаем следующего вопроса...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultScreen