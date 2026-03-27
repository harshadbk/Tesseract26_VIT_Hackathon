import React, { useMemo, useState } from 'react'
import { formatDateTime, getEmotionMeta } from '../utils/helpers'

const statusMeta = {
  pending: { label: '⏳ Pending', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⏳' },
  assigned: { label: '👤 Assigned', className: 'bg-sky-100 text-sky-700 border-sky-200', icon: '👤' },
  resolved: { label: '✅ Resolved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '✅' }
}

const demoAgents = ['Ava Brown', 'Noah Hall', 'Mia Lewis', 'Liam Carter']

const EscalationCard = ({ escalation, onAssign, onResolve }) => {
  const [selectedAgent, setSelectedAgent] = useState('')
  const [resolution, setResolution] = useState('')
  const status = statusMeta[escalation.status] || statusMeta.pending
  const emotionMeta = getEmotionMeta(escalation.emotion)

  const stepsSummary = useMemo(() => {
    const userMessages = escalation.messages?.filter((item) => item.sender === 'user') || []
    const botMessages = escalation.messages?.filter((item) => item.sender === 'bot') || []
    return {
      attempts: botMessages.length,
      userTurns: userMessages.length
    }
  }, [escalation.messages])

  return (
    <article className="card-lift panel-surface vivid-surface tone-sky flex flex-col rounded-2xl p-5 border-2 border-transparent hover:border-sky-200 transition-all duration-300">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900">{escalation.userName}</h3>
          <p className="text-xs text-slate-500">User ID: {escalation.userId}</p>
        </div>
        <span className={`scale-in inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all duration-300 ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2 enter-2">
          <p className="text-[11px] font-semibold uppercase text-slate-500">Emotion</p>
          <p className={`mt-1 text-sm font-semibold transition-all duration-500 ${emotionMeta.toneClass}`}>{emotionMeta.label}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2 enter-2">
          <p className="text-[11px] font-semibold uppercase text-slate-500">Attempts</p>
          <p className="mt-1 text-sm font-semibold text-slate-800 number-pop">{stepsSummary.attempts}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2 enter-3">
          <p className="text-[11px] font-semibold uppercase text-slate-500">User Turns</p>
          <p className="mt-1 text-sm font-semibold text-slate-800 number-pop">{stepsSummary.userTurns}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2 enter-3">
          <p className="text-[11px] font-semibold uppercase text-slate-500">Escalated At</p>
          <p className="mt-1 text-xs font-semibold text-slate-700">{formatDateTime(escalation.createdAt)}</p>
        </div>
      </div>

      <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 enter-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">📝 Issue Summary</p>
        <div className="mt-2 max-h-20 overflow-y-auto pr-1">
          <p className="text-sm leading-6 text-slate-700">{escalation.summary}</p>
        </div>
      </div>

      <div className="mb-3 flex flex-col rounded-xl border border-slate-200 bg-white p-3 enter-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">💬 Conversation History</p>
        <div className="mt-2 max-h-48 space-y-2 overflow-y-auto overscroll-contain pr-1">
          {(escalation.messages || []).map((message, idx) => (
            <div
              key={message.id || `${message.sender}-${message.timestamp || idx}`}
              className={`rounded-lg px-3 py-2 text-xs leading-5 transition-all duration-200 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-150'
              }`}
            >
              <p className="mb-1 font-semibold">{message.sender === 'user' ? '👤 Customer' : '🤖 AI Agent'}</p>
              <p>{message.text}</p>
            </div>
          ))}
        </div>
      </div>

      {escalation.status === 'pending' && (
        <div className="space-y-2 soft-appear">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">👤 Assign Agent</label>
          <select
            value={selectedAgent}
            onChange={(event) => setSelectedAgent(event.target.value)}
            className="btn-press h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition-all duration-300 focus:border-sky-400 focus:shadow-lg focus:shadow-sky-100/50"
          >
            <option value="">Select an agent</option>
            {demoAgents.map((agent) => (
              <option key={agent} value={agent}>
                {agent}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => selectedAgent && onAssign(escalation.id, selectedAgent)}
            disabled={!selectedAgent}
            className="btn-press h-10 w-full rounded-xl bg-gradient-to-r from-slate-900 to-indigo-900 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:from-slate-800 hover:to-indigo-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            Assign Case ➤
          </button>
        </div>
      )}

      {escalation.status === 'assigned' && (
        <div className="space-y-2 soft-appear">
          <p className="text-sm font-medium text-slate-700">
            Assigned to: <span className="font-bold text-sky-700">{escalation.assignedAgent}</span>
          </p>
          <textarea
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            placeholder="Write how this issue was resolved..."
            className="min-h-20 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-700 outline-none transition-all duration-300 focus:border-emerald-400 focus:shadow-lg focus:shadow-emerald-100/50"
          />
          <button
            type="button"
            onClick={() => resolution.trim() && onResolve(escalation.id, resolution.trim())}
            disabled={!resolution.trim()}
            className="btn-press h-10 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            ✅ Mark Resolved
          </button>
        </div>
      )}

      {escalation.status === 'resolved' && (
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-3 soft-appear">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">✅ Resolution</p>
          <div className="mt-2 max-h-20 overflow-y-auto pr-1">
            <p className="text-sm text-emerald-800">{escalation.resolution || 'Resolved by agent.'}</p>
          </div>
        </div>
      )}
    </article>
  )
}

export default EscalationCard
