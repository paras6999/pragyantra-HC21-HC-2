import { useState, useRef, useEffect } from 'react'

const QUICK_CHIPS = [
  'What is ADIP scheme?',
  'How to get disability certificate?',
  'Scholarship for disabled students',
  'Disability pension eligibility',
]

export default function ChatbotWidget() {
  const [isOpen, setIsOpen]     = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Namaste! 👋 I am **Sahayak**, your AI disability scheme assistant powered by Google Gemini. How can I help you today?' }
  ])
  const [inputMsg, setInputMsg] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError]       = useState(null)
  const messagesEndRef           = useRef(null)
  const inputRef                 = useRef(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => { scrollToBottom() }, [messages, isTyping])
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 300) }, [isOpen])

  /** Render simple markdown: **bold**, bullet lists */
  const renderText = (text) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      // Bold
      const parts = line.split(/\*\*(.*?)\*\*/g)
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      )
      // Bullet
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return <li key={i} className="ml-3 list-disc">{rendered.slice(1)}</li>
      }
      return <span key={i}>{rendered}{i < lines.length - 1 && <br />}</span>
    })
  }

  const sendMessage = async (text) => {
    if (!text.trim() || isTyping) return
    const userText = text.trim()
    setError(null)

    // Build history for multi-turn context (exclude the initial bot greeting)
    const history = messages.slice(1).map(m => ({ role: m.role === 'user' ? 'user' : 'bot', text: m.text }))

    setMessages(prev => [...prev, { role: 'user', text: userText }])
    setInputMsg('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history })
      })
      const data = await res.json()

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'bot', text: data.reply }])
      } else {
        throw new Error(data.error || 'Empty response from server')
      }
    } catch (err) {
      const errMsg = "Sorry, I'm having trouble connecting right now. Please try again in a moment."
      setMessages(prev => [...prev, { role: 'bot', text: errMsg }])
      setError(err.message)
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    sendMessage(inputMsg)
  }

  const handleChip = (chip) => {
    sendMessage(chip)
  }

  const clearChat = () => {
    setMessages([{ role: 'bot', text: 'Chat cleared! How can I help you with disability schemes?' }])
    setError(null)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="chatbot-toggle"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-50 animate-float"
        style={{ background: 'linear-gradient(135deg, #1a3569 0%, #FF6600 100%)' }}
        aria-label="Open AI Assistant"
      >
        <span className="text-2xl">{isOpen ? '✖' : '💬'}</span>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 w-80 md:w-96 rounded-xl border border-gov-border shadow-gov-lg overflow-hidden transition-all duration-300 z-50 flex flex-col bg-white ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto h-[540px] max-h-[75vh]' : 'opacity-0 translate-y-10 pointer-events-none h-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gov-border flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1a3569 0%, #2a4a8a 100%)' }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-lg">♿</div>
            <div>
              <h3 className="font-bold text-white leading-tight text-sm">Sahayak AI Assistant</h3>
              <p className="text-white/60 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                Ministry of Social Justice &amp; Empowerment
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="text-white/50 hover:text-white text-xs transition-colors px-2 py-1 rounded hover:bg-white/10"
            title="Clear chat"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5F7FA]" id="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="w-6 h-6 rounded-full bg-purple-600/50 flex items-center justify-center text-xs mr-1.5 flex-shrink-0 mt-1">🤖</div>
              )}
              <div
                className={`max-w-[82%] p-3 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#1a3569] text-white rounded-tr-sm shadow'
                    : 'bg-white text-[#1A2332] rounded-tl-sm border border-gov-border shadow-sm'
                }`}
              >
                {msg.role === 'bot' ? renderText(msg.text) : msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-purple-600/50 flex items-center justify-center text-xs mr-1.5 mt-1">🤖</div>
              <div className="bg-white border border-gov-border p-3 rounded-xl rounded-tl-sm text-sm text-gov-muted flex items-center gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips — shown only when just 1 message (the greeting) */}
        {messages.length === 1 && !isTyping && (
          <div className="px-3 pb-2 flex gap-2 flex-wrap bg-[#EEF2FF] pt-2 flex-shrink-0 border-t border-gov-border">
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => handleChip(chip)}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#1a3569]/30 text-[#1a3569] hover:bg-[#1a3569] hover:text-white transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="p-3 border-t border-gov-border bg-white flex-shrink-0">
          {error && (
            <p className="text-red-600 text-xs mb-2 px-1">⚠️ {error}</p>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              id="chatbot-input"
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              placeholder="Ask about disability schemes..."
              disabled={isTyping}
              className="flex-1 gov-input py-2 disabled:opacity-50"
            />
            <button
              type="submit"
              id="chatbot-send"
              disabled={!inputMsg.trim() || isTyping}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow"
              style={{ background: 'linear-gradient(135deg, #1a3569, #FF6600)' }}
            >
              ➤
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
