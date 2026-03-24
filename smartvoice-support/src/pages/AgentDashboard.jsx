import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Filter, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useConversation } from '../context/ConversationContext'
import EscalationCard from '../components/EscalationCard'
import StatsCard from '../components/StatsCard'

const AgentDashboard = () => {
  const navigate = useNavigate()
  const { escalations, assignEscalation, resolveEscalation } = useConversation()
  const [statusFilter, setStatusFilter] = useState('all')
  const [emotionFilter, setEmotionFilter] = useState('all')

  // Filter escalations
  const filteredEscalations = useMemo(() => {
    return escalations.filter(esc => {
      const statusMatch = statusFilter === 'all' || esc.status === statusFilter
      const emotionMatch = emotionFilter === 'all' || esc.emotion === emotionFilter
      return statusMatch && emotionMatch
    })
  }, [escalations, statusFilter, emotionFilter])

  // Calculate stats
  const stats = {
    total: escalations.length,
    pending: escalations.filter(e => e.status === 'pending').length,
    assigned: escalations.filter(e => e.status === 'assigned').length,
    resolved: escalations.filter(e => e.status === 'resolved').length,
    angry: escalations.filter(e => e.emotion === 'angry').length,
    frustrated: escalations.filter(e => e.emotion === 'frustrated').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
                <p className="text-sm text-gray-600">Manage escalated customer issues</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Escalated Cases</p>
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          <StatsCard
            icon={AlertCircle}
            label="Total Cases"
            value={stats.total}
            color="purple"
          />
          <StatsCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            color="blue"
          />
          <StatsCard
            icon={AlertCircle}
            label="Assigned"
            value={stats.assigned}
            color="orange"
          />
          <StatsCard
            icon={CheckCircle}
            label="Resolved"
            value={stats.resolved}
            color="green"
          />
          <StatsCard
            icon={AlertCircle}
            label="Angry Customers"
            value={stats.angry}
            color="red"
          />
          <StatsCard
            icon={AlertCircle}
            label="Frustrated"
            value={stats.frustrated}
            color="orange"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Emotion filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Emotion
              </label>
              <select
                value={emotionFilter}
                onChange={(e) => setEmotionFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="all">All Emotions</option>
                <option value="angry">Angry</option>
                <option value="frustrated">Frustrated</option>
                <option value="calm">Calm</option>
                <option value="confused">Confused</option>
              </select>
            </div>
          </div>

          {/* Active filters */}
          {(statusFilter !== 'all' || emotionFilter !== 'all') && (
            <div className="mt-3 flex flex-wrap gap-2">
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {emotionFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                  Emotion: {emotionFilter}
                  <button
                    onClick={() => setEmotionFilter('all')}
                    className="ml-1 hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Escalations list */}
        <div className="space-y-4">
          {filteredEscalations.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <div className="mb-4 text-5xl">✅</div>
              <h3 className="text-lg font-semibold text-gray-900">All caught up!</h3>
              <p className="mt-2 text-gray-600">
                {escalations.length === 0
                  ? 'No escalated cases yet'
                  : 'All cases matching your filters have been handled'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Escalated Cases ({filteredEscalations.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredEscalations.map(escalation => (
                  <EscalationCard
                    key={escalation.id}
                    escalation={escalation}
                    onAssign={assignEscalation}
                    onResolve={resolveEscalation}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgentDashboard
