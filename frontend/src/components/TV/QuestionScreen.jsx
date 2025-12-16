import { useState, useEffect, useRef } from 'react'
import { Users, CheckCircle, Clock } from 'lucide-react'
import { playSound } from '../../utils/sounds'

function QuestionScreen({ question, players, gameState }) {
  const [timeLeft, setTimeLeft] = useState(question?.time_limit || 20)
  const [lastTickTime, setLastTickTime] = useState(0)
  const timerStartedRef = useRef(false)

  const choiceColors = [
    'from-red-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-yellow-500 to-orange-500',
    'from-green-500 to-emerald-500'
  ]

  const choiceEmojis = ['🔴', '🔵', '🟡', '🟢']

  // ✅ Таймер с звуками
  useEffect(() => {
    if (!question) return

    console.log('🎯 TV Question: Starting timer')
    setTimeLeft(question.time_limit || 20)
    setLastTickTime(0)
    timerStartedRef.current = true

    // ✅ ЗВУК: При появлении вопроса
    playSound('reveal')

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - 0.1)

        // ✅ ЗВУК: Тик на последних 5 секундах
        const currentSecond = Math.floor(newTime)
        if (currentSecond !== lastTickTime && currentSecond <= 5 && currentSecond > 0) {
          playSound('countdown')
          setLastTickTime(currentSecond)
        }

        if (newTime <= 0) {
          clearInterval(timer)
        }

        return newTime
      })
    }, 100)

    return () => {
      console.log('🧹 TV Question: Cleaning up timer')
      clearInterval(timer)
      timerStartedRef.current = false
    }
  }, [question])

  const getTimerColor = () => {
    const percentage = (timeLeft / (question?.time_limit || 20)) * 100
    if (percentage <= 10) return 'from-red-500 to-pink-500'
    if (percentage <= 25) return 'from-orange-500 to-red-500'
    if (percentage <= 50) return 'from-yellow-500 to-orange-500'
    return 'from-green-500 to-emerald-500'
  }

  const getTimerWidth = () => {
    return Math.max(0, (timeLeft / (question?.time_limit || 20)) * 100)
  }

  if (!question) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
        <div className="text-5xl">Загрузка вопроса...</div>
      </div>
    )
  }

  // ✅ ИСПРАВЛЕНО: Правильный подсчет ответивших
  console.log('📊 gameState:', gameState) // Debug

  // Парсим answeredCount если это строка
  let answeredCount = 0
  if (gameState?.answeredCount !== undefined) {
    if (typeof gameState.answeredCount === 'string') {
      // Если формат "X/Y" или "X/Y/Z", берем только первое число
      const match = String(gameState.answeredCount).match(/^(\d+)/)
      answeredCount = match ? parseInt(match[1]) : 0
    } else {
      answeredCount = Number(gameState.answeredCount) || 0
    }
  }

  const totalPlayers = players?.length || 0
  const correctCount = Number(gameState?.correctCount) || 0

  console.log('📊 Parsed counts:', { answeredCount, totalPlayers, correctCount }) // Debug

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-12 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/3 right-1/3 w-[600px] h-[600px] bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-[600px] h-[600px] bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* ✅ Timer Bar */}
      <div className="absolute top-0 left-0 right-0 w-full h-4 bg-black/20 z-20">
        <div
          className={`h-full bg-gradient-to-r ${getTimerColor()} transition-all duration-100 ease-linear`}
          style={{ width: `${getTimerWidth()}%` }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8 mt-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-4">
            <p className="text-4xl font-bold text-purple-300">
              Вопрос {question.order || 1}
            </p>
          </div>

          {/* ✅ Таймер */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-4">
            <div className="flex items-center gap-3">
              <Clock className={`${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} size={32} />
              <span className={`text-4xl font-bold font-mono ${
                timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'
              }`}>
                {Math.ceil(timeLeft)}с
              </span>
            </div>
          </div>

          {/* ✅ Счетчик ответивших */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-4">
            <div className="flex items-center gap-4">
              <Users className="text-cyan-400" size={32} />
              <div className="text-3xl font-bold">
                <span className="text-white">
                  Ответили: {answeredCount}/{totalPlayers}
                </span>
                {correctCount > 0 && (
                  <span className="ml-4 text-green-400">
                    ✓ {correctCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 mb-12 shadow-2xl">
            <h2 className="text-7xl font-black text-center leading-tight">
              {question.text}
            </h2>
          </div>

          {/* Choices grid */}
          <div className="grid grid-cols-2 gap-8">
            {question.choices?.map((choice, idx) => (
              <div
                key={choice.id}
                className="group relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-[1.02] transition-all"
                style={{
                  animation: `zoomIn 0.5s ease-out ${idx * 0.15}s both`
                }}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${choiceColors[idx]} opacity-90`} />

                {/* Content */}
                <div className="relative p-10 text-center">
                  <div className="text-9xl mb-4">
                    {choiceEmojis[idx]}
                  </div>
                  <p className="text-5xl font-bold text-white leading-tight">
                    {choice.text}
                  </p>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                              transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionScreen