class SoundManager {
  constructor() {
    this.sounds = {}
    this.volume = parseFloat(localStorage.getItem('volume') || '0.8')
    this.theme = localStorage.getItem('soundTheme') || 'classic'
    
    // Определение звуковых тем
    this.themes = {
      classic: {
        correct: '/sounds/correct.mp3',
        wrong: '/sounds/wrong.mp3',
        tick: '/sounds/tick.mp3',
        reveal: '/sounds/reveal.mp3',
        tap: '/sounds/tap.mp3',
      },
      // Можно добавить другие темы позже
    }
    
    this.preloadSounds()
  }

  preloadSounds() {
    const theme = this.themes[this.theme] || this.themes.classic
    
    Object.entries(theme).forEach(([key, path]) => {
      const audio = new Audio(path)
      audio.volume = this.volume
      audio.preload = 'auto'
      
      // Обработка ошибок загрузки (звуковые файлы могут отсутствовать)
      audio.onerror = () => {
        console.warn(`Sound file not found: ${path}`)
      }
      
      this.sounds[key] = audio
    })
  }

  play(soundName) {
    const sound = this.sounds[soundName]
    if (!sound) {
      console.warn(`Sound not found: ${soundName}`)
      return
    }
    
    // Клонируем для одновременного проигрывания
    const clone = sound.cloneNode()
    clone.volume = this.volume
    clone.play().catch(e => {
      console.warn(`Could not play sound ${soundName}:`, e.message)
    })
  }

  setVolume(newVolume) {
    this.volume = Math.max(0, Math.min(1, newVolume))
    localStorage.setItem('volume', this.volume)
    
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume
    })
  }

  setTheme(themeName) {
    if (!this.themes[themeName]) {
      console.warn(`Theme not found: ${themeName}`)
      return
    }
    
    this.theme = themeName
    localStorage.setItem('soundTheme', themeName)
    this.sounds = {}
    this.preloadSounds()
  }
}

// Создаём singleton
const soundManager = new SoundManager()

export const playSound = (name) => soundManager.play(name)
export const setVolume = (volume) => soundManager.setVolume(volume)
export const setSoundTheme = (theme) => soundManager.setTheme(theme)

export default soundManager