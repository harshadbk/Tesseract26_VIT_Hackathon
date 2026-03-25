import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, Filter, UserCheck } from 'lucide-react'
import EscalationCard from '../components/EscalationCard'
import StatsCard from '../components/StatsCard'
import { useConversation } from '../context/ConversationContext'

const AgentDashboard = () => {
  const navigate = useNavigate()
  const { escalations, assignEscalation, resolveEscalation } = useConversation()
  const [statusFilter, setStatusFilter] = useState('all')
  const [emotionFilter, setEmotionFilter] = useState('all')

  const filteredEscalations = useMemo(() => {
    return escalations.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesEmotion = emotionFilter === 'all' || item.emotion === emotionFilter
      return matchesStatus && matchesEmotion
    })
  }, [escalations, emotionFilter, statusFilter])

  const stats = useMemo(
    () => ({
      total: escalations.length,
      pending: escalations.filter((item) => item.status === 'pending').length,
      assigned: escalations.filter((item) => item.status === 'assigned').length,
      resolved: escalations.filter((item) => item.status === 'resolved').length,
      highEmotion: escalations.filter((item) => item.emotion === 'angry' || item.emotion === 'frustrated').length
    }),
    [escalations]
  )

  return (
    <div className="min-h-screen bg-app px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-4 rounded-3xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-xl border border-slate-300 bg-white p-2 text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                title="Back to chat"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Human Agent Dashboard</h1>
                <p className="text-sm text-slate-500">Review escalated cases and complete handoff workflows.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Escalated Cases</p>
              <p className="text-2xl font-extrabold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </header>

        <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatsCard icon={AlertTriangle} label="Total" value={stats.total} color="slate" />
          <StatsCard icon={Clock} label="Pending" value={stats.pending} color="orange" />
          <StatsCard icon={UserCheck} label="Assigned" value={stats.assigned} color="blue" />
          <StatsCard icon={CheckCircle} label="Resolved" value={stats.resolved} color="green" />
          <StatsCard icon={AlertTriangle} label="High Emotion" value={stats.highEmotion} color="red" />
        </section>

        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Filters</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-sky-400"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={emotionFilter}
              onChange={(event) => setEmotionFilter(event.target.value)}
              className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-sky-400"
            >
              <option value="all">All emotions</option>
              <option value="angry">Angry</option>
              <option value="frustrated">Frustrated</option>
              <option value="calm">Calm</option>
              <option value="confused">Confused</option>
              <option value="happy">Happy</option>
            </select>
          </div>
        </section>

        {filteredEscalations.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
            <p className="text-base font-semibold text-slate-800">No cases match the current filters.</p>
            <p className="mt-2 text-sm">When escalations are triggered in chat, they will appear here automatically.</p>
          </section>
        ) : (
          <section className="grid gap-4 lg:grid-cols-2">
            {filteredEscalations.map((escalation) => (
              <EscalationCard
                key={escalation.id}
                escalation={escalation}
                onAssign={assignEscalation}
                onResolve={resolveEscalation}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  )
}

export default AgentDashboard
