import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

export default function VoiceButton({ onResult, compact = false }) {
  const [isListening, setIsListening]   = useState(false)
  const [error, setError]               = useState(null)
  const [interim, setInterim]           = useState('')
  const [supported, setSupported]       = useState(true)
  const recogRef = useRef(null)
  const { t, language } = useApp()

  const langMap = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' }

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) setSupported(false)
  }, [])

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError('Voice input is not supported in this browser. Please use Chrome.')
      return
    }

    setError(null)
    setInterim('')

    try {
      const recognition = new SR()
      recognition.lang            = langMap[language] || 'en-IN'
      recognition.continuous      = false
      recognition.interimResults  = true
      recognition.maxAlternatives = 1
      recogRef.current            = recognition

      recognition.onstart = () => setIsListening(true)

      recognition.onend = () => {
        setIsListening(false)
        setInterim('')
      }

      recognition.onerror = (e) => {
        setIsListening(false)
        setInterim('')
        if (e.error === 'not-allowed' || e.error === 'permission-denied') {
          setError('Microphone access denied. Please allow microphone in your browser settings.')
        } else if (e.error === 'no-speech') {
          setError('No speech detected. Please try speaking again.')
        } else if (e.error === 'network') {
          setError('Network error. Please check your internet connection.')
        } else if (e.error === 'audio-capture') {
          setError('No microphone found. Please connect a microphone.')
        } else {
          setError(`Voice error: ${e.error}. Please try again.`)
        }
      }

      recognition.onresult = (e) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            finalTranscript += e.results[i][0].transcript
          } else {
            interimTranscript += e.results[i][0].transcript
          }
        }

        if (interimTranscript) setInterim(interimTranscript)

        if (finalTranscript) {
          const clean = finalTranscript.toLowerCase().trim()
          setIsListening(false)
          setInterim('')
          onResult(clean)
        }
      }

      recognition.start()
    } catch (err) {
      setIsListening(false)
      setError('Could not start voice recognition. Please try again.')
    }
  }

  const stop = () => {
    recogRef.current?.stop()
    setIsListening(false)
    setInterim('')
  }

  if (!supported) {
    return (
      <div className={`flex flex-col items-center gap-1 ${compact ? '' : 'mt-2'}`}>
        <button
          disabled
          title="Voice input not supported in this browser. Use Chrome."
          className={`relative flex items-center justify-center rounded-full opacity-40 cursor-not-allowed
            ${compact ? 'w-10 h-10 text-base' : 'w-12 h-12 text-xl'}
            bg-gray-200 text-gray-500`}
        >
          🎤
        </button>
        {!compact && <p className="text-[#5C6B7A] text-xs text-center border bg-white p-1 rounded">Use Chrome for voice</p>}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center gap-1 ${compact ? '' : 'mt-2'}`}>
      <button
        onClick={isListening ? stop : startListening}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        title={isListening ? 'Click to stop' : 'Click to speak'}
        className={`relative flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF6600]
          ${compact ? 'w-10 h-10 text-base' : 'w-12 h-12 text-xl'}
          ${isListening
            ? 'bg-red-100 text-red-600 shadow-lg scale-110 border-2 border-red-500'
            : 'bg-[#1a3569] hover:bg-[#0d1f3c] text-white shadow-md hover:scale-105'
          }`}
      >
        {isListening ? '⏹' : '🎤'}
        {isListening && (
          <span className="absolute inset-0 rounded-full border border-red-400 animate-pulse" />
        )}
      </button>

      {isListening && (
        <p className="text-[#FF6600] text-xs animate-pulse font-bold">{t('speak_now') || 'Listening...'}</p>
      )}

      {interim && (
        <p className="text-[#1a3569] font-medium text-xs italic max-w-xs text-center truncate bg-white border border-[#1a3569]/20 px-2 py-1 rounded shadow-sm">"{interim}"</p>
      )}

      {error && (
        <p className="text-red-600 text-xs text-center max-w-xs leading-relaxed bg-red-50 border border-red-200 px-2 py-1 rounded shadow-sm">{error}</p>
      )}
    </div>
  )
}
