import { Users, CheckCircle } from 'lucide-react'

function QuestionScreen({ question, players, gameState }) {
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
        <div className="text-5xl">Загрузка вопроса...</div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-12 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/3 right-1/3 w-[600px] h-[600px] bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-[600px] h-[600px] bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-4">
            <p className="text-4xl font-bold text-purple-300">
              Вопрос {question.order || 1}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-4">
            <div className="flex items-center gap-4">
              <Users className="text-cyan-400" size={32} />
              <div className="text-3xl font-bold">
                <span className="text-white">Ответили: {gameState?.answeredCount || '0/0'}</span>
                {gameState?.correctCount !== undefined && (
                  <span className="ml-4 text-green-400">
                    ✓ {gameState.correctCount}
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