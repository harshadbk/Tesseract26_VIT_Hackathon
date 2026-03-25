import React, { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Brain, LayoutDashboard, ShieldAlert, Sparkles } from 'lucide-react'
import ChatInput from '../components/ChatInput'
import ChatMessage from '../components/ChatMessage'
import ConversationPreview from '../components/ConversationPreview'
import TypingIndicator from '../components/TypingIndicator'
import { useConversation } from '../context/ConversationContext'
import { getEmotionMeta, getRiskMeta } from '../utils/helpers'

const ChatPage = () => {
  const navigate = useNavigate()
  const messageEndRef = useRef(null)
  const {
    users,
    conversations,
    currentConversation,
    isLoading,
    aiInsights,
    startConversation,
    sendUserMessage
  } = useConversation()

  useEffect(() => {
    if (!currentConversation && users.length > 0) {
      startConversation(users[0].id, users[0].name)
    }
  }, [currentConversation, startConversation, users])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConversation?.messages?.length, isLoading])

  const currentEmotion = useMemo(
    () => getEmotionMeta(currentConversation?.emotion || aiInsights.emotion || 'calm'),
    [aiInsights.emotion, currentConversation?.emotion]
  )
  const risk = useMemo(() => getRiskMeta(aiInsights.riskLevel), [aiInsights.riskLevel])

  if (!currentConversation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app">
        <p className="text-sm font-medium text-slate-600">Preparing SmartVoice Support...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[280px,1fr,300px]">
        <aside className="hidden rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur lg:flex lg:flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">SmartVoice</h2>
              <p className="text-xs text-slate-500">Customer sessions</p>
            </div>
            <Sparkles size={16} className="text-sky-500" />
          </div>

          <div className="mb-4 space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => startConversation(user.id, user.name)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  currentConversation.userId === user.id
                    ? 'border-sky-300 bg-sky-50 text-sky-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {user.name}
              </button>
            ))}
          </div>

          <div className="mb-2 border-t border-slate-200 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent conversations</h3>
          </div>

          <div className="space-y-2 overflow-y-auto">
            {conversations.map((conversation) => (
              <ConversationPreview
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === currentConversation.id}
                onClick={() => startConversation(conversation.userId, conversation.userName)}
              />
            ))}
          </div>
        </aside>

        <section className="flex min-h-[82vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Voice Support Assistant</h1>
                <p className="text-sm text-slate-500">
                  Active user: <span className="font-semibold text-slate-700">{currentConversation.userName}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              >
                <LayoutDashboard size={16} />
                Agent Dashboard
                <ArrowRight size={14} />
              </button>
            </div>
          </header>

          {currentConversation.isEscalated && (
            <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-rose-700">This case is escalated to a human agent.</p>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Open Agent Dashboard
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto bg-chat px-4 py-5 md:px-6">
            {currentConversation.messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-md rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-center">
                  <h2 className="text-lg font-bold text-slate-900">Start the conversation</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Ask about order delays, refunds, cancellation, or wrong product delivery. Use voice or text.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {currentConversation.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messageEndRef} />
              </div>
            )}
          </div>

          <ChatInput
            onSendMessage={sendUserMessage}
            emotion={currentConversation.emotion || aiInsights.emotion}
            isLoading={isLoading}
          />
        </section>

        <aside className="hidden rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur lg:flex lg:flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Insights</h2>
              <p className="text-xs text-slate-500">Live support intelligence</p>
            </div>
            <Brain size={18} className="text-sky-500" />
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detected Emotion</p>
              <p className={`mt-1 text-sm font-semibold ${currentEmotion.toneClass}`}>{currentEmotion.label}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Intent</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {String(aiInsights.intent || 'general inquiry').replaceAll('_', ' ')}
              </p>
              <p className="mt-1 text-xs text-slate-500">Confidence: {(aiInsights.confidence * 100 || 0).toFixed(0)}%</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Risk Level</p>
              <span className={`mt-1 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${risk.chipClass}`}>
                {risk.label}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Processing Steps</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {aiInsights.actionsTaken.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>

            {currentConversation.isEscalated && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-rose-600" />
                  <p className="text-sm font-semibold text-rose-700">Escalated to human agent</p>
                </div>
                <p className="mt-2 text-xs text-rose-700">{currentConversation.summary || 'Summary prepared for dashboard.'}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ChatPage
