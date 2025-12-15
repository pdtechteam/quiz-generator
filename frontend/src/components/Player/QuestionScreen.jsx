import { useState, useEffect, useRef } from 'react'
import { Clock, CheckCircle } from 'lucide-react'
import { playSound } from '../../utils/sounds'

function QuestionScreen({ question, onAnswer }) {
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(question?.time_limit || 20)
  const startTimeRef = useRef(Date.now())
  const hasAnsweredRef = useRef(false)

  useEffect(() => {
    if (!question) return

    console.log('🎯 New question, resetting state')
    setSelectedChoice(null)
    setAnswered(false)
    setTimeLeft(question.time_limit || 20)
    startTimeRef.current = Date.now()
    hasAnsweredRef.current = false

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timer)

          // ✅ АВТОМАТИЧЕСКИЙ ОТВЕТ ПРИ ТАЙМАУТЕ
          if (!hasAnsweredRef.current) {
            console.log('⏰ Time is up! Auto-submitting answer...')
            hasAnsweredRef.current = true
            setAnswered(true)

            const timeTaken = (Date.now() - startTimeRef.current) / 1000

            // Отправляем первый вариант (будет неправильный)
            if (question.choices && question.choices.length > 0) {
              console.log('📤 Sending timeout answer:', question.choices[0].id)
              onAnswer(question.choices[0].id, timeTaken)
            }
          }

          return 0
        }
        return prev - 0.1
      })
    }, 100)

    return () => {
      console.log('🧹 Cleaning up timer')
      clearInterval(timer)
    }
  }, [question, onAnswer])

  const handleChoiceClick = (choice) => {
    if (hasAnsweredRef.current || timeLeft <= 0) {
      console.log('⚠️ Cannot answer: already answered or time is up')
      return
    }

    console.log('✅ Choice clicked:', choice.id)
    setSelectedChoice(choice.id)
    setAnswered(true)
    hasAnsweredRef.current = true

    const timeTaken = (Date.now() - startTimeRef.current) / 1000
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

  const getTimerWidth = () => {
    return Math.max(0, (timeLeft / (question?.time_limit || 20)) * 100)
  }

  if (!question) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка вопроса...</div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex flex-col overflow-hidden">
      {/* Timer Bar */}
      <div className="w-full h-3 bg-black/20">
        <div
          className={`h-full bg-gradient-to-r ${getTimerColor()} transition-all duration-100 ease-linear`}
          style={{ width: `${getTimerWidth()}%` }}
        />
      </div>

      {/* Timer Display */}
      <div className="absolute top-6 right-6 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-2xl">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-600" />
            <span className={`text-2xl font-bold ${
              timeLeft <= 3 ? 'text-red-600 animate-pulse' : 'text-gray-800'
            }`}>
              {Math.ceil(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-4xl mx-auto w-full pb-44 px-4 pt-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center break-words">
              {question.text}
            </h2>
            {question.image_url && (
              <img
                src={question.image_url}
                alt="Question"
                className="mt-6 w-full max-h-64 object-cover rounded-2xl"
              />
            )}
          </div>

          {/* Choices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question.choices.map((choice, index) => {
              const isSelected = selectedChoice === choice.id
              const letters = ['A', 'B', 'C', 'D']

              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceClick(choice)}
                  disabled={answered}
                  className={`
                    relative p-6 rounded-2xl text-left font-semibold text-lg
                    transition-all duration-200 transform
                    ${answered
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-105 hover:shadow-2xl cursor-pointer active:scale-95'
                    }
                    ${isSelected
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-2xl scale-105'
                      : 'bg-white text-gray-800 shadow-lg'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0
                      ${isSelected
                        ? 'bg-white/30 text-white'
                        : 'bg-purple-100 text-purple-600'
                      }
                    `}>
                      {letters[index]}
                    </div>
                    <span className="flex-1 break-words">{choice.text}</span>
                    {isSelected && (
                      <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionScreen