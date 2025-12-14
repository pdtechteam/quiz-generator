function WaitingScreen({ playerName, sessionCode, isHost, onBecomeHost, onStartGame }) {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-md">
        <h1 className="text-5xl font-bold mb-8">
          Привет, {playerName}! 👋
        </h1>

        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-8 mb-8">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-2xl mb-4">Ожидаем начала игры...</p>
          <p className="text-lg opacity-75">Код сессии: {sessionCode}</p>
        </div>

        {!isHost ? (
          <button
            onClick={onBecomeHost}
            className="px-8 py-4 bg-yellow-500 text-white rounded-xl text-xl font-bold hover:bg-yellow-600 transition-colors"
          >
            👑 Стать ведущим
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-500 bg-opacity-30 backdrop-blur-lg rounded-2xl p-6">
              <p className="text-2xl font-bold mb-2">👑 Ты ведущий!</p>
              <p className="text-sm opacity-75">У тебя есть кнопки управления</p>
            </div>
            <button
              onClick={onStartGame}
              className="w-full px-8 py-4 bg-green-500 text-white rounded-xl text-xl font-bold hover:bg-green-600 transition-colors"
            >
              ▶️ Начать игру
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default WaitingScreen