import React from 'react'
import { ChevronRight } from 'lucide-react'
import { formatTime, getEmotionEmoji } from '../utils/helpers'

const ConversationPreview = ({ conversation, onClick }) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1]
  const messagePreview = lastMessage?.text || 'No messages yet'
  const truncated = messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-primary hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{conversation.userName}</h4>
            <span className="text-lg">{getEmotionEmoji(conversation.emotion)}</span>
          </div>
          <p className="text-sm text-gray-600 truncate">{truncated}</p>
          {lastMessage && (
            <p className="mt-1 text-xs text-gray-500">{formatTime(lastMessage.timestamp)}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <ChevronRight size={20} className="text-gray-400" />
          {conversation.isEscalated && (
            <span className="inline-block rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
              Escalated
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

export default ConversationPreview
