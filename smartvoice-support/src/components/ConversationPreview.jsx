import React from 'react'
import { formatDateTime, getEmotionMeta } from '../utils/helpers'

const ConversationPreview = ({ conversation, onClick, isActive = false }) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1]
  const previewText = lastMessage?.text || 'No messages yet'
  const emotionMeta = getEmotionMeta(conversation.emotion)
  const initials = conversation.userName?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'

  return (
    <button
      onClick={onClick}
      className={`card-lift btn-press w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-300 ${
        isActive
          ? 'border-sky-300 bg-gradient-to-r from-sky-50 to-indigo-50 shadow-sm shadow-sky-100/50'
          : 'border-slate-200 bg-white/95 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isActive ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'
        } transition-all duration-300`}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display truncate text-sm font-semibold text-slate-900">{conversation.userName}</p>
            <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold transition-all duration-300 ${emotionMeta.chipClass}`}>
              {emotionMeta.label}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">{previewText}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">{formatDateTime(conversation.updatedAt || conversation.createdAt)}</p>
        </div>
      </div>
    </button>
  )
}

export default ConversationPreview
