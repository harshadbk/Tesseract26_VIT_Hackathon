import React, { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatInput from '../components/ChatInput'
import ChatMessage from '../components/ChatMessage'
import ConversationPreview from '../components/ConversationPreview'
import TypingIndicator from '../components/TypingIndicator'
import { useConversation } from '../context/ConversationContext'
import { getEmotionMeta, getRiskMeta } from '../utils/helpers'

const ChatPage = () => {
  const navigate = useNavigate()
  const messageEndRef = useRef(null)
  const messageContainerRef = useRef(null)
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
    if (!messageContainerRef.current) return
    messageContainerRef.current.scrollTo({
      top: messageContainerRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }, [currentConversation?.messages?.length, isLoading])

  const currentEmotion = useMemo(
    () => getEmotionMeta(currentConversation?.emotion || aiInsights?.emotion || 'calm'),
    [aiInsights?.emotion, currentConversation?.emotion]
  )
  const risk = useMemo(() => getRiskMeta(aiInsights?.riskLevel || 'low'), [aiInsights?.riskLevel])
  const actions = useMemo(
    () => (Array.isArray(aiInsights?.actionsTaken) ? aiInsights.actionsTaken : []),
    [aiInsights?.actionsTaken]
  )

  if (!currentConversation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app">
        <div className="scale-in">
          <p className="text-sm font-medium text-slate-600">Preparing SmartVoice Support...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 overflow-hidden bg-app px-3 py-3 md:px-5 md:py-4">
      <div className="mx-auto grid h-full min-h-0 w-full max-w-7xl gap-3 lg:grid-cols-[260px,1fr,280px]">
        <aside className="panel-surface vivid-surface tone-sky hidden min-h-0 rounded-2xl p-4 slide-in-left lg:flex lg:flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display title-gradient text-lg font-bold">SmartVoice</h2>
              <p className="text-xs text-slate-500">Customer sessions</p>
            </div>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 status-pulse">Live</span>
          </div>

          <div className="mb-4 space-y-2">
            {users.map((user, idx) => (
              <button
                key={user.id}
                type="button"
                onClick={() => startConversation(user.id, user.name)}
                style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
                className={`enter-2 btn-press w-full rounded-xl border px-3 py-2 text-left text-sm transition-all duration-300 ${
                  currentConversation.userId === user.id
                    ? 'border-sky-300 bg-sky-50 text-sky-900 shadow-sm shadow-sky-100'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                }`}
              >
                {user.name}
              </button>
            ))}
          </div>

          <div className="mb-2 border-t border-slate-200/50 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent conversations</h3>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
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

        <section className="panel-surface vivid-surface tone-emerald flex h-full min-h-0 flex-col overflow-hidden rounded-2xl enter-1">
          <header className="border-b border-slate-200/50 bg-white/85 px-4 py-3 backdrop-blur-lg md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display title-gradient text-xl font-bold">Voice Support Assistant</h1>
                <p className="text-sm text-slate-500">
                  Active user: <span className="font-semibold text-slate-700">{currentConversation.userName}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-press inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-400 hover:bg-slate-100 hover:shadow-md"
              >
                📊 Dashboard &gt;
              </button>
            </div>
          </header>

          {currentConversation.isEscalated && (
            <div className="border-b border-rose-200 bg-gradient-to-r from-rose-50/90 to-orange-50/90 px-4 py-3 md:px-6 soft-appear">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-rose-700 flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                  This case is escalated to a human agent.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn-press rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition-all duration-300 hover:bg-rose-100 hover:shadow-sm"
                >
                  Open Agent Dashboard
                </button>
              </div>
            </div>
          )}

          <div
            ref={messageContainerRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-chat px-4 py-5 md:px-6"
          >
            {currentConversation.messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="scale-in max-w-md rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-sm">
                  <p className="text-3xl mb-3">💬</p>
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

        <aside className="panel-surface vivid-surface tone-indigo hidden min-h-0 rounded-2xl p-4 slide-in-right lg:flex lg:flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display title-gradient text-lg font-bold">Support Insights</h2>
              <p className="text-xs text-slate-500">Live support intelligence</p>
            </div>
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 status-pulse">Realtime</span>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 glow-breathe">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detected Emotion</p>
              <p className={`mt-1 text-sm font-semibold transition-all duration-500 ${currentEmotion.toneClass}`}>{currentEmotion.label}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 enter-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Intent</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {String(aiInsights?.intent || 'general inquiry').replaceAll('_', ' ')}
              </p>
              <p className="mt-1 text-xs text-slate-500">Confidence: {(Number(aiInsights?.confidence || 0) * 100).toFixed(0)}%</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 enter-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Risk Level</p>
              <span className={`mt-1 inline-flex rounded-full border px-2 py-1 text-xs font-semibold transition-all duration-500 ${risk.chipClass}`}>
                {risk.label}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 enter-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Processing Steps</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {actions.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <span className="inline-block h-1 w-1 rounded-full bg-sky-400"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {currentConversation.isEscalated && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 soft-appear">
                <p className="text-sm font-semibold text-rose-700 flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                  Escalated to human agent
                </p>
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
