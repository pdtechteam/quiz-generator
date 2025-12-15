import QRCode from 'react-qr-code'
import { Smartphone, Users, Crown, Wifi } from 'lucide-react'

function LobbyScreen({ sessionCode, players }) {
  const joinUrl = `${window.location.origin}/?mode=player&code=${sessionCode}`

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-12 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-8xl font-black mb-6 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Quiz Generator
            </span>
          </h1>

          <div className="flex items-center justify-center gap-8 text-5xl">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-4">
              <Wifi className="text-cyan-400" size={40} />
              <span className="text-white/60">Код:</span>
              <span className="font-mono font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                {sessionCode}
              </span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex gap-12">
          {/* QR Code section */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-6">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Smartphone className="text-cyan-400" size={40} />
                  <h2 className="text-5xl font-bold">Сканируй для входа</h2>
                </div>

                <div className="bg-white p-10 rounded-3xl inline-block shadow-2xl">
                  <QRCode value={joinUrl} size={350} />
                </div>
              </div>

              <p className="text-3xl text-white/70">
                или введи код: <span className="font-mono font-bold text-yellow-400">{sessionCode}</span>
              </p>
            </div>
          </div>

          {/* Players list */}
          <div className="flex-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full">
              <div className="flex items-center gap-3 mb-8">
                <Users className="text-purple-400" size={48} />
                <h2 className="text-6xl font-black">
                  Игроки
                  <span className="ml-4 text-4xl text-purple-400">({players.length}/10)</span>
                </h2>
              </div>

              <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar">
                {players.map((player, idx) => (
                  <div
                    key={player.id}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6
                             flex items-center gap-5 transform hover:scale-[1.02] transition-all"
                    style={{
                      animation: `slideIn 0.5s ease-out ${idx * 0.1}s both`
                    }}
                  >
                    <div className="text-6xl">
                      {player.is_host ? '👑' : '👤'}
                    </div>
                    <div className="flex-1">
                      <p className="text-4xl font-bold">{player.name}</p>
                      {player.is_host && (
                        <div className="flex items-center gap-2 mt-1">
                          <Crown className="text-yellow-400" size={20} />
                          <p className="text-xl text-yellow-400">Ведущий</p>
                        </div>
                      )}
                    </div>
                    <div className={`w-6 h-6 rounded-full ${player.connected ? 'bg-green-400' : 'bg-red-400'}
                                  shadow-lg ${player.connected ? 'shadow-green-400/50' : 'shadow-red-400/50'}`} />
                  </div>
                ))}

                {players.length === 0 && (
                  <div className="text-center py-20 text-white/40">
                    <Users className="mx-auto mb-4" size={80} />
                    <p className="text-4xl font-bold">Ожидаем игроков...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-3xl text-white/60 mt-8">
          <p className="mb-2">⏳ Ожидаем начала игры...</p>
          <p className="text-2xl text-white/40">Ведущий запустит игру с телефона</p>
        </div>
      </div>
    </div>
  )
}

export default LobbyScreen