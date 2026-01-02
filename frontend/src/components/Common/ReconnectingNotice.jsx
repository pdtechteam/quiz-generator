import { Wifi, WifiOff, AlertCircle } from 'lucide-react'

function ReconnectingNotice({ attempt, maxAttempts }) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50
                    bg-yellow-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl
                    shadow-2xl border border-yellow-400/30 animate-pulse">
      <div className="flex items-center gap-3">
        <Wifi className="animate-spin" size={20} />
        <span className="font-semibold">
          Переподключение... ({attempt}/{maxAttempts})
        </span>
      </div>
    </div>
  )
}

function DisconnectedNotice() {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50
                    bg-red-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl
                    shadow-2xl border border-red-400/30">
      <div className="flex items-center gap-3">
        <WifiOff size={20} />
        <span className="font-semibold">
          Соединение потеряно
        </span>
      </div>
    </div>
  )
}

function ReconnectFailedNotice() {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50
                    bg-red-600/90 backdrop-blur-xl text-white px-6 py-4 rounded-xl
                    shadow-2xl border border-red-500/30 max-w-md">
      <div className="flex items-start gap-3">
        <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold mb-1">Не удалось переподключиться</div>
          <div className="text-sm opacity-90">
            Перезагрузите страницу для продолжения
          </div>
        </div>
      </div>
    </div>
  )
}

export { ReconnectingNotice, DisconnectedNotice, ReconnectFailedNotice }