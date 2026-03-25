import React, { useMemo, useRef, useState } from 'react'
import { Mic, MicOff, Send } from 'lucide-react'
import { createSpeechRecognition, getEmotionMeta, supportsSpeechRecognition } from '../utils/helpers'

const ChatInput = ({ onSendMessage, emotion = 'calm', isLoading = false }) => {
  const [message, setMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState('')
  const recognitionRef = useRef(null)
  const speechEnabled = useMemo(() => supportsSpeechRecognition(), [])
  const emotionMeta = getEmotionMeta(emotion)

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const handleVoiceToggle = () => {
    if (!speechEnabled || isLoading) return

    if (isListening) {
      stopListening()
      return
    }

    setSpeechError('')

    const recognition = createSpeechRecognition(
      (text, isFinal) => {
        setMessage(text)
        if (isFinal) setIsListening(false)
      },
      (errorType) => {
        if (errorType === 'not-allowed' || errorType === 'service-not-allowed') {
          setSpeechError('Microphone permission denied. Please allow mic access in browser settings.')
        } else if (errorType === 'no-speech') {
          setSpeechError('No clear speech detected. Please try again and speak a little louder.')
        } else {
          setSpeechError('Voice input failed. Please retry, or type your message.')
        }
        setIsListening(false)
      },
      () => {
        setIsListening(false)
      }
    )

    if (!recognition) return
    recognitionRef.current = recognition
    setIsListening(true)
    recognition.start()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const value = message.trim()
    if (!value || isLoading) return

    onSendMessage(value)
    setMessage('')
    stopListening()
  }

  return (
    <div className="border-t border-slate-200 bg-white/90 px-4 py-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-xs text-slate-500">Voice + text input enabled</div>
        <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${emotionMeta.chipClass}`}>
          Emotion: {emotionMeta.label}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleVoiceToggle}
          disabled={!speechEnabled || isLoading}
          className={`relative rounded-xl border p-3 transition ${
            isListening
              ? 'border-rose-300 bg-rose-100 text-rose-700 voice-pulse'
              : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200'
          } disabled:cursor-not-allowed disabled:opacity-60`}
          title={speechEnabled ? 'Start/stop voice input' : 'Speech recognition is not supported in this browser'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Describe your issue (order delay, refund, wrong product)..."
          className="h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="h-12 rounded-xl bg-slate-900 px-4 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          title="Send message"
        >
          <Send size={18} />
        </button>
      </form>

      {!speechEnabled && (
        <p className="mt-2 text-xs text-amber-700">Voice recognition is unavailable in this browser. Use Chrome/Edge for mic-to-text.</p>
      )}
      {isListening && <p className="mt-2 text-xs font-medium text-rose-700">Listening... speak clearly, then press mic again to stop.</p>}
      {!!speechError && <p className="mt-2 text-xs font-medium text-rose-700">{speechError}</p>}
    </div>
  )
}

export default ChatInput
