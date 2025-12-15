import { useState } from 'react'
import TVScreen from './components/TV/TVScreen'
import PlayerScreen from './components/Player/PlayerScreen'
import AdminPanel from './components/Admin/AdminPanel';
import './App.css'

function App() {
  // Определяем режим сразу при инициализации, без useEffect
  const params = new URLSearchParams(window.location.search)
  const modeParam = params.get('mode')

  if (mode === 'admin') {
    return <AdminPanel />;
  }

  if (mode === 'tv') {
    return <TVScreen />;
  }

  // player mode по умолчанию
  return <PlayerScreen />;

  const initialMode = (() => {
    if (modeParam === 'tv') return 'tv'
    if (modeParam === 'player') return 'player'
    // Автоопределение: большой экран = TV, маленький = показываем выбор
    if (window.innerWidth > 1920) return 'tv'
    return null // Показываем экран выбора
  })()
  
  const [mode, setMode] = useState(initialMode)
  
  // Страница выбора режима
  if (mode === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            Quiz Generator
          </h1>
          
          <div className="space-y-4">
            <button
              onClick={() => setMode('tv')}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-xl font-semibold hover:shadow-lg transition-all"
            >
              📺 Режим TV
            </button>
            
            <button
              onClick={() => setMode('player')}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl text-xl font-semibold hover:shadow-lg transition-all"
            >
              📱 Режим Игрока
            </button>
          </div>
          
          <p className="text-center text-gray-500 mt-6 text-sm">
            Или добавьте ?mode=tv / ?mode=player к URL
          </p>
        </div>
      </div>
    )
  }
  
  // Рендерим нужный режим
  return (
    <div className="app">
      {mode === 'tv' ? <TVScreen /> : <PlayerScreen />}
    </div>
  )
}

export default App