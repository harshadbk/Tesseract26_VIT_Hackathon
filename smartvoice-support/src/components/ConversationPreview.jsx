import React from 'react'
import { MessageSquare } from 'lucide-react'
import { formatDateTime, getEmotionMeta } from '../utils/helpers'

const ConversationPreview = ({ conversation, onClick, isActive = false }) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1]
  const previewText = lastMessage?.text || 'No messages yet'
  const emotionMeta = getEmotionMeta(conversation.emotion)

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
        isActive
          ? 'border-sky-300 bg-sky-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">{conversation.userName}</p>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${emotionMeta.chipClass}`}>
              {emotionMeta.label}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-600">{previewText}</p>
          <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(conversation.updatedAt || conversation.createdAt)}</p>
        </div>
        <MessageSquare size={16} className="mt-0.5 shrink-0 text-slate-400" />
      </div>
    </button>
  )
}

export default ConversationPreview
