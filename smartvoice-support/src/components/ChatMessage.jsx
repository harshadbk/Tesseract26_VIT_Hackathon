import React from 'react'
import { formatTime, getEmotionMeta, speakText } from '../utils/helpers'

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user'
  const emotion = getEmotionMeta(message.emotion)

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} message-fade-in`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm md:max-w-[72%] ${
          isUser
            ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white'
            : 'border border-slate-200 bg-white text-slate-900 shadow-md'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
          {!isUser && (
            <button
              type="button"
              onClick={() => speakText(message.text, message.emotion)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
              title="Read response aloud"
            >
              Speak
            </button>
          )}
        </div>

        <div className={`mt-2 flex items-center justify-between gap-2 text-xs ${isUser ? 'text-slate-200' : 'text-slate-500'}`}>
          <span>{formatTime(message.timestamp)}</span>
          {isUser ? (
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${emotion.chipClass}`}>
              {emotion.label}
            </span>
          ) : (
            <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500">Assistant</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
