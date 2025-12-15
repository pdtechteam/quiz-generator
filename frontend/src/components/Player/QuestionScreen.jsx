import { useState, useEffect } from 'react'
import { Clock, CheckCircle } from 'lucide-react'
import { playSound } from '../../utils/sounds'

function QuestionScreen({ question, onAnswer }) {
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(question?.time_limit || 20)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (!question) return

    setSelectedChoice(null)
    setAnswered(false)
    setTimeLeft(question.time_limit || 20)

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 0.1
      })
    }, 100)

    return () => clearInterval(timer)
  }, [question])

  const handleChoiceClick = (choice) => {
    if (answered || timeLeft <= 0) return

    setSelectedChoice(choice.id)
    setAnswered(true)

    const timeTaken = (Date.now() - startTime) / 1000
    onAnswer(choice.id, timeTaken)

    playSound('tap')
  }

  const getTimerColor = () => {
    const percentage = (timeLeft / (question?.time_limit || 20)) * 100
    if (percentage <= 10) return 'from-red-500 to-pink-500'
    if (percentage <= 25) return 'from-orange-500 to-red-500'
    if (percentage <= 50) return 'from-yellow-500 to-orange-500'
    return 'from-green-500 to-emerald-500'
  }

  const choiceColors = [
    'from-red-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-yellow-500 to-orange-500',
    'from-green-500 to-emerald-500'
  ]

  const choiceEmojis = ['🔴', '🔵', '🟡', '🟢']

  if (!question) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
        <div className="text-3xl">Загрузка вопроса...</div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Timer bar */}
        <div className="mb-6">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
            <div
              className={`h-full bg-gradient-to-r ${getTimerColor()} transition-all duration-100 shadow-lg`}
              style={{ width: `${(timeLeft / (question.time_limit || 20)) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-2 mt-3">
            <Clock className="text-white" size={24} />
            <p className="text-white text-3xl font-black font-mono">
              {Math.ceil(timeLeft)}s
            </p>
          </div>
        </div>

        {/* Question card */}
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
            <p className="text-white text-3xl font-bold text-center leading-relaxed">
              {question.text}
            </p>
          </div>

          {/* Choices grid */}
          <div className="grid grid-cols-1 gap-4">
            {question.choices?.map((choice, idx) => (
              <button
                key={choice.id}
                onClick={() => handleChoiceClick(choice)}
                disabled={answered || timeLeft <= 0}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-200
                  ${selectedChoice === choice.id
                    ? 'scale-95 shadow-2xl'
                    : 'hover:scale-[1.02] shadow-lg hover:shadow-2xl'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{
                  animation: `slideUp 0.5s ease-out ${idx * 0.1}s both`
                }}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${choiceColors[idx]} opacity-90
                               group-hover:opacity-100 transition-opacity`} />

                {/* Selection overlay */}
                {selectedChoice === choice.id && (
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
                )}

                {/* Content */}
                <div className="relative px-6 py-5 flex items-center gap-4">
                  <span className="text-5xl flex-shrink-0">
                    {choiceEmojis[idx]}
                  </span>
                  <span className="flex-1 text-left text-xl font-bold text-white">
                    {choice.text}
                  </span>
                  {selectedChoice === choice.id && (
                    <CheckCircle className="text-white flex-shrink-0" size={32} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Answered status */}
        {answered && (
          <div className="mt-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4
                        text-center shadow-xl animate-slideUp">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="text-green-400" size={28} />
              <div className="text-left">
                <p className="text-2xl font-bold text-white">Ответ принят!</p>
                <p className="text-sm text-white/60">Ждём результатов...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionScreen