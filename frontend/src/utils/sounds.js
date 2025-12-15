// ============================================================================
// ЗВУКОВАЯ СИСТЕМА С ПОДДЕРЖКОЙ ФАЙЛОВ И СИНТЕЗА
// ============================================================================
// Пытается загрузить файлы, если не получается - использует синтез
// ============================================================================

class SoundManager {
  constructor() {
    this.sounds = {}
    this.volume = parseFloat(localStorage.getItem('volume') || '0.8')
    this.theme = localStorage.getItem('soundTheme') || 'classic'
    this.audioContext = null
    this.useSynthesis = {} // Отслеживаем какие звуки используют синтез

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

    this.initAudioContext()
    this.preloadSounds()
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {
      console.warn('Web Audio API не поддерживается:', e)
    }
  }

  preloadSounds() {
    const theme = this.themes[this.theme] || this.themes.classic

    Object.entries(theme).forEach(([key, path]) => {
      const audio = new Audio(path)
      audio.volume = this.volume
      audio.preload = 'auto'

      // Если файл не загрузился - пометим для использования синтеза
      audio.onerror = () => {
        console.warn(`Sound file not found: ${path}, будет использован синтез`)
        this.useSynthesis[key] = true
      }

      // Проверяем что файл загрузился
      audio.onloadeddata = () => {
        this.useSynthesis[key] = false
      }

      this.sounds[key] = audio
    })
  }

  play(soundName) {
    // Если нужен синтез или файл не загрузился
    if (this.useSynthesis[soundName]) {
      this.playSynthesized(soundName)
      return
    }

    const sound = this.sounds[soundName]
    if (!sound) {
      console.warn(`Sound not found: ${soundName}, trying synthesis`)
      this.playSynthesized(soundName)
      return
    }

    // Клонируем для одновременного проигрывания
    const clone = sound.cloneNode()
    clone.volume = this.volume
    clone.play().catch(e => {
      console.warn(`Could not play sound ${soundName}:`, e.message, '- using synthesis')
      this.useSynthesis[soundName] = true
      this.playSynthesized(soundName)
    })
  }

  // ========================================
  // СИНТЕЗИРОВАННЫЕ ЗВУКИ (FALLBACK)
  // ========================================

  playSynthesized(soundName) {
    if (!this.audioContext) return

    const synthMap = {
      correct: () => this.synthCorrect(),
      wrong: () => this.synthWrong(),
      tick: () => this.synthTick(),
      reveal: () => this.synthReveal(),
      tap: () => this.synthTap(),
    }

    const synthFunction = synthMap[soundName]
    if (synthFunction) {
      synthFunction()
    } else {
      console.warn(`No synthesis available for: ${soundName}`)
    }
  }

  synthCorrect() {
    const ctx = this.audioContext
    const now = ctx.currentTime

    // Восходящая мелодия C-E-G
    const frequencies = [523.25, 659.25, 783.99]

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.frequency.value = freq
      osc.type = 'sine'

      gain.gain.setValueAtTime(0, now + i * 0.1)
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + i * 0.1 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3)

      osc.start(now + i * 0.1)
      osc.stop(now + i * 0.1 + 0.3)
    })
  }

  synthWrong() {
    const ctx = this.audioContext
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.3)
    osc.type = 'sawtooth'

    gain.gain.setValueAtTime(this.volume * 0.4, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

    osc.start(now)
    osc.stop(now + 0.3)
  }

  synthTick() {
    const ctx = this.audioContext
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.value = 800
    osc.type = 'sine'

    gain.gain.setValueAtTime(this.volume * 0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)

    osc.start(now)
    osc.stop(now + 0.05)
  }

  synthReveal() {
    const ctx = this.audioContext
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.4)
    osc.type = 'triangle'

    gain.gain.setValueAtTime(this.volume * 0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)

    osc.start(now)
    osc.stop(now + 0.4)
  }

  synthTap() {
    const ctx = this.audioContext
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.value = 1000
    osc.type = 'sine'

    gain.gain.setValueAtTime(this.volume * 0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)

    osc.start(now)
    osc.stop(now + 0.08)
  }

  // ========================================
  // УПРАВЛЕНИЕ
  // ========================================

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
    this.useSynthesis = {}
    this.preloadSounds()
  }
}

// Создаём singleton
const soundManager = new SoundManager()

export const playSound = (name) => soundManager.play(name)
export const setVolume = (volume) => soundManager.setVolume(volume)
export const setSoundTheme = (theme) => soundManager.setTheme(theme)

export default soundManager