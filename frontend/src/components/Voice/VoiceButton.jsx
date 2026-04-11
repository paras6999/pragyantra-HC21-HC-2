import { useState, useRef } from 'react'
import { useApp } from '../../context/AppContext'

export default function VoiceButton({ onResult, compact = false }) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError]             = useState(null)
  const recogRef = useRef(null)
  const { t, language }               = useApp()

  const langMap = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' }

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError(t('error_voice'))
      return
    }

    setError(null)
    const recognition = new SR()
    recognition.lang             = langMap[language] || 'en-IN'
    recognition.continuous       = false
    recognition.interimResults   = false
    recognition.maxAlternatives  = 1
    recogRef.current             = recognition

    recognition.onstart  = () => setIsListening(true)
    recognition.onend    = () => setIsListening(false)
    recognition.onerror  = () => { setIsListening(false); setError('Could not hear you. Try again.') }
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.toLowerCase().trim()
      setIsListening(false)
      onResult(transcript)
    }
    recognition.start()
  }

  const stop = () => {
    recogRef.current?.stop()
    setIsListening(false)
  }

  return (
    <div className={`flex flex-col items-center gap-1 ${compact ? '' : 'mt-2'}`}>
      <button
        onClick={isListening ? stop : startListening}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        className={`relative flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400
          ${compact ? 'w-10 h-10 text-base' : 'w-12 h-12 text-xl'}
          ${isListening
            ? 'bg-red-500 shadow-lg shadow-red-500/40 scale-110'
            : 'bg-purple-600/80 hover:bg-purple-600 hover:scale-105 glow-purple'
          }`}
      >
        {isListening ? '⏹' : '🎤'}
        {isListening && (
          <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-pulse-ring" />
        )}
      </button>

      {isListening && (
        <p className="text-purple-300 text-xs animate-pulse">{t('speak_now')}</p>
      )}
      {error && (
        <p className="text-red-400 text-xs text-center max-w-xs">{error}</p>
      )}
    </div>
  )
}
