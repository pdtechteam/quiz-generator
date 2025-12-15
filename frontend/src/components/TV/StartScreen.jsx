import { useState } from 'react'
import { Sparkles, Play, Settings, Gamepad2, Loader } from 'lucide-react'
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
      alert('Не удалось загрузить квизы')
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
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900
                  flex items-center justify-center p-12 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 text-center text-white max-w-6xl w-full">
        {/* Logo */}
        <div className="mb-16">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500
                        rounded-3xl mb-8 shadow-2xl shadow-purple-500/50 animate-pulse">
            <Sparkles className="text-white" size={64} />
          </div>

          <h1 className="text-9xl font-black mb-4 animate-pulse tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Quiz Generator
            </span>
          </h1>
          <p className="text-4xl text-white/60">Домашняя квиз-игра на ТВ</p>
        </div>

        {/* Menu */}
        {!selectedQuiz ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* ✅ ИЗМЕНЕНО: Start Game button теперь ПЕРВАЯ */}
            <button
              onClick={loadQuizzes}
              disabled={loading}
              className="w-full px-12 py-8 bg-gradient-to-r from-purple-500 to-pink-500
                       hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500
                       disabled:to-gray-600 text-white rounded-3xl text-5xl font-black
                       transition-all duration-200 shadow-2xl shadow-purple-500/50
                       disabled:shadow-none flex items-center justify-center gap-6 group"
            >
              {loading ? (
                <>
                  <Loader size={56} className="animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Gamepad2 size={56} className="group-hover:scale-110 transition-transform" />
                  Игра
                </>
              )}
            </button>

            {/* ✅ ИЗМЕНЕНО: Admin button теперь ВТОРАЯ */}
            <button
              onClick={onSelectAdmin}
              className="w-full px-12 py-8 bg-gradient-to-r from-yellow-500 to-orange-500
                       hover:from-yellow-600 hover:to-orange-600 text-white rounded-3xl
                       text-5xl font-black transition-all duration-200 shadow-2xl
                       shadow-yellow-500/50 flex items-center justify-center gap-6 group"
            >
              <Settings size={56} className="group-hover:rotate-180 transition-transform duration-500" />
              Администрирование
            </button>

            {/* Quiz selection */}
            {quizzes.length > 0 && (
              <div className="mt-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-h-[400px] overflow-y-auto">
                <h2 className="text-4xl font-bold mb-6 flex items-center justify-center gap-3">
                  <Sparkles className="text-purple-400" />
                  Выберите квиз
                </h2>
                <div className="space-y-4">
                  {quizzes.map((quiz, idx) => (
                    <button
                      key={quiz.id}
                      onClick={() => setSelectedQuiz(quiz)}
                      className="w-full p-6 bg-white/10 hover:bg-white/20 rounded-2xl
                               transition-all text-left border border-white/10
                               hover:border-purple-400 group"
                      style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both` }}
                    >
                      <p className="text-3xl font-bold mb-2 group-hover:text-purple-300 transition-colors">
                        {quiz.title}
                      </p>
                      <p className="text-xl text-white/70">
                        📝 {quiz.question_count} вопросов • ⏱️ {quiz.time_per_question}с на вопрос
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Selected Quiz */
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold mb-4">Выбран квиз:</h2>
            <p className="text-6xl mb-8 font-black text-transparent bg-clip-text bg-gradient-to-r
                        from-purple-400 to-pink-400">
              {selectedQuiz.title}
            </p>

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
        )}
      </div>
    </div>
  )
}

export default StartScreen