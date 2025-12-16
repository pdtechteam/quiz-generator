import { useState, useEffect } from 'react'
import { ArrowLeft, Play, Sparkles, Loader } from 'lucide-react'
import api from '../../utils/api'

function QuizSelectionScreen({ onBack, onSelectQuiz }) {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  // Load quizzes on mount
  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    setLoading(true)
    try {
      const data = await api.getQuizzes()
      setQuizzes(data.results || data)
    } catch (error) {
      console.error('Failed to load quizzes:', error)
      alert('Не удалось загрузить квизы')
    } finally {
      setLoading(false)
    }
  }

  const handleStartGame = async () => {
    if (!selectedQuiz) return

    try {
      const session = await api.createSession(selectedQuiz.id)
      onSelectQuiz(session.code)
    } catch (error) {
      console.error('Failed to create session:', error)
      alert('Не удалось создать сессию')
    }
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900
                  p-12 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20
                     backdrop-blur-xl border border-white/20 rounded-2xl transition-all
                     text-white font-semibold text-xl group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            Назад в меню
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br
                        from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl shadow-purple-500/50">
            <Sparkles className="text-white" size={40} />
          </div>
          <h1 className="text-7xl font-black mb-4 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Выберите квиз
            </span>
          </h1>
          <p className="text-3xl text-white/60">Выберите игру для начала</p>
        </div>

        {/* Quiz List or Selected Quiz */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader size={64} className="animate-spin mx-auto mb-4 text-purple-400" />
                <p className="text-3xl font-semibold">Загрузка квизов...</p>
              </div>
            </div>
          ) : !selectedQuiz ? (
            /* Quiz List */
            <div className="max-w-6xl mx-auto">
              {quizzes.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-4xl font-semibold text-white/70 mb-4">Квизов пока нет</p>
                  <p className="text-2xl text-white/50">Создайте квиз в панели администрирования</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map((quiz, idx) => (
                    <button
                      key={quiz.id}
                      onClick={() => setSelectedQuiz(quiz)}
                      className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl
                               p-8 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50
                               hover:border-purple-400 text-left"
                      style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both` }}
                    >
                      <div className="mb-4">
                        <h3 className="text-3xl font-bold mb-2 group-hover:text-purple-300 transition-colors">
                          {quiz.title}
                        </h3>
                        {quiz.description && (
                          <p className="text-lg text-white/70 line-clamp-2">
                            {quiz.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-white/80">
                        <span className="text-lg">📝 {quiz.question_count} вопросов</span>
                        <span className="text-lg">⏱️ {quiz.time_per_question}с</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Selected Quiz - Start Game */
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
                <h2 className="text-5xl font-bold mb-4">Выбран квиз:</h2>
                <p className="text-7xl mb-8 font-black text-transparent bg-clip-text bg-gradient-to-r
                            from-purple-400 to-pink-400">
                  {selectedQuiz.title}
                </p>

                {selectedQuiz.description && (
                  <p className="text-2xl text-white/70 mb-8">
                    {selectedQuiz.description}
                  </p>
                )}

                <div className="flex items-center justify-center gap-6 text-2xl text-white/80 mb-12">
                  <span>📝 {selectedQuiz.question_count} вопросов</span>
                  <span>⏱️ {selectedQuiz.time_per_question}с на вопрос</span>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleStartGame}
                    className="w-full px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-500
                             hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl
                             text-4xl font-black transition-all duration-200 shadow-2xl
                             shadow-green-500/50 flex items-center justify-center gap-4 group"
                  >
                    <Play size={48} className="group-hover:translate-x-2 transition-transform" />
                    Начать игру
                  </button>

                  <button
                    onClick={() => setSelectedQuiz(null)}
                    className="w-full px-12 py-4 bg-white/10 hover:bg-white/20 text-white
                             rounded-2xl text-3xl font-semibold transition-all duration-200"
                  >
                    ← Выбрать другой квиз
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default QuizSelectionScreen