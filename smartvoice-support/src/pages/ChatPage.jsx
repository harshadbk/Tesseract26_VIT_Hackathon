import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Menu, X, AlertCircle, Brain, TrendingUp } from 'lucide-react'
import { useConversation } from '../context/ConversationContext'

const ChatPage = () => {
  const navigate = useNavigate()
  const ctx = useConversation()
  const { 
    currentConversation, 
    startConversation, 
    addMessage,
    detectEmotion,
  } = ctx

  const [isInitialized, setIsInitialized] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [aiInsights, setAiInsights] = useState({
    intent: 'none',
    confidence: 0,
    riskLevel: 'low',
    emotion: 'calm',
    actionsTaken: []
  })

  const demoUsers = [
    { id: 'USR001', name: 'John Doe' },
    { id: 'USR002', name: 'Sarah Smith' },
    { id: 'USR003', name: 'Mike Johnson' }
  ]

  useEffect(() => {
    if (!isInitialized && startConversation) {
      try {
        startConversation(demoUsers[0].id, demoUsers[0].name)
        setSelectedUser(demoUsers[0])
        setIsInitialized(true)
      } catch (e) {
        console.error('Failed to initialize:', e)
      }
    }
  }, [isInitialized, startConversation])

  const getRiskLevel = (emotion, messageCount) => {
    if (emotion === 'angry') return { level: 'critical', color: 'text-red-600', bg: 'bg-red-50' }
    if (emotion === 'frustrated') return { level: 'high', color: 'text-orange-600', bg: 'bg-orange-50' }
    if (messageCount > 5) return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { level: 'low', color: 'text-green-600', bg: 'bg-green-50' }
  }

  const detectIntent = (text) => {
    if (/order|where|status|delivery|tracking/.test(text.toLowerCase())) return 'order_status'
    if (/refund|money|paid|charge/.test(text.toLowerCase())) return 'refund_request'
    if (/cancel|stop|remove/.test(text.toLowerCase())) return 'cancel_order'
    if (/product|issue|broken|wrong/.test(text.toLowerCase())) return 'product_issue'
    return 'general_inquiry'
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (inputValue.trim() && currentConversation && addMessage) {
      try {
        addMessage(inputValue, 'user')
        const emotion = detectEmotion(inputValue)
        const intent = detectIntent(inputValue)
        const riskInfo = getRiskLevel(emotion, (currentConversation.messages?.length || 0) + 1)

        // Update AI Insights
        setAiInsights({
          intent,
          confidence: Math.random() * 0.4 + 0.6, // 60-100%
          riskLevel: riskInfo.level,
          emotion,
          actionsTaken: ['STT Processing ✓', 'Intent Recognition ✓', 'Sentiment Analysis ✓']
        })

        setInputValue('')
        
        // Simulate bot response with context awareness
        setTimeout(() => {
          const responses = {
            order_status: 'I found your order. It\'s currently in transit and expected to arrive tomorrow. Would you like tracking details?',
            refund_request: 'I can help you with a refund. Let me check your order details and process options.',
            cancel_order: 'I can help cancel your order. Let me verify the order details first.',
            product_issue: 'I\'m sorry to hear about the product issue. Can you describe what happened?',
            general_inquiry: 'How can I assist you today?'
          }
          addMessage(responses[intent] || responses.general_inquiry, 'bot')
        }, 1000)
      } catch (e) {
        console.error('Error:', e)
      }
    }
  }

  if (!currentConversation) {
    return <div className="flex h-screen items-center justify-center"><p>Loading...</p></div>
  }

  const riskInfo = getRiskLevel(currentConversation.emotion, currentConversation.messages?.length || 0)

  return (
    <div className="flex h-screen gap-4 bg-gray-100 p-4">
      {/* Main Chat Section */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
        <header className="border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Phone size={24} className="text-blue-600" />
              <div>
                <h1 className="font-bold">SmartVoice Support</h1>
                <p className="text-xs text-gray-500">AI-Powered Customer Support</p>
              </div>
            </div>
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded">
              {showMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div className="border-t pt-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Go to Agent Dashboard
            </button>
          </div>
          
          {showMenu && (
            <div className="space-y-2 border-t pt-3">
              <p className="text-xs font-medium text-gray-500">SELECT USER</p>
              {demoUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    if (startConversation) startConversation(user.id, user.name)
                    setSelectedUser(user)
                    setShowMenu(false)
                  }}
                  className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                    selectedUser?.id === user.id ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  👤 {user.name}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {currentConversation.messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-5xl mb-4">👋</p>
                <h3 className="text-lg font-semibold">Welcome to SmartVoice</h3>
                <p className="text-gray-600 mt-2">Start by describing your issue...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentConversation.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-lg px-4 py-2 max-w-xs font-medium ${
                    msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
                  }`}>
                    {msg.text}
                    {msg.sender === 'user' && msg.emotion && (
                      <div className="text-xs mt-1 opacity-80">
                        {msg.emotion === 'angry' ? '😠' : msg.emotion === 'frustrated' ? '😤' : '😊'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="border-t bg-white p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type or speak your issue..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-medium"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* AI Insights Sidebar */}
      <div className="w-80 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={20} />
            <h2 className="font-bold">AI Intelligence</h2>
          </div>
          <p className="text-xs opacity-90">Real-time Analysis & Decision Engine</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current Emotion */}
          <div className={`rounded-lg p-3 ${riskInfo.bg}`}>
            <p className="text-xs font-semibold text-gray-600 mb-2">DETECTED EMOTION</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {currentConversation.emotion === 'angry' ? '😠' : 
                 currentConversation.emotion === 'frustrated' ? '😤' : 
                 currentConversation.emotion === 'happy' ? '😊' : '😌'}
              </span>
              <span className={`font-bold text-lg ${riskInfo.color}`}>
                {currentConversation.emotion?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className={`rounded-lg p-3 ${riskInfo.bg}`}>
            <p className="text-xs font-semibold text-gray-600 mb-2">RISK LEVEL</p>
            <div className="flex items-center justify-between">
              <span className={`font-bold ${riskInfo.color}`}>
                {riskInfo.level.toUpperCase()}
              </span>
              {riskInfo.level !== 'low' && (
                <AlertCircle size={18} className={riskInfo.color} />
              )}
            </div>
            {riskInfo.level !== 'low' && (
              <p className="text-xs text-gray-700 mt-2">⚠️ Monitor for escalation</p>
            )}
          </div>

          {/* Detected Intent */}
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">INTENT</p>
            <div>
              <p className="text-sm font-bold text-blue-700 capitalize">
                {aiInsights.intent.replace('_', ' ')}
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${aiInsights.confidence * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Confidence: {(aiInsights.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Processing Actions */}
          <div className="rounded-lg bg-purple-50 p-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">PROCESSING</p>
            <div className="space-y-1">
              {aiInsights.actionsTaken.map((action, idx) => (
                <p key={idx} className="text-xs text-purple-700">
                  {action}
                </p>
              ))}
            </div>
          </div>

          {/* Message Count */}
          <div className="rounded-lg bg-gray-200 p-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">CONVERSATION</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Messages</span>
              <span className="font-bold text-lg text-gray-900">
                {currentConversation.messages?.length || 0}
              </span>
            </div>
          </div>

          {/* Escalation Status */}
          {currentConversation.isEscalated && (
            <div className="rounded-lg bg-red-50 p-3 border-2 border-red-400">
              <p className="text-xs font-semibold text-red-700 mb-2">⚠️ ESCALATED</p>
              <p className="text-xs text-red-600">
                Case handed to human agent. Summary generated.
              </p>
            </div>
          )}
        </div>

        {/* Decision Engine Footer */}
        <div className="border-t bg-gray-50 p-3 text-center">
          <p className="text-xs text-gray-600">
            {riskInfo.level === 'critical' || riskInfo.level === 'high' ? (
              <span className="font-bold text-red-600">🚨 Ready to Escalate</span>
            ) : (
              <span className="text-green-600">✅ Service Layer Active</span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
