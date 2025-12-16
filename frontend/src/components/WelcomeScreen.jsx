import { Sparkles, Tv, Smartphone } from 'lucide-react'

function WelcomeScreen({ onSelectMode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900
                  flex items-center justify-center p-4 sm:p-8 md:p-12 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 md:w-[800px] h-64 sm:h-96 md:h-[800px]
                      bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 md:w-[800px] h-64 sm:h-96 md:h-[800px]
                      bg-pink-500 rounded-full blur-3xl animate-pulse"
             style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 sm:w-96 md:w-[800px] h-64 sm:h-96 md:h-[800px]
                      bg-cyan-500 rounded-full blur-3xl animate-pulse"
             style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 text-center text-white max-w-6xl w-full">
        {/* Logo */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32
                        bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl
                        mb-4 sm:mb-6 md:mb-8 shadow-2xl shadow-purple-500/50 animate-pulse">
            <Sparkles className="text-white" size={32} />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-black mb-2 sm:mb-3 md:mb-4
                       animate-pulse tracking-tight px-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Quiz Generator
            </span>
          </h1>
          <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl text-white/60 px-4">
            Выберите режим
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto px-4">
          {/* TV/Host Mode */}
          <button
            onClick={() => onSelectMode('tv')}
            className="group relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20
                     rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12
                     transition-all duration-300 hover:scale-105 hover:shadow-2xl
                     hover:shadow-purple-500/50 hover:border-purple-400
                     active:scale-95"
          >
            <div className="relative z-10">
              <div className="mb-4 sm:mb-5 md:mb-6 inline-flex items-center justify-center
                            w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
                            bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl
                            shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Tv className="text-white" size={32} />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3 md:mb-4
                           text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Режим Хоста
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 px-2">
                Управляйте игрой на большом экране
              </p>
            </div>

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Player Mode */}
          <button
            onClick={() => onSelectMode('player')}
            className="group relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20
                     rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12
                     transition-all duration-300 hover:scale-105 hover:shadow-2xl
                     hover:shadow-cyan-500/50 hover:border-cyan-400
                     active:scale-95"
          >
            <div className="relative z-10">
              <div className="mb-4 sm:mb-5 md:mb-6 inline-flex items-center justify-center
                            w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
                            bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl sm:rounded-2xl
                            shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="text-white" size={32} />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3 md:mb-4
                           text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Режим Игрока
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 px-2">
                Присоединитесь к игре со своего устройства
              </p>
            </div>

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Footer hint */}
        <p className="text-center text-white/40 text-sm sm:text-base md:text-lg lg:text-xl mt-6 sm:mt-8 md:mt-12 px-4">
          Выберите режим для начала игры
        </p>
      </div>
    </div>
  )
}

export default WelcomeScreen