function QuestionScreen({ question, players, gameState }) {
  if (!question) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white">
        <div className="text-5xl">Загрузка вопроса...</div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-12 text-white">
      <div className="flex flex-col h-full">
        {/* Progress */}
        <div className="text-3xl mb-6 opacity-75">
          Вопрос {question.order || 1}
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-6xl font-bold mb-12 text-center">
            {question.text}
          </h2>

          {/* Choices */}
          <div className="grid grid-cols-2 gap-8">
            {question.choices?.map((choice, idx) => (
              <div
                key={choice.id}
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-8 text-center"
              >
                <div className="text-8xl mb-4">
                  {['🔴', '🔵', '🟡', '🟢'][idx]}
                </div>
                <p className="text-4xl font-semibold">{choice.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Players answered */}
        <div className="text-2xl text-center opacity-75">
          Ответили: {gameState?.answeredCount || '0/0'}
          {gameState?.correctCount !== undefined && (
            <span className="ml-4 text-green-400">
              ✓ {gameState.correctCount} правильных
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuestionScreen