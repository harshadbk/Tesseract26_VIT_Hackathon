import React, { useMemo, useRef, useState, useEffect } from 'react'
import { createSpeechRecognition, getEmotionMeta, supportsSpeechRecognition } from '../utils/helpers'
import { useConversation } from '../context/ConversationContext'

const ChatInput = ({ onSendMessage, emotion = 'calm', isLoading = false }) => {
  const { isSpeaking } = useConversation()
  const [message, setMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [autoVoice, setAutoVoice] = useState(false)
  const [speechError, setSpeechError] = useState('')
  const recognitionRef = useRef(null)
  const autoSendTimeoutRef = useRef(null)
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
        if (isFinal) {
          if (autoVoice) {
            // Give the UI a tiny moment to show the final text before sending
            clearTimeout(autoSendTimeoutRef.current)
            autoSendTimeoutRef.current = setTimeout(() => {
              onSendMessage(text)
              setMessage('')
              stopListening()
            }, 500)
          } else {
            setIsListening(false)
          }
        }
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

  // Handle Automatic Voice Lifecycle
  React.useEffect(() => {
    if (!autoVoice || !speechEnabled) {
      if (isListening) stopListening()
      return
    }

    // Anti-Feedback: Stop listening when AI speaks or is processing
    if (isSpeaking || isLoading) {
      if (isListening) stopListening()
    } else {
      // Auto-Start listening when AI is silent and ready
      if (!isListening) {
        handleVoiceToggle()
      }
    }

    return () => {
      clearTimeout(autoSendTimeoutRef.current)
    }
  }, [autoVoice, isSpeaking, isLoading, speechEnabled])

  const handleSubmit = (event) => {
    event.preventDefault()
    const value = message.trim()
    if (!value || isLoading) return

    onSendMessage(value)
    setMessage('')
    stopListening()
  }

  return (
    <div className="border-t border-slate-200/60 bg-white/85 px-4 py-3 backdrop-blur-lg enter-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Voice + text input enabled
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-all duration-300 ${emotionMeta.chipClass}`}>
          Emotion: {emotionMeta.label}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleVoiceToggle}
          disabled={!speechEnabled || isLoading}
          className={`btn-press relative h-11 rounded-xl border px-3.5 text-xs font-semibold transition-all duration-300 ${
            isListening
              ? 'border-rose-300 bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 mic-glow'
              : 'border-slate-200 bg-gradient-to-r from-sky-50 to-indigo-50 text-slate-700 hover:border-slate-300 hover:from-sky-100 hover:to-indigo-100 hover:shadow-md'
          } disabled:cursor-not-allowed disabled:opacity-60`}
          title={speechEnabled ? 'Start/stop voice input' : 'Speech recognition is not supported in this browser'}
        >
          {isListening ? '🔴 Stop' : '🎤 Voice'}
        </button>

        <button
          type="button"
          onClick={() => setAutoVoice(!autoVoice)}
          disabled={!speechEnabled}
          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
            autoVoice
              ? 'border-sky-300 bg-sky-100 text-sky-700 shadow-sm shadow-sky-200'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
          }`}
          title="Enable hands-free conversation"
        >
          {autoVoice ? 'Auto-Voice: ON' : 'Auto-Voice: OFF'}
        </button>

        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Describe your issue (order delay, refund, wrong product)..."
          className="h-11 flex-1 rounded-xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-800 outline-none transition-all duration-300 focus:border-sky-400 focus:bg-white focus:shadow-lg focus:shadow-sky-100/50"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="btn-press h-11 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-900 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:from-slate-800 hover:to-indigo-800 hover:shadow-xl hover:shadow-indigo-900/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          title="Send message"
        >
          Send ➤
        </button>
      </form>

      {!speechEnabled && (
        <p className="mt-2 text-xs text-amber-700 soft-appear">Voice recognition is unavailable in this browser. Use Chrome/Edge for mic-to-text.</p>
      )}
      {isListening && <p className="mt-2 text-xs font-medium text-rose-700">Listening... speak clearly, then press mic again to stop.</p>}
      {!!speechError && <p className="mt-2 text-xs font-medium text-rose-700">{speechError}</p>}
    </div>
  )
}

export default ChatInput
