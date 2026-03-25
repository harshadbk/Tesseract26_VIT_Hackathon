import React from 'react'
import { Volume2 } from 'lucide-react'
import { formatTime, getEmotionMeta, speakText } from '../utils/helpers'

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user'
  const emotion = getEmotionMeta(message.emotion)

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} message-fade-in`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm md:max-w-[72%] ${
          isUser ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
          {!isUser && (
            <button
              type="button"
              onClick={() => speakText(message.text, message.emotion)}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              title="Read response aloud"
            >
              <Volume2 size={15} />
            </button>
          )}
        </div>

        <div className={`mt-2 flex items-center justify-between gap-2 text-xs ${isUser ? 'text-slate-200' : 'text-slate-500'}`}>
          <span>{formatTime(message.timestamp)}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${emotion.chipClass}`}>
            {emotion.label}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
