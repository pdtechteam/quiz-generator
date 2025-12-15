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
    <div className={`w-screen h-screen flex items-center justify-center p-4 relative overflow-hidden
      ${isCorrect
        ? 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700'
        : 'bg-gradient-to-br from-red-600 via-pink-600 to-rose-700'
      }`}>

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

      <div className="relative z-10 text-center text-white max-w-2xl w-full">
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

        {/* Result text */}
        <h1 className="text-7xl font-black mb-6 drop-shadow-lg">
          {isCorrect ? 'Правильно!' : 'Неправильно'}
        </h1>

        {/* Reply message */}
        {result?.reply && (
          <p className="text-3xl mb-10 opacity-90 font-medium leading-relaxed">
            {result.reply}
          </p>
        )}

        {/* Points earned */}
        {isCorrect && result?.points_earned && (
          <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 mb-8
                        shadow-2xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Award className="text-yellow-300" size={32} />
              <p className="text-2xl font-bold opacity-75">Заработано очков</p>
            </div>
            <p className="text-8xl font-black text-yellow-300 drop-shadow-lg">
              +{result.points_earned}
            </p>
          </div>
        )}

        {/* Waiting message */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-center gap-3">
            <TrendingUp className="animate-pulse" size={24} />
            <p className="text-xl font-medium">
              Ожидаем следующего вопроса...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultScreen