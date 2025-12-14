import { useEffect } from 'react'
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
    <div className={`w-screen h-screen flex items-center justify-center p-4 ${
      isCorrect 
        ? 'bg-gradient-to-br from-green-500 to-teal-600'
        : 'bg-gradient-to-br from-red-500 to-pink-600'
    }`}>
      <div className="text-center text-white max-w-md">
        <div className="text-9xl mb-8 animate-bounce">
          {isCorrect ? '✓' : '✗'}
        </div>

        <h1 className="text-6xl font-bold mb-4">
          {isCorrect ? 'Правильно!' : 'Неправильно'}
        </h1>

        {result?.reply && (
          <p className="text-2xl mb-8 opacity-90">
            {result.reply}
          </p>
        )}

        {isCorrect && result?.points_earned && (
          <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-3xl p-8 mb-6">
            <p className="text-lg opacity-75 mb-2">Заработано очков:</p>
            <p className="text-7xl font-bold">+{result.points_earned}</p>
          </div>
        )}

        <div className="text-xl opacity-75">
          <p>Ожидаем следующего вопроса...</p>
        </div>
      </div>
    </div>
  )
}

export default ResultScreen