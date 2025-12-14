function ResultScreen({ question, leaderboard }) {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-green-500 to-teal-600 p-12 text-white">
      <div className="flex flex-col h-full">
        <h1 className="text-6xl font-bold mb-8 text-center">Результаты</h1>

        {question && (
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-8 mb-8">
            <p className="text-3xl mb-4">Правильный ответ:</p>
            <p className="text-5xl font-bold">
              {question.choices?.find(c => c.is_correct)?.text || 'N/A'}
            </p>
          </div>
        )}

        {/* Leaderboard */}
        <div className="flex-1">
          <h2 className="text-4xl font-bold mb-6">Таблица лидеров</h2>
          <div className="space-y-4">
            {leaderboard?.slice(0, 5).map((player, idx) => (
              <div
                key={player.player_id}
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 flex items-center gap-4"
              >
                <div className="text-4xl w-16 text-center">
                  {['🥇', '🥈', '🥉'][idx] || `#${idx + 1}`}
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold">{player.name}</p>
                </div>
                <div className="text-3xl font-mono">
                  {player.score} очков
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultScreen