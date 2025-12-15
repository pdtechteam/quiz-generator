import { useState } from 'react'
import TVScreen from './components/TV/TVScreen'
import PlayerScreen from './components/Player/PlayerScreen'
import AdminPanel from './components/Admin/AdminPanel'
import './App.css'

function App() {
  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode')

  if (mode === 'admin') {
    return <AdminPanel />;
  }

  if (mode === 'tv') {
    return <TVScreen />;
  }

  // player mode по умолчанию
  return <PlayerScreen />;
}

export default App