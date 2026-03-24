import React, { useState, useRef, useEffect } from 'react'
import { Mic, Send, Copy, Phone } from 'lucide-react'
import { startRecording, stopRecording, speakText, getEmotionEmoji } from '../utils/helpers'
import { transcribeAudio, getBotResponse } from '../services/api'

const ChatInput = ({ onSendMessage, emotion, isLoading }) => {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const mediaRecorderRef = useRef(null)

  // Handle text input submit
  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message)
      setMessage('')
    }
  }

  // Handle voice input
  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording
      stopRecording(mediaRecorderRef.current)
      setIsRecording(false)
    } else {
      // Start recording
      setIsRecording(true)
      mediaRecorderRef.current = await startRecording(async (audioBlob) => {
        try {
          const response = await transcribeAudio(audioBlob)
          if (response.text) {
            onSendMessage(response.text)
          }
        } catch (error) {
          console.error('Error transcribing audio:', error)
        }
      })
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Emotion indicator */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Detected Emotion:</span>
        <span className="text-2xl">{getEmotionEmoji(emotion)}</span>
        <span className="text-sm font-medium text-gray-700 capitalize">{emotion}</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Text input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading || isRecording}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:bg-gray-50 disabled:text-gray-400"
        />

        {/* Voice button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={isLoading}
          className={`rounded-lg p-3 transition-all ${
            isRecording
              ? 'bg-red-500 text-white voice-pulse'
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          <Mic size={20} />
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="rounded-lg bg-primary p-3 text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </form>

      {/* Recording indicator */}
      {isRecording && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-600"></div>
          Recording...
        </div>
      )}
    </div>
  )
}

export default ChatInput
