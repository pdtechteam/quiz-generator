import QRCode from 'react-qr-code'

function LobbyScreen({ sessionCode, players }) {
  const joinUrl = `${window.location.origin}/?mode=player&code=${sessionCode}`

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-12 text-white">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-7xl font-bold mb-4">Quiz Generator</h1>
          <div className="flex justify-center gap-12 text-4xl">
            <div>
              <span className="opacity-75">Код сессии:</span>
              <span className="ml-4 font-mono font-bold">{sessionCode}</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex gap-12">
          {/* QR Code */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-8">Сканируй для входа</h2>
              <div className="bg-white p-8 rounded-3xl inline-block">
                <QRCode value={joinUrl} size={300} />
              </div>
              <p className="text-2xl mt-6 opacity-75">
                или введи код: <span className="font-mono font-bold">{sessionCode}</span>
              </p>
            </div>
          </div>

          {/* Players list */}
          <div className="flex-1">
            <h2 className="text-5xl font-bold mb-6">
              Игроки ({players.length}/10)
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {players.map((player, idx) => (
                <div
                  key={player.id}
                  className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 flex items-center gap-4"
                >
                  <div className="text-5xl">
                    {player.is_host ? '👑' : '👤'}
                  </div>
                  <div className="flex-1">
                    <p className="text-3xl font-bold">{player.name}</p>
                    {player.is_host && (
                      <p className="text-xl opacity-75">Ведущий</p>
                    )}
                  </div>
                  <div className="text-3xl">
                    {player.connected ? '🟢' : '🔴'}
                  </div>
                </div>
              ))}
              
              {players.length === 0 && (
                <div className="text-center text-3xl opacity-50 py-12">
                  Ожидаем игроков...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-2xl opacity-75">
          <p>Ожидаем начала игры...</p>
          <p className="text-xl mt-2">Ведущий запустит игру с телефона</p>
        </div>
      </div>
    </div>
  )
}

export default LobbyScreen