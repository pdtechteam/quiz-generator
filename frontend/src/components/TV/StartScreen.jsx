import { useState } from 'react'
import api from '../../utils/api'

function StartScreen({ onSelectAdmin, onSelectGame }) {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  const loadQuizzes = async () => {
    setLoading(true)
    try {
      const data = await api.getQuizzes()
      setQuizzes(data.results || data)
    } catch (error) {
      console.error('Failed to load quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartGame = async () => {
    if (!selectedQuiz) return
    
    try {
      const session = await api.createSession(selectedQuiz.id)
      onSelectGame(session.code)
    } catch (error) {
      console.error('Failed to create session:', error)
      alert('Не удалось создать сессию')
    }
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-8">
      <div className="text-center text-white max-w-4xl">
        <h1 className="text-9xl font-bold mb-12 animate-pulse">
          Quiz Generator
        </h1>
        
        {!selectedQuiz ? (
          <div className="space-y-6">
            <button
              onClick={onSelectAdmin}
              className="px-16 py-8 bg-white text-purple-600 rounded-3xl text-4xl font-bold hover:scale-105 transition-transform shadow-2xl block w-full"
            >
              👔 Режим Админа
            </button>
            
            <button
              onClick={loadQuizzes}
              disabled={loading}
              className="px-16 py-8 bg-white text-blue-600 rounded-3xl text-4xl font-bold hover:scale-105 transition-transform shadow-2xl block w-full disabled:opacity-50"
            >
              {loading ? '⏳ Загрузка...' : '🎮 Начать Игру'}
            </button>
            
            {quizzes.length > 0 && (
              <div className="mt-8 bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-8">
                <h2 className="text-3xl font-bold mb-4">Выберите квиз:</h2>
                <div className="space-y-4">
                  {quizzes.map(quiz => (
                    <button
                      key={quiz.id}
                      onClick={() => setSelectedQuiz(quiz)}
                      className="w-full p-6 bg-white bg-opacity-30 rounded-2xl hover:bg-opacity-50 transition-all text-left"
                    >
                      <p className="text-2xl font-bold">{quiz.title}</p>
                      <p className="text-lg opacity-90">
                        {quiz.question_count} вопросов • {quiz.time_per_question}с на вопрос
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-4">Выбран квиз:</h2>
            <p className="text-5xl mb-8">{selectedQuiz.title}</p>
            
            <div className="space-y-4">
              <button
                onClick={handleStartGame}
                className="px-12 py-6 bg-green-500 text-white rounded-2xl text-3xl font-bold hover:scale-105 transition-transform shadow-2xl"
              >
                ▶️ Начать игру
              </button>
              
              <button
                onClick={() => setSelectedQuiz(null)}
                className="px-12 py-6 bg-white text-purple-600 rounded-2xl text-2xl font-semibold hover:scale-105 transition-transform"
              >
                ← Выбрать другой квиз
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StartScreen