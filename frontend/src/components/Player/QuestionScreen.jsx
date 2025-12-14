import { useState, useEffect } from 'react'
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
    if (percentage <= 10) return 'bg-red-500'
    if (percentage <= 25) return 'bg-orange-500'
    if (percentage <= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (!question) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white">
        <div className="text-3xl">Загрузка вопроса...</div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex flex-col p-4">
      {/* Timer */}
      <div className="mb-4">
        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getTimerColor()} transition-all duration-100`}
            style={{ width: `${(timeLeft / (question.time_limit || 20)) * 100}%` }}
          />
        </div>
        <p className="text-white text-center text-2xl font-bold mt-2">
          {Math.ceil(timeLeft)}s
        </p>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-6 mb-6">
          <p className="text-white text-2xl font-semibold text-center">
            {question.text}
          </p>
        </div>

        {/* Choices */}
        <div className="space-y-4">
          {question.choices?.map((choice, idx) => (
            <button
              key={choice.id}
              onClick={() => handleChoiceClick(choice)}
              disabled={answered || timeLeft <= 0}
              className={`w-full p-6 rounded-2xl text-white text-xl font-bold transition-all ${
                selectedChoice === choice.id
                  ? 'bg-blue-500 scale-95'
                  : 'bg-white bg-opacity-30 hover:bg-opacity-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">
                  {['🔴', '🔵', '🟡', '🟢'][idx]}
                </span>
                <span className="flex-1 text-left">{choice.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Answered status */}
      {answered && (
        <div className="mt-4 bg-white bg-opacity-30 backdrop-blur-lg rounded-2xl p-4 text-center text-white">
          <p className="text-2xl font-bold">✓ Ответ принят!</p>
          <p className="text-sm opacity-75">Ждём результатов...</p>
        </div>
      )}
    </div>
  )
}

export default QuestionScreen