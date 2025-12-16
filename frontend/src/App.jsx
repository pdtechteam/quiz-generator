import { useState } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import TVScreen from './components/TV/TVScreen'
import PlayerScreen from './components/Player/PlayerScreen'
import AdminPanel from './components/Admin/AdminPanel'
import './App.css'

function App() {
  const [currentMode, setCurrentMode] = useState(null) // null | 'tv' | 'player'

  // Check URL params for direct mode access (backwards compatibility)
  const params = new URLSearchParams(window.location.search)
  const urlMode = params.get('mode')

  // If URL has mode param, use it (for backwards compatibility)
  if (urlMode === 'admin') {
    return <AdminPanel />
  }

  if (urlMode === 'tv' && !currentMode) {
    return <TVScreen onBackToWelcome={() => {
      setCurrentMode(null)
      window.history.pushState({}, '', '/')
    }} />
  }

  if (urlMode === 'player' && !currentMode) {
    return <PlayerScreen onBackToWelcome={() => {
      setCurrentMode(null)
      window.history.pushState({}, '', '/')
    }} />
  }

  // Normal flow: show welcome screen first
  if (!currentMode) {
    return <WelcomeScreen onSelectMode={setCurrentMode} />
  }

  // Show selected mode
  if (currentMode === 'tv') {
    return <TVScreen onBackToWelcome={() => setCurrentMode(null)} />
  }

  if (currentMode === 'player') {
    return <PlayerScreen onBackToWelcome={() => setCurrentMode(null)} />
  }

  return null
}

export default App