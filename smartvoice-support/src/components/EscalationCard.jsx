import React from 'react'
import { AlertCircle, CheckCircle, Clock, User, MessageSquare, Zap } from 'lucide-react'
import { formatDate, getEmotionEmoji } from '../utils/helpers'

const EscalationCard = ({
  escalation,
  onAssign,
  onResolve
}) => {
  const [selectedAgent, setSelectedAgent] = React.useState('')
  const [resolution, setResolution] = React.useState('')

  const agents = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Anderson']

  const statusConfig = {
    pending: { color: 'bg-yellow-50', icon: Clock, label: 'Pending', borderColor: 'border-yellow-400' },
    assigned: { color: 'bg-blue-50', icon: User, label: 'Assigned', borderColor: 'border-blue-400' },
    resolved: { color: 'bg-green-50', icon: CheckCircle, label: 'Resolved', borderColor: 'border-green-400' }
  }

  const config = statusConfig[escalation.status] || statusConfig.pending
  const StatusIcon = config.icon

  // Get insights from conversation
  const totalMessages = escalation.messages?.length || 0
  const userMessages = escalation.messages?.filter(m => m.sender === 'user')?.length || 0
  const botMessagesNotResolved = totalMessages - userMessages

  return (
    <div className={`rounded-lg border-l-4 ${config.borderColor} ${config.color} p-4`}>
      {/* Header with Status */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusIcon size={18} className="text-gray-600" />
            <h3 className="font-bold text-lg text-gray-900">{escalation.userName}</h3>
          </div>
          <p className="text-xs text-gray-500">ID: {escalation.userId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl">{getEmotionEmoji(escalation.emotion)}</span>
          <span className={`inline-block rounded-full ${config.color} px-3 py-1 text-xs font-bold text-gray-900 border`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Why Escalated */}
      <div className="mb-4 rounded-lg bg-white/70 p-3 border-l-2 border-orange-400">
        <div className="flex items-start gap-2 mb-2">
          <Zap size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-gray-700 mb-1">ESCALATION REASON</p>
            <p className="text-sm text-gray-800 font-medium">
              {escalation.emotion === 'angry' && '🚨 Customer is ANGRY - immediate attention needed'}
              {escalation.emotion === 'frustrated' && '⚠️ Customer is FRUSTRATED - multiple attempts failed'}
              {escalation.emotion === 'calm' && '📞 Customer requested human support'}
              {escalation.emotion === 'confused' && '❓ Customer confused - needs clarification'}
            </p>
          </div>
        </div>
      </div>

      {/* AI-Generated Summary */}
      <div className="mb-4 rounded-lg bg-white/70 p-3">
        <p className="text-xs font-bold text-gray-700 mb-2">📋 AI SUMMARY</p>
        <p className="text-sm text-gray-700 leading-relaxed">{escalation.summary}</p>
      </div>

      {/* Detailed Insights Grid */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/50 p-2.5">
          <p className="text-xs text-gray-600 font-medium">Emotion Level</p>
          <p className="text-lg font-bold text-gray-900 capitalize">{escalation.emotion}</p>
        </div>
        <div className="rounded-lg bg-white/50 p-2.5">
          <div className="flex items-center gap-1">
            <MessageSquare size={14} className="text-gray-600" />
            <p className="text-xs text-gray-600 font-medium">Conversation</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{totalMessages} msg</p>
        </div>
        <div className="rounded-lg bg-white/50 p-2.5">
          <p className="text-xs text-gray-600 font-medium">Bot Attempts</p>
          <p className="text-lg font-bold text-gray-900">{botMessagesNotResolved}</p>
        </div>
        <div className="rounded-lg bg-white/50 p-2.5">
          <p className="text-xs text-gray-600 font-medium">Escalated</p>
          <p className="text-xs font-mono text-gray-700">{formatDate(escalation.createdAt)}</p>
        </div>
      </div>

      {/* Conversation History Preview */}
      <div className="mb-4 rounded-lg bg-white/70 p-3 max-h-48 overflow-y-auto">
        <p className="text-xs font-bold text-gray-700 mb-2">💬 CONVERSATION HISTORY</p>
        <div className="space-y-2">
          {escalation.messages?.slice(-4).map((msg, idx) => (
            <div key={idx} className={`text-xs p-2 rounded ${
              msg.sender === 'user' 
                ? 'bg-blue-100 text-blue-900 text-right' 
                : 'bg-gray-200 text-gray-900'
            }`}>
              <p className="font-medium mb-0.5">{msg.sender === 'user' ? '👤 Customer' : '🤖 AI'}</p>
              <p className="leading-snug">{msg.text?.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {escalation.status === 'pending' && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Assign to Agent:</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select an agent...</option>
            {agents.map(agent => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
          <button
            onClick={() => {
              if (selectedAgent) {
                onAssign(escalation.id, selectedAgent)
                setSelectedAgent('')
              }
            }}
            disabled={!selectedAgent}
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            📞 Assign to Agent
          </button>
        </div>
      )}

      {escalation.status === 'assigned' && (
        <div className="mb-2">
          <p className="text-sm text-gray-700 font-medium mb-2">
            Assigned to: <span className="font-bold text-blue-600">{escalation.assignedAgent}</span>
          </p>
        </div>
      )}

      {escalation.status === 'assigned' && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Resolution Notes:</label>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Enter how you resolved this issue..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm h-20 focus:border-green-500 focus:outline-none"
            rows="3"
          />
          <button
            onClick={() => {
              onResolve(escalation.id, resolution)
              setResolution('')
            }}
            disabled={!resolution.trim()}
            className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
          >
            ✅ Mark as Resolved
          </button>
        </div>
      )}

      {escalation.status === 'resolved' && (
        <div className="rounded-lg bg-white/70 p-3 border-l-2 border-green-400">
          <p className="text-xs font-bold text-green-700 mb-2">✓ RESOLUTION</p>
          <p className="text-sm text-gray-700">{escalation.resolution}</p>
        </div>
      )}
    </div>
  )
}

export default EscalationCard
