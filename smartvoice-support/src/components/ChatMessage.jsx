import React from 'react'
import { formatTime, getEmotionMeta, speakText } from '../utils/helpers'

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user'
  const emotion = getEmotionMeta(message.emotion)

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} message-fade-in`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 md:max-w-[72%] transition-all duration-300 ${
          isUser
            ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-indigo-900/25'
            : 'border border-slate-200 bg-white text-slate-900 shadow-md hover:shadow-lg hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
          {!isUser && (
            <button
              type="button"
              onClick={() => speakText(message.text, message.emotion)}
              className="btn-press rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-500 transition-all duration-300 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 hover:shadow-sm"
              title="Read response aloud"
            >
              🔊
            </button>
          )}
        </div>

        <div className={`mt-2 flex items-center justify-between gap-2 text-xs ${isUser ? 'text-slate-300' : 'text-slate-500'}`}>
          <span>{formatTime(message.timestamp)}</span>
          {isUser ? (
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium transition-all duration-300 ${emotion.chipClass}`}>
              {emotion.label}
            </span>
          ) : (
            <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500">🤖 Assistant</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
