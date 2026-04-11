import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

export default function TTSButton({ text, className = "" }) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const { language } = useApp()

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const toggleSpeech = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Map our language codes to TTS language codes
    const langMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN'
    }
    
    utterance.lang = langMap[language] || 'en-IN'
    
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <button
      onClick={toggleSpeech}
      className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
        isSpeaking 
          ? 'bg-purple-500 text-white shadow-lg glow-purple animate-pulse' 
          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
      } ${className}`}
      title={isSpeaking ? "Stop listening" : "Listen to this"}
    >
      <span className="text-lg leading-none">{isSpeaking ? '⏹' : '🔊'}</span>
    </button>
  )
}
