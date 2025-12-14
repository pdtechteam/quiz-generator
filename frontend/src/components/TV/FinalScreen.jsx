function FinalScreen({ leaderboard, awards }) {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 p-12 text-white">
      <div className="flex flex-col h-full text-center">
        <h1 className="text-8xl font-bold mb-12 animate-pulse">
          🎉 Игра завершена! 🎉
        </h1>

        {/* Final Leaderboard */}
        <div className="flex-1 mb-8">
          <h2 className="text-5xl font-bold mb-8">Победители</h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {leaderboard?.slice(0, 3).map((player, idx) => (
                              <div
                key={player.player_id}
                className="bg-white bg-opacity-30 backdrop-blur-lg rounded-3xl p-8 flex items-center gap-6"
                style={{
                  animation: `slideIn 0.5s ease-out ${idx * 0.3}s both`
                }}
              >
                <div className="text-7xl">
                  {['🥇', '🥈', '🥉'][idx]}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-5xl font-bold">{player.name}</p>
                </div>
                <div className="text-5xl font-mono">
                  {player.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        {awards && Object.keys(awards).length > 0 && (
          <div>
            <h2 className="text-4xl font-bold mb-6">🏆 Специальные награды 🏆</h2>
            <div className="flex gap-6 justify-center">
              {Object.entries(awards).map(([key, award]) => (
                <div
                  key={key}
                  className="bg-white bg-opacity-30 backdrop-blur-lg rounded-2xl p-6 text-center"
                >
                  <div className="text-6xl mb-2">{award.emoji}</div>
                  <p className="text-2xl font-bold">{award.name}</p>
                  <p className="text-sm opacity-75">{award.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FinalScreen