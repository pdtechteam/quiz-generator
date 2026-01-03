import { useState, useEffect, useMemo } from 'react'
import { Clock, Users } from 'lucide-react'

function QuestionScreen({ question, answeredCount = 0, totalPlayers = 0, correctCount = 0 }) {
  const [timeLeft, setTimeLeft] = useState(question?.time_limit || 20)

  // Перемешиваем варианты ответов один раз при загрузке вопроса
  const shuffledChoices = useMemo(() => {
    if (!question?.choices) return []

    const choices = [...question.choices]
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]]
    }

    console.log('🔀 TV: Shuffled choices:', choices.map(c => c.text))
    return choices
  }, [question?.uuid])

  useEffect(() => {
    if (!question) return

    setTimeLeft(question.time_limit || 20)

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timer)
          return 0
        }
        return prev - 0.1
      })
    }, 100)

    return () => clearInterval(timer)
  }, [question])

  const getTimerWidth = () => {
    return Math.max(0, (timeLeft / (question?.time_limit || 20)) * 100)
  }

  const choiceColors = [
    'from-red-500 to-red-600',
    'from-blue-500 to-blue-600',
    'from-yellow-500 to-yellow-600',
    'from-green-500 to-green-600'
  ]

  const choiceEmojis = ['🔴', '🔵', '🟡', '🟢']

  if (!question) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-4xl">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 overflow-hidden flex flex-col">
      <style>{`
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      {/* Header with timer and stats - ФИКСИРОВАННАЯ ВЫСОТА */}
      <div className="flex-shrink-0 flex justify-between items-center p-6 gap-6">
        {/* ⏱️ Таймер */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3">
          <div className="flex items-center gap-3">
            <Clock className={`${timeLeft <= 5 ?
              'text-red-400 animate-pulse' : 'text-cyan-400'}`} size={28} />
            <span className={`text-3xl font-bold font-mono ${
              timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'
            }`}>
              {Math.ceil(timeLeft)}с
            </span>
          </div>
        </div>

        {/* ✅ Счетчик ответивших */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3">
          <div className="flex items-center gap-3">
            <Users className="text-cyan-400" size={28} />
            <div className="text-2xl font-bold">
              <span className="text-white">
                Ответили: {answeredCount}/{totalPlayers}
              </span>
              {correctCount > 0 && (
                <span className="ml-3 text-green-400">
                  ✓ {correctCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content - ГИБКАЯ ВЫСОТА */}
      <div className="flex-1 flex flex-col min-h-0 px-6 pb-6">
        {/* Question - АДАПТИВНЫЙ РАЗМЕР */}
        <div className="flex-shrink-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-6 shadow-2xl">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-center leading-tight break-words">
            {question.text}
          </h2>
        </div>

        {/* Choices grid - ЗАНИМАЕТ ОСТАВШЕЕСЯ МЕСТО */}
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          {shuffledChoices.map((choice, idx) => (
            <div
              key={choice.id}
              className="group relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-[1.02] transition-all flex items-center justify-center"
              style={{
                animation: `zoomIn 0.5s ease-out ${idx * 0.15}s both`
              }}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${choiceColors[idx]} opacity-90`} />

              {/* Content */}
              <div className="relative p-6 text-center">
                <div className="text-6xl md:text-7xl lg:text-8xl mb-3">
                  {choiceEmojis[idx]}
                </div>
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight break-words">
                  {choice.text}
                </p>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                            transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          ))}
        </div>

        {/* Timer Bar at bottom - ФИКСИРОВАННАЯ ВЫСОТА */}
        <div className="flex-shrink-0 mt-4">
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-100 ease-linear"
              style={{ width: `${getTimerWidth()}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionScreen