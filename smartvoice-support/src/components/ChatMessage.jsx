import React from 'react'
import { formatTime, getEmotionColor } from '../utils/helpers'

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} message-fade-in`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="text-sm break-words">{message.text}</p>
        <div className={`mt-1 flex items-center justify-between gap-2 text-xs ${
          isUser ? 'text-white/70' : 'text-gray-500'
        }`}>
          <span>{formatTime(message.timestamp)}</span>
          {!isUser && message.emotion && (
            <span className={`capitalize ${getEmotionColor(message.emotion)}`}>
              {message.emotion}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
